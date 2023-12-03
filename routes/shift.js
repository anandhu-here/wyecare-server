const { verifyToken, checkShiftAssign, upload, hashPassword } = require("../controller/util");
const { sendNotification } = require("../firebase");
const { isAuth, isHome, isAdmin } = require("../middlewares/auth");
const shift = require("../models/shift");

module.exports = (app, db, io) =>{

    app.post('/shifts/update-sheet-code', async(req, res)=>{
        try{
            const {code, home_id, date} = req.body;
            const hash = hashPassword(code);

            const query = await db.query(`
                update home_guest_user set code = ${hash} where home_id = ${home_id} and date = ${date}; 
            `)
            res.status(200).send(query.rows)
        }
        catch(error){
            res.status(400).send(error)
        }
    })

    app.get('/shifts/get-patterns', async(req, res)=>{
        try{
            const query = await db.query(`
                select * from shift_patterns 
            `)
            res.status(200).send(query.rows)
        }
        catch(error){
            res.status(400).send(error)
        }
    })
    app.post('/shifts/add', isAuth, async(req, res)=>{
        
        const { date, home_id, agency_id, patterns, fcm_token} = req.body;
        const token = req.headers.authorization;
        
        const {id, user} = verifyToken(token);
        try{
            const checkShiftQuery = await db.query(`
                SELECT id FROM shift
                WHERE date = $1 AND agency_id = $2 AND home_id = $3
            `, [date, agency_id, home_id]);

            let shiftId;

            if (checkShiftQuery.rows.length > 0) {
                // Shift with the same date, agency_id, and home_id exists, so use its shift_id
                shiftId = checkShiftQuery.rows[0].id;
            } else {
                // Shift does not exist, so insert a new shift and get its shift_id
                const insertShiftQuery = await db.query(`
                    INSERT INTO shift (date, agency_id, home_id) 
                    VALUES ($1, $2, $3)
                    RETURNING id
                `, [date, agency_id, home_id]);

                shiftId = insertShiftQuery.rows[0].id;
            }

            
            const shifts = [];


            for (const pattern of patterns) {
                const queryShiftHome = await db.query(`
                    INSERT INTO shift_home (pattern, home_id, agency_id, count, shift_id, assigned, completed)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (pattern, home_id, agency_id, shift_id)
                    DO UPDATE SET count = $4
                    returning *;
                `, [pattern.pattern, home_id, agency_id, pattern.count, shiftId, '{}', '{}']);

                shifts.unshift(queryShiftHome.rows[0])
            }

            console.log(shifts, 'shifts')

            const fcm_agency_query = await db.query(`select user_id from agency where id = ${agency_id}`);

            const fcm_user_query = await db.query(`select id, fcm_token from users where id = ${fcm_agency_query.rows[0].user_id}`)

            const fcm_query = await db.query(`select company from home where id = ${home_id}`)
            
            const notificationQuery = await db.query(`
                insert into notifications ( date, sender, reciever, description, title, isUnRead, type )
                values ( $1, $2, $3, $4, $5, $6, $7 )
                returning * 
            `, [date, home_id, agency_id, `${fcm_query.rows[0].company} has added shifts`, 'Shifts added', true, 'shift']);
            sendNotification(fcm_user_query.rows[0].fcm_token, 'Shifts published', `${fcm_query.rows[0].company} has added new shifts`, {notification:notificationQuery.rows[0], shifts:[...shifts]}).then(response=>{
                console.log('notificaiton sent')
            }).catch(error=>{
                console.log(error, 'fcm error')
            })
            
            res.status(201).send({message:'Success'})
        }
        catch(e){
            console.log(e, "error")
            res.status(400).send({error:e.message})
        }
        
    })
    app.post('/shifts/add/bulk', isHome, async(req, res)=>{
        const token = req.headers.authorization;
        const {id} = verifyToken(token);
        const {shifts} = req.body;
        
        db.Home.findOne({where:{userId:id}}).then(home=>{
            db.Shift.bulkCreate(shifts).then(shifts=>{
                home.addShifts(shifts);
                res.status(201).send(shifts);
                io.emit('shifts_added', {shifts:shifts.length, home:home.company})
            }).catch(e=>{
                res.status(400).send({error:e.message})
            })
        }).catch(e=>{
            res.status(400).send({error:e.message})
        })
    })
    app.get('/shifts/list/carer', isAuth, async(req, res)=>{
        const token = req.headers.authorization;
        const { id, agency_id, carer_id } = req.query;
        console.log(agency_id, carer_id, "idsss")
        try{
            const query = await db.query(`
                SELECT shift_home.*, shift.date, home.company
                FROM shift_home
                join shift on shift.id = shift_home.shift_id
                join home on home.id = shift_home.home_id
                WHERE $1::jsonb = ANY(assigned)
                AND shift_home.agency_id = $2

            `, [carer_id, agency_id])
            console.log(query.rows, "ro")
            res.status(200).send(query.rows)
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/list/home', isAuth, async(req, res)=>{
        const token = req.headers.authorization;
        const { month, id } = req.query;
        try{
            const query = await db.query(`
            SELECT
            sh.*,
            s.*,
            a.company,
            cn.new_jsonb_array_column AS assigned_carer_names
            FROM
                shift_home sh
            JOIN
                shift s ON s.id = sh.shift_id
            JOIN
                agency a ON a.id = sh.agency_id
            LEFT JOIN (
                SELECT
                    shift_home.id AS shift_home_id,
                    assigned AS assigned,
                    jsonb_agg(carers.firstname || ' ' || carers.lastname) AS new_jsonb_array_column
                FROM
                    shift_home
                LEFT JOIN
                    unnest(assigned) AS carer_id
                    ON true
                LEFT JOIN
                    carers
                    ON carers.id = carer_id::text::integer
                GROUP BY
                    shift_home.id, assigned
            ) cn ON cn.shift_home_id = sh.id
            WHERE
                s.home_id = ${id}

            ORDER BY s.date;
        
            `)

            res.status(200).send(query.rows);
        }
        catch(e){
            console.log(e, "eee")
            res.status(400).send({error:e.message})
        }
        
    })
    app.get('/shifts/list/agency/byhome', isAuth, async(req, res)=>{
        try {
            const { home_id } = req.query;
            console.log(req.query, "homeid")
            const query = await db.query(`
                select * from shift_home where id = ${home_id}
            `)
            console.log(query.rows)
            res.status(200).send(query.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).send(error);
        }
    }
    )
    
    app.get('/shifts/list/agency', async(req, res)=>{
        console.log("mairuu")
        const token = req.headers.authorization;
        const { month, id } = req.query;
        try{
            const query = await db.query(`
                select shift_home.*,shift.date, shift.custom,home.company from shift_home
                join shift on shift.id = shift_home.shift_id
                join home on home.id = shift_home.home_id
                where shift.agency_id = ${id}
            `)
            res.status(200).send(query.rows);
        }
        catch(e){
            console.log(e, "eee")
            res.status(400).send({error:e.message})
        }
        
    })
    app.get('/shifts/list/admin', isAuth, async(req, res)=>{
        const token = req.headers.authorization;
        const { month } = req.query;
        const {id} = verifyToken(token)
        try{
            db.Shift.findAll({where:{month:month}, include:[{
                as:'ass',
                include:[{
                    model:db.Carer,
                    as:'carer'
                }]
            }]}).then(shifts=>{
                res.status(200).send(shifts);
            }).catch(e=>{
                console.log(e);
                res.status(400).send({error:e.message})
            })
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
        
    })
    app.post(`/shifts/delete`, isHome, async (req, res)=>{
        const {id} = req.body;
        console.log(id, "id")
        try{
            const shift = await db.Shift.findOne({where:{id}});
            if(shift){
                shift.destroy()
                res.status(200).send({message:"Deleted"})
            }
            else{
                res.status(404).send({message:"No shift found"})
            }
        }
        catch(e){
            console.log(e, "ee")
            res.status(400).send({error:e.message})
        }
    })
    // app.post('/shifts/assign', isAuth, async(req, res)=>{
    //     const {data} = request.body;
    //     data.map(item=>{

    //     })
    //     try{
    //         data.map()
    //     }
    //     catch(e){
    //         res.status(400).send({error:e.message})
    //     }
    // })

    app.get('/get/carers/assign', async(req, res)=>{
        try{
            const {agency_id, month, year, day} = req.query;
            console.log(agency_id, month, year , day, '[[[')
            const carerQuery = await db.query(`
            select * from carers join availability av on av.carer_id = carers.id where agency_id = ${agency_id} and '${day}'::jsonb = any(av.days) and av.month = ${month} and av.year = ${year} and carers.status = 1;

            `, [  ])
            res.status(200).send(carerQuery.rows)
        }
        catch(e){
            console.log(e)
            res.status(500).send({error:e.message})
        }
    })
    app.post('/shifts/assign', async(req, res) =>{
        const { assigned } = req.body;
        try{

            for( var shift of assigned ){
                const { shift_home_id, carer_ids, completed} = shift;
                const set_query = await db.query(`
                    update shift_home
                    set assigned = $1::jsonb[],
                        completed = $2::jsonb[]
                    where id = ${shift_home_id}
                `, [carer_ids, completed])
                for(var carer_id of carer_ids){
                    const user = await db.query(`select carers.id, users.fcm_token from carers join users on users.id = carers.user_id where carers.id = ${carer_id};`)
                    console.log(user.rows[0], 'tokennnnn')
                    await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: user.rows[0].fcm_token,
                            sound: 'default',
                            title: 'Shifts assigned',
                            body: '',
                            data: { someData: 'goes here' },
                        }),
                    });
                }
            }


            const message = {
                
              };
            
            
            res.status(201).send({message:'Assigned'});
        }
        catch(e){
            console.log(e, "endiii")
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/get/home', isAuth, async(req, res) =>{
        try{
            const {id} = req.query;
            const asses = await db.Shift.findAll({where:{home_id:id}});
            res.status(200).send(asses);
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/get/admin', isAuth, async(req, res) =>{
        try{
            const {id} = req.query;
            const asses = await db.Shift.findAll({where:{home_id:id}});
            res.status(200).send(asses);
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/get/assigned/admin', isAuth, async(req, res) =>{
        try{
            const {id} = req.query;
            const asses = await db.Assigned.findAll();
            res.status(200).send(asses);
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    })
    app.post('/shifts/update', isAuth, async(req, res) =>{
        const { id, longday, night, late, early } = req.body;
        db.Shift.findOne({where:{id:id}}).then(shift=>{
            shift.update({
                longday:longday,
                night:night,
                late:late,
                early:early
            })
            res.status(201).send(shift);
        }).catch(e=>{
            res.status(400).send({error:e.message})
        })
    })
    app.post('/shifts/completed/cancel', async(req, res)=>{
        try {
            const { shift_home_id, comp, carer_id }  = req.body;
            const query = await db.query('update shift_home set completed = $1::jsonb[] where id = $2', [comp, shift_home_id]);
            const ts_del = await db.query(`delete from timesheet where carer_id = $1 and shift_home_id = $2`, [carer_id, shift_home_id]);
            res.status(200).send({message:'Success'});
        } catch (error) {
            res.status(400).send(error);
        }
    })
    app.post('/shifts/assign/cancel', async(req, res)=>{
        try{
            const {carer_id, shift_id, arr_name} = req.body;
            const query = db.query(`
                UPDATE shifts
                SET ${arr_name}_ass = (
                    SELECT array_agg(element)
                    FROM (
                        SELECT jsonb_set(elem, '{id}', '"${carer_id}"', false) AS element
                        FROM unnest(${arr_name}_ass) AS elem
                        WHERE (elem->>'id')::int <> ${carer_id}
                    ) AS subquery
                )
                WHERE id = ${shift_id};
            `)
            res.status(200).json({message:"Success"})

        }
        catch(e){
            console.log(e, "reeroror")
            res.status(400).send({error:e.message})
        }
    } )
    app.post('/shifts/assign/cancel/request', isAuth, async(req, res)=>{
        try{
            const {id, name} = req.body;

            const ass = await db.Assigned.findOne({where:{id}});
            const request = await db.CancelRequest.create({shiftId:id, name:name})
            io.emit("cancel_request_carer", {name:name, id:id});
            res.status(200).send({message:"Request sent"})
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    } )
    app.post('/shifts/cancel', isAuth, async(req, res)=>{
        try{
            const {id} = req.body;

            const ass = await db.Shift.findOne({where:{id}});
            ass.destroy()
            res.status(200).send({message:"Success"})
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
    } )
    app.post('/shifts/timesheet/create', isAuth, async(req, res)=>{
        try{
            const {shift_home_id, carer_id, agency_id, date, sign, home_id, pattern, updated, hash} = req.body;
            const shiftquery = await db.query(`select sh.code from home_guest_user sh where home_id = ${home_id}`);
            if(shiftquery.rows.length > 0){
                console.log(shiftquery.rows[0].code, hash);
                if(shiftquery.rows[0].code === hash){
                    const timesheet = await db.query(`
                    insert into timesheet (signature, carer_id, home_id, agency_id, date, shift_home_id, pattern)
                    values ($1, $2, $3, $4, $5, $6, $7)
                    `, [ sign, carer_id, home_id , agency_id, date, shift_home_id, pattern])
                    const update = await db.query(`
                        update shift_home set completed = $1::jsonb[] where id = ${shift_home_id}
                    `, [updated])
                    res.status(201).send({message:'success'});
                }
                else{
                    res.status(403).send({message:'Could not verify todays shift'});
                }

                
            }
            else{

                res.status(404).send({message:'Employeer not found'});
            }
            
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    } )

    app.post('/shifts/finish',isAuth, async (req, res)=>{
        const {sign, authName, authPos, type, shiftId, carerId, homeName}  = req.body;
        console.log(req.body, "body")

        try{
            const shift = await db.Shift.findOne({where:{id:shiftId}});
            const carer = await db.Carer.findOne({where:{id:carerId}});

            if(shift && carer){
                const sheet = await db.Timesheet.create({authName, authPos,homeName, sign, type});
                if(sheet){
                    shift.addSheet(sheet);
                    carer.addSheet(sheet);
                    res.status(201).send({message:"created"})
                }
            }
        }
        catch(e){
            console.log(e.message, "errrioror")
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/timesheets/list/carer', isAuth, async(req, res)=>{
        const {carer_id, home_id, startDate, endDate } = req.query;
        console.log(home_id, typeof startDate)
        try{
            
            const start_date = startDate==="null"?null:startDate; // Set to your start date value or null
            const end_date = endDate==="null"?null:endDate; // Set to your end date value or null
            const homeId = home_id === "null"?null:home_id; // Set to your home_id value or null

            console.log(typeof start_date, '0')
            const query = `
            SELECT timesheet.*, home.company 
            FROM timesheet
            JOIN home ON home.id = timesheet.home_id
            WHERE carer_id = $1
            AND (
                (timesheet.date >= $2 AND timesheet.date <= $3)
                OR ($2 IS NULL AND $3 IS NULL)
                AND (timesheet.home_id = $4 OR $4 IS NULL)
            )
            `;

            const queryParams = [carer_id, start_date, end_date, homeId];
            const ts = await db.query(query, queryParams)
            console.log(ts)
            res.status(200).send(ts.rows)
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })

    app.get('/shifts/timesheets/list/agency', isAuth, async(req, res)=>{
        const {agency_id, home_id, startDate, endDate } = req.query;
        console.log(home_id, typeof startDate)
        try{
            
            const start_date = startDate==="null"?null:startDate; // Set to your start date value or null
            const end_date = endDate==="null"?null:endDate; // Set to your end date value or null
            const homeId = home_id === "null"?null:home_id; // Set to your home_id value or null

            const query = `
            SELECT timesheet.*, home.company, carers.firstname, carers.lastname 
            FROM timesheet
            JOIN home ON home.id = timesheet.home_id
            JOIN carers on carers.id = timesheet.carer_id
            WHERE timesheet.agency_id = $1
            AND (
                (timesheet.date >= $2 AND timesheet.date <= $3)
                OR ($2 IS NULL AND $3 IS NULL)
                AND (timesheet.home_id = $4 OR $4 IS NULL)
            )
            `;

            const queryParams = [agency_id, start_date, end_date, homeId];
            const ts = await db.query(query, queryParams)
            console.log(ts)
            res.status(200).send(ts.rows)
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/timesheets/list/home', isAuth, async(req, res)=>{
        const {carer_id, home_id, startDate, endDate } = req.query;
        console.log(home_id, typeof startDate)
        try{
            const carer_id = 6;
            const start_date = startDate==="null"?null:startDate; // Set to your start date value or null
            const end_date = endDate==="null"?null:endDate; // Set to your end date value or null
            const homeId = home_id === "null"?null:home_id; // Set to your home_id value or null

            console.log(typeof start_date, '0')
            const query = `
            SELECT timesheet.*, home.company 
            FROM timesheet
            JOIN home ON home.id = timesheet.home_id
            WHERE carer_id = $1
            AND (
                (timesheet.date >= $2 AND timesheet.date <= $3)
                OR ($2 IS NULL AND $3 IS NULL)
                AND (timesheet.home_id = $4 OR $4 IS NULL)
            )
            `;

            const queryParams = [carer_id, start_date, end_date, homeId];
            const ts = await db.query(query, queryParams)
            res.status(200).send(ts.rows)
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/shifts/get/admin/data', isAuth, async(req, res)=>{
        const {id} = req.query;
        const date = new Date();
        console.log(date.getDate(), date.getMonth()+1)
        try{
            const data = await db.Shift.findAll({where:{day:date.getDate(), month:date.getMonth()+1},include:[{
                model:db.Home,
                as:"home",
                attributes:['company']
            }]});
            console.log(data, "endiii")
            res.status(200).send(data);
        }
        catch(e){
            console.log("66666", e.message)
            res.status(400).send({error:e.message})
        }
    })

    app.get('/carer/get/agency/homes', async(req, res)=>{
        try {
            const { agency_id } = req.query;
            const homes = await db.query(`
            select home.*, users.email from home 
            inner join home_agency on home.id = home_agency.home_id 
            inner join users on users.id = home.user_id
            where home_agency.agency_id = ${agency_id}
            `)
            res.status(200).send(homes.rows)
        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }
    })

}