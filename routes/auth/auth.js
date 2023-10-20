const { hashPassword, createToken, comparePassord, verifyToken, createTokenGuest } = require("../../controller/util");
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
            const {username, password, home_id} = req.body;
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
                    INSERT into home_guest_user (username, password, home_id)
                        values ($1, $2, $3)
                        returning id, username, home_id
                `
                const result = await db.query(query, [username, hash, userExist.rows[0].id]);
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
            console.log(firstname, lastname, address, city, postcode, phone, dob, user_id, agency_id, staff, "fuck")
            const carer_query = `
                INSERT INTO carers (firstname, lastname, address, city, postcode, phone, dob, user_id, agency_id, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `

            const carer_results = await db.query(carer_query, [firstname, lastname, address, city, postcode, phone, dob, user.id, agency_id, staff]);
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
    app.post('/login', login, async(req, res)=>{
        const { email, password } = req.body;
        try{
            const userQuery = await db.query(`
                select * from users where email = $1
            `, [email])

            if(userQuery.rows.length > 0){
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
                res.status(401).send({error:'Unauthorized'})
            }
            
            
            
        }catch(e){
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
            console.log(agency_id, "ppp888")
            const carerQuery = await db.query(`
                select carers.*, agency.company from carers 
                join agency on agency.id = carers.agency_id
                where agency_id = $1 
            `, [ agency_id ])
            res.status(200).send(carerQuery.rows)
        }
        catch(e){
            res.status(500).send({error:e.message})
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
        try{
            const query = await db.query(`
                insert into home_agency_request (home_id, agency_id, createdAt) values ($1, $2, $3)
            `, [home_id, agency_id, date])
            const query2 = await db.query(`
                insert into home_agency 
                (home_id, agency_id, status)
                values($1, $2, $3)
            `, [home_id, agency_id, 0])
            res.status(200).send(query.rows[0])
        }
        catch(e){
            res.status(400).send(e)
        }
        
    })
    app.post('/home/accept-request', async (req, res)=>{
        const {req_id, ha_id} = req.body;
        // db.Carer.findOne({where:{id:1}}).then(u=>u.destroy()).catch(e=>console.log(e))
        const date = new Date();
        try{
            const query = await db.query(`
                delete from home_agency_request where id = $1;
            `, [req_id])
            const query2 = await db.query(`
                update home_agency set status = $1 where id = $2;
            `, [ha_id, 1])
            res.status(200).send(query.rows[0]);
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
                select home.*, users.email, home_agency.id as ha_id from home 
                inner join home_agency on home.id = home_agency.home_id 
                inner join users on users.id = home.user_id
                where home_agency.agency_id = $1
            `, [ agency_id ])

            console.log(agencyQuery.rows, "9090900")
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
                select agency.*, users.email, home_agency.id as ha_id from agency 
                inner join home_agency on agency.id = home_agency.agency_id 
                inner join users on agency.user_id = users.id
                where home_agency.home_id = $1
            `, [home_id])
            res.status(200).json(query.rows)
        } catch (error) {
            res.status(400).send({error:e.message})
        }
    })
    app.get('/get/agents', async(req, res)=>{
        try{
            const agencyQuery = await db.query(`
                select * from agency
            `)
            res.status(200).json(agencyQuery.rows)
        } catch(e){
            console.log(e, "suck")
            res.status(400).send({error:e.message})
        }
    })
    app.get('/user', (req, res)=>{
        const { email } = req.query;
        // db.User.findOne({where:{email}}).then(user)
        db.User.findOne( { where:{ email }} ).then(user=>{
            if(!user){
                res.status(404).json({error:'User not Found'})
            }
            else{
                if(user.role === "HOME"){
                    db.User.findOne( { where:{ email }, include:[{
                        model:db.Home,
                        as:'home'
                    }]} ).then(user=>{
                        res.status(200).send({user})
                    }).catch(e=>{
                        res.status(400).send({error:e.message})
                    })
                }
                else if(user.role === "CARER"){
                    db.User.findOne( { where:{ email }, include:[{
                        model:db.Carer,
                        as:'carer'
                    }]} ).then(user=>{
                        res.status(200).send({usr})
                    }).catch(e=>{
                        res.status(400).send({error:e.message})
                    })
                }
            }
            
        }).catch(e=>{
            res.status(400).send({error:e.message})
        })
    })
    app.post('/update/profile', async (req, res)=>{
        try{
            const { firstName, lastName, phone, postcode, adress1, city, dob, company } = req.body;
            const token = req.headers.authorization
            try{
                const {id, email, role} = verifyToken(token);
                if(role === "HOME"){
                    console.log(email, "email")
                    db.Home.findOne({where:{userId:id}}).then(home=>{
                        home.update({
                            ...req.body
                        })
                        res.status(201).send({message:"Updated"})
                    }).catch(e=>{
                        res.status(400).send({error:e.messsage})
                    })   
                }
                else if(role === "CARER"){
                    db.Carer.findOne({where:{userId:id}}).then(carer=>{
                        carer.update({
                            ...req.body
                        })
                        res.status(201).send({message:"Updated"})
                    }).catch(e=>{
                        res.status(400).send({error:e.messsage})
                    })   
                }
            }
            catch(e){
                res.status(400).send({error:'Invalid Token'})
            }
            
        }
        catch(e){
            res.status(400).send({error:e.messsage})
        }
    })
    app.post('/docname/add', (req, res)=>{
        const { names } = req.body;
        db.DocNames.bulkCreate(names).then(res=>{
            console.log(res)
        }).catch(e=>{

        })
    })
    
}