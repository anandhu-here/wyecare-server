const { hashPassword, createToken, comparePassord, verifyToken, createTokenGuest } = require("../../controller/util");
const { sendNotification } = require("../../firebase");
const { login, signup, isAdmin, isAuth } = require("../../middlewares/auth");


const crypto = require('crypto');

function getRandomHash(length = 32) {
  const randomBytes = crypto.randomBytes(length);
  const hash = crypto.createHash('sha256').update(randomBytes).digest('hex');
  return hash;
}

module.exports = (app, db) => {

    app.get('/', (req, res)=>{
        res.status(200).send({message:'hello'})
    })

    app.post('/create-guest-user', async(req, res)=>{
        try {
            const {username, password, home_id, role} = req.body;
            const userExist = await db.query(`
            select home.id from home 
            join users on users.id = home.user_id
            where users.email = $1
            `, [username])
            if(userExist.rows.length === 0){
                res.status(404).send({message:'User not found'})
            }
            else{
                const hash = hashPassword(password);
                const query = `
                    INSERT into home_guest_user (username, password, home_id, role)
                        values ($1, $2, $3, $4)
                        returning id, username, home_id, role
                `
                const result = await db.query(query, [username, hash, userExist.rows[0].id, role]);
                res.status(200).send(result.rows[0])
            }
            
        } catch (error) {
            console.log(error, "error")
            res.status(400).send(error)
        }
    })
    app.post('/signup', signup, async (req, res)=>{
        try{
            const { email, password, role_:role } = req.body;
        const hash = hashPassword(password);
        const query = `
            INSERT into users (email, password, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role
        `;
        const user_result = await db.query(query, [email, hash, role]);
        const user = user_result.rows[0];
        const token = createToken(user);

        console.log("userid", user.id)

        if(user.role === 3){
            const {firstname, lastname, address, city, postcode, phone, dob, home_id, agency_id, staff} = req.body;
            const carer_query = `
                INSERT INTO home_staff (firstname, lastname, address, city, postcode, phone, dob, user_id, home_id, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `

            const carer_results = await db.query(carer_query, [firstname, lastname, address, city, postcode, phone, dob, user.id, home_id, staff]);
            res.status(201).send({
                token,
                user:{
                    user,
                    profile:carer_results.rows[0]
                }
            })
        }

        else if(user.role === 2){
            const {firstname, lastname, address, city, postcode, phone, dob, user_id, agency_id, staff} = req.body;
            console.log(req.body, "pppppppp")
            const carer_query = `
                INSERT INTO carers (firstname, lastname, address, city, postcode, phone, dob, user_id, agency_id, role, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `

            const carer_results = await db.query(carer_query, [firstname, lastname, address, city, postcode, phone, dob, user.id, agency_id, staff, 0]);
            res.status(201).send({
                token,
                user:{
                    user,
                    profile:carer_results.rows[0]
                }
            })
        }
        else if(user.role === 1){
            const {company, address, city, postcode, phone, user_id, agency_id} = req.body;
            const home_query = `
                INSERT INTO home (company, address, city, postcode, phone, user_id, active_agency)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `

            const addHomeQuery = `
                insert into home_agency (home_id, agency_id) values ($1, $2)
            `


            const home_results = await db.query(home_query, [company, address, city, postcode, phone, user.id, agency_id]);
            const add_home_results = await db.query(addHomeQuery, [home_results.rows[0].id, agency_id ])
            console.log(add_home_results, "ppp")
            res.status(201).send({
                token,
                user:{
                    user,
                    profile:home_results.rows[0]
                }
            })
        }
        else if(user.role === 0){
            const {company, address, city, postcode, phone, user_id, shifts} = req.body;
            const agency_query = `
                INSERT INTO agency (company, address, city, postcode, phone, user_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `

            const agency_results = await db.query(agency_query, [company, address, city, postcode, phone, user.id]);

            
            for(var shift of shifts){
                const shift_register = await db.query(`
                    insert into agency_shift_pattern (agency_id, pattern) values (${agency_results.rows[0].id}, ${shift})
                `)
            }
            
            
            res.status(201).send({
                token,
                user:{
                    user,
                    profile:agency_results.rows[0]
                }
            })
        }

        else{
            res.status(400).send({mesage:"Role error"})
        }

        
        }
        catch(error){
            console.log(error)
            res.status(400).send({mesage:error.message})
        }
    })
    app.post('/generate-qr', async(req, res)=>{
        const {email} = req.body;
        try{
            const randomHash = getRandomHash(10);
            console.log(randomHash, email, "fuckkk")
            const codeQuery = await db.query(
                `update home_guest_user set code = $2 where username = $1`, [email, randomHash]
            )
            res.status(200).send({hash:randomHash})

        }
        catch(error){
            console.log(error, "error")
            res.status(400).send(error)
        }
    })
    app.post('/login-guest', async(req, res)=>{
        try {
            const {email, password} = req.body;

            const query = await db.query(`
                select * from home_guest_user where username = $1
            `, [email])

            if(query.rows.length === 0){
                res.status(403).send({message:'Unauthorized'})
            }
            else{
                const user = query.rows[0];
                const token = createTokenGuest(user);
                var response = {
                    token:token,
                    user:{
                        user,
                        profile:{}
                    }
                }
                console.log(response, "response")
                res.status(200).send(response)
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    })
    app.post('/approve-carer', async(req, res)=>{
        try {
            const {carer_id, agency_id} = req.body;
            const query = await db.query(`update carers set status = 1 where id = ${carer_id} and agency_id = ${agency_id}`)
            res.status(201).send({message:'Success'})
        } catch (error) {
            console.log(error, "eee")
            res.status(400).send(error)
        }
    })
    app.post('/remove-carer', async(req, res)=>{
        try {
            const {carer_id, agency_id} = req.body;
            const query = await db.query(`update carers set status = 0 where id = ${carer_id} and agency_id = NULL`)
            res.status(201).send({message:'Success'})
        } catch (error) {
            console.log(error, "eee")
            res.status(400).send(error)
        }
    })
    app.post('/leave-agency-carer', async(req, res)=>{
        try {
            const {carer_id, agency_id} = req.body;
            const query = await db.query(`update carers set status = 0 where id = ${carer_id}`)
            res.status(201).send({message:'Success'})
        } catch (error) {
            console.log(error, "eee")
            res.status(400).send(error)
        }
    })


    
    app.post('/login', login, async(req, res)=>{
        const { email, password } = req.body;
        console.log(email)
        try{
            const userQuery = await db.query(`
                select * from users where email = $1
            `, [email])

            

            if(userQuery.rows.length > 0){
                console.log(userQuery.rows[0])
                const user = userQuery.rows[0];
                const token = createToken(user);
                var response = {
                    token:token,
                    user:{
                        user,
                        profile:null
                    }
                }
                var tables = ['agency', 'home', 'carers']
                const profile= await db.query(`
                    select * from ${tables[user.role]} where user_id = $1
                `, [user.id])
                response.user.profile = profile.rows[0];

                res.status(200).send(response)
                
                
            }
            else{
                console.log('errrrr')
                res.status(401).send({error:'Unauthorized'})
            }
            
            
            
        }catch(e){
            console.log(e, 'ee')
            res.status(400).send({error:e.message})
        }
        
    })
    app.post('/verify-user', async(req, res)=>{
        const { token, role } = req.body;
        try{
            const userData = verifyToken(token);
            const {role} = userData;
            if(role < 100){
                const {email} = userData;
                const userQuery = await db.query(`
                select * from users where email = $1
                `, [email])
                if(userQuery.rows.length > 0){
                    const user = userQuery.rows[0];
                    var response = {
                        token:token,
                        user:{
                            user,
                            profile:null
                        }
                    }
                    var tables = ['agency', 'home', 'carers']
                    
                    const profile= await db.query(`
                        select * from ${tables[user.role]} where user_id = $1
                    `, [user.id])

                    response.user.profile = profile.rows[0];

                    res.status(200).send(response)
                }
                else{
                    res.status(401).send({error:"Unauthorized"})
                }
                
            }
            else{
                const {username} = userData;
                const query = await db.query(`
                    select * from home_guest_user where username = $1
                `, [username])
                if(query.rows.length > 0){
                    const user = query.rows[0];
                    var response = {
                        token:token,
                        user:{
                            user,
                            profile:null
                        }
                    }

                    res.status(200).send(response)
                }
                else{
                    res.status(401).send({error:"Unauthorized"})
                }
            }
            
        }catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
        
    })
    app.get('/get/carers', async(req, res)=>{
        try{
            const {agency_id} = req.query;
            const carerQuery = await db.query(`
                select carers.*, agency.company from carers 
                join agency on agency.id = carers.agency_id
                where agency_id = $1;
            `, [ agency_id ])
            res.status(200).send(carerQuery.rows)
        }
        catch(e){
            res.status(500).send({error:e.message})
        }
    })
    app.get('/get/home_staffs', async(req, res)=>{
        try{
            const {home_id} = req.query;
            const homeStaffQuery = await db.query(`
                select home_staff.*, home.company from home_staff 
                join home on home.id = home_staff.home_id
                where home_id = $1;
            `, [ home_id ]);
            const guestStaffQuery = await db.query(`
                select home_guest_user.*, home.company from home_guest_user
                join home on home.id = home_guest_user.home_id
                where home_id = $1;
            `, [ home_id ]);
            const results = [...homeStaffQuery.rows, ...guestStaffQuery.rows]
            res.status(200).send(results)
        }
        catch(e){
            res.status(500).send({error:e.message})
        }
    })

    app.post('/update/profile', async(req, res)=>{
        const {updates, id, table} = req.body;
        try {

            console.log(updates, "uppp")
            
            const condition = `id = ${id}`;

            let query = `UPDATE ${table} SET `;

            Object.keys(updates).map(key=>{
                query += `${key} = '${updates[key]}', `;
            })


            query = query.slice(0, -2); // Remove the trailing comma and space
            query += ` WHERE ${condition};`;

            console.log(query, "query")

            const update = await db.query(query);
            res.status(200).send(update.rows)

        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    })

    

    app.post('/carer/leave-agent', async(req, res)=>{
        try{
            
        }
        catch(error){
            res.status(500).send(error)
        }
    })

    app.post('/remove/carer', async(req, res)=>{
        const {carer_id, token} = req.body;
        try {

            const {id} = verifyToken(token);

            const agency_query = await db.query(`select id from agency where user_id = ${id}`)

            console.log(agency_query, "--");
            
            
            const get = await db.query(`select agency_id from carers where id = ${carer_id}`);
            const agency_id = get.rows[0].agency_id;
            if(agency_id === agency_query.rows[0].id){
                const query = await db.query(`update carers set agency_id = NULL, agencies = agencies || ARRAY['${agency_id}']::jsonb[] where id = ${carer_id}`);
                res.status(200).send(query.rows[0])
            }

            else{

                res.status(403).send({message:"Agency not found"})
            }
            

        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }) 
    app.post('/remove/home', async(req, res)=>{
        const {home_id, token} = req.body;
        console.log(home_id, token, 'hometoken')
        try {

            const {id} = verifyToken(token);

            const agency_query = await db.query(`select id from agency where user_id = ${id}`)

            const agency_id = agency_query.rows[0].id
            const query = await db.query(`delete from home_agency where agency_id = ${agency_id} and home_id = ${home_id}`);
            const query2 = await db.query(`update home set active_agency = NULL where id = ${home_id}`);
            res.status(200).send({message:"OK"})
            

        } catch (error) {
            console.log(error, 'error delete')
            res.status(500).send(error)
        }
    }) 

    
    app.get('/get/allcarers', async(req, res)=>{
        try{
            const {home_id} = req.query;
            console.log(home_id, "ppp")
            const carerQuery = await db.query(`
                select carers.*, agency.company from carers
                inner join home_agency on home_agency.home_id = $1
                inner join agency on agency.id = carers.agency_id
            `, [ home_id ])
            res.status(200).json(carerQuery.rows)
        }
        catch(e){
            console.log(e, "error")
            res.status(500).send({error:e.message})
        }
    })
    app.post('/delete', async (req, res)=>{
        const {email} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        
        try{
            const user = await db.User.findOne({where:{email}});
            if(user){
                user.destroy();
                res.status(200).send({message:"User deleted"})
            }
            res.status(400).send({error:"User not found"})
        }
        catch(e){
            res.status(400).send({error:e.message})
        }
        
    })
    app.post('/home/join-request', async (req, res)=>{
        const {home_id, agency_id} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        const date = new Date();
        console.log('jjjjoooinnnnn')
        try{
            const query = await db.query(`
                insert into home_agency_request (home_id, agency_id, createdAt) values ($1, $2, $3)
            `, [home_id, agency_id, date])
            const query2 = await db.query(`
                insert into home_agency 
                (home_id, agency_id, status)
                values($1, $2, $3)
            `, [home_id, agency_id, 0])

            const getCompanyQuery = await db.query(`
                select company from agency where id = ${agency_id};
            `)

            const fcm_home_query = await db.query(`select user_id, company from home where id = ${home_id}`);

            const fcm_user_query = await db.query(`select id, fcm_token from users where id = ${fcm_home_query.rows[0].user_id}`)

            const notificationQuery = await db.query(`
                insert into notifications ( date, sender, reciever, description, title, isUnRead, type)
                values ( $1, $2, $3, $4, $5, $6, $7 )
                returning * 
            `, [date, agency_id, home_id, `${getCompanyQuery.rows[0].company} has sent a join request`, 'Join request', true, 'join']);

            sendNotification(fcm_user_query.rows[0].fcm_token, `${notificationQuery.rows[0].title}`, `${notificationQuery.rows[0].description}`, notificationQuery.rows[0]).then(response=>{
                console.log('notificaiton sent')
            }).catch(error=>{
                console.log(error, 'fcm error')
            })
            res.status(200).send(query.rows[0])
        }
        catch(e){
            console.log(e, 'eee')
            res.status(400).send(e)
        }
        
    })
    app.post('/home/accept-request', async (req, res)=>{
        const {home_id, agency_id, req_id} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        const date = new Date();
        try{
            const query = await db.query(`
                delete from home_agency_request where agency_id = $1 and home_id = $2;
            `, [agency_id, home_id])
            const query2 = await db.query(`
                update home_agency set status = $3 where agency_id = $1 and home_id = $2;
            `, [agency_id, home_id, 1])

            const getCompanyQuery = await db.query(`
                select company from home where id = ${home_id};
            `)

            const fcm_home_query = await db.query(`select user_id, company from agency where id = ${agency_id}`);

            const fcm_user_query = await db.query(`select id, fcm_token from users where id = ${fcm_home_query.rows[0].user_id}`)

            const notificationQuery = await db.query(`
                insert into notifications ( date, sender, reciever, description, title, isUnRead, type)
                values ( $1, $2, $3, $4, $5, $6, $7 )
                returning * 
            `, [date, home_id, agency_id, `${getCompanyQuery.rows[0].company} accepted your request`, 'Join request', true, 'accept']);

            sendNotification(fcm_user_query.rows[0].fcm_token, `${notificationQuery.rows[0].title}`, `${notificationQuery.rows[0].description}`, notificationQuery.rows[0]).then(response=>{
                console.log('notificaiton sent')
            }).catch(error=>{
                console.log(error, 'fcm error')
            })
            res.status(200).send(query.rows[0]);
        }
        catch(e){
            console.log(e)
            res.status(400).send(e)
        }
        
    })



    app.post('/carer/join-request', async (req, res)=>{
        const {carer_id, agency_id} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        const date = new Date();
        try{
            const query = await db.query(`
                update carers set agency_id = ${agency_id}, status = 0 where id = ${carer_id} returning *;
            `)
            res.status(200).send(query.rows[0])
        }
        catch(e){
            console.log(e)
            res.status(400).send(e)
        }
        
    })
    
    app.post('/carer/accept-request', async (req, res)=>{
        const {carer_id, agency_id} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        const date = new Date();
        try{
            const query = await db.query(`
                update carers set status = 1 where id = ${carer_id} returning *;
            `)
            res.status(200).send(query.rows[0])
        }
        catch(e){
            res.status(400).send(e)
        }
    })
    
    app.get('/search/homes', async(req, res)=>{
        try {
            const {home} = req.query;
            const query = await db.query(`select home.*, users.email from home join users on users.id = home.user_id where company ilike '${home}%'`);
            res.status(200).send(query.rows);
        } catch (error) {
            console.log(error, "errrrrr")
            res.status(400).send({error})
        }
    })
    app.get('/get/agent', async(req, res)=>{
        try {
            const {agency_id} = req.query;
            const query = await db.query(`select agency.*, users.email from agency join users on users.id = agency.user_id where agency.id = ${agency_id}`);
            res.status(200).send(query.rows);
        } catch (error) {
            console.log(error, "errrrrr")
            res.status(400).send({error})
        }
    })
    app.get('/search/agents', async(req, res)=>{
        try {
            const {agency} = req.query;
            const query = await db.query(`select * from agency where company ilike '${agency}%'`);
            res.status(200).send(query.rows);
        } catch (error) {
            console.log(error, "errrrrr")
            res.status(400).send({error})
        }
    })
    
    app.get('/get/homes', async(req, res)=>{
        try{
            const {agency_id} = req.query;
            const agencyQuery = await db.query(`
                select home.*, users.email, home_agency.status from home 
                inner join home_agency on home.id = home_agency.home_id 
                inner join users on users.id = home.user_id
                where home_agency.agency_id = $1
            `, [ agency_id ])
            res.status(200).json(agencyQuery.rows)
        } catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/get/homes/signup', async(req, res)=>{
        try {
            const query = await db.query(`
                select home.id, home.company from home
            `)

            res.status(200).send(query.rows)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    })
    app.get('/get/myagent', async(req, res)=>{
        try {
            const {home_id} = req.query;
            const query = await db.query(`
                select agency.*, users.email, home_agency.status from agency 
                inner join home_agency on agency.id = home_agency.agency_id 
                inner join users on agency.user_id = users.id
                where home_agency.home_id = $1
            `, [home_id])
            res.status(200).json(query.rows)
        } catch (error) {
            res.status(400).send({error:error.message})
        }
    })
    app.get('/get/agents', async(req, res)=>{
        try{
            const agencyQuery = await db.query(`
                select * from agency
            `)
            res.status(200).json(agencyQuery.rows)
        } catch(error){
            console.log(e, "suck")
            res.status(400).send({error:error.message})
        }
    })
    app.get('/get/myagent/carer', async(req, res)=>{
        try{
            const {agency_id} = req.query;
            const agencyQuery = await db.query(`
                select agency.*, users.email from agency join users on users.id = agency.user_id where agency.id = ${agency_id}
            `)
            res.status(200).json(agencyQuery.rows)
        } catch(error){
            console.log(e, "suck")
            res.status(400).send({error:error.message})
        }
    })

    app.post('/upload/dp', async(req, res)=>{
        const {id, dp} = req.body;
        try{
            const agencyQuery = await db.query(`
                update carers set profile_picture = $1 where id = $2 returning *;
            `, [dp, id])
            res.status(200).json(agencyQuery.rows[0])
        } catch(error){
            console.log(e, "suck")
            res.status(400).send({error:error.message})
        }
    })

    app.post('/send/availabilty', async(req, res)=>{
        const {carer_id, days, month, year} = req.body;
        try{
            const query = await db.query(`
                insert into availability 
                (carer_id, days, month, year) 
                values ($1, $2, $3, $4) 
                on conflict (carer_id)
                do update set days = availability.days || $2::jsonb[]
                WHERE availability.carer_id = $1
                returning *;
            `, [carer_id, days, month, year])

            res.status(200).send(query.rows[0])
        } catch(e){
            console.log(e, "suck")
            res.status(400).send({error:e.message})
        }
    })
    app.get('/get/availabilty', async(req, res)=>{
        const {carer_id, month, year} = req.query;
        try{
            
            const update = await db.query(`select * from availability where carer_id = ${carer_id} and month = ${month} and year = ${year}`);
            res.status(200).send(update.rows[0])

        } catch(e){
            console.log(e, "suck")
            res.status(400).send({error:e.message})
        }
    })


    
    
    
}