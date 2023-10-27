

module.exports = (app, db) =>{
    app.post('/doc/upload', async(req, res, next)=>{
        const {id, location, name} = req.body
        try{
            const query = await db.query(`
                insert into documents (name, location, carer_id) values ($1, $2, $3) returning *;
            `, [name, location, id])
            res.status(201).send(query.rows[0]);
        } catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/docs/get', async(req, res)=>{
        const {id} = req.query;
        try{
            const query = await db.query(`
                select * from documents where carer_id = ${id};
            `)
            res.status(201).send(query.rows);
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.messsage})

        }
    })
    app.post('/docs/delete', async(req, res)=>{
        const {id} = req.body;
        try{
            const query = await db.query(`delete from documents where id = ${id}`)
            res.status(200).send({message:"Success"});
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.messsage})

        }
    })

    // CERTIFICTES

    app.post('/certificate/upload', async(req, res, next)=>{
        const {id, location, name} = req.body
        try{
            const query = await db.query(`
                insert into certificates (name, location, carer_id) values ($1, $2, $3) returning *;
            `, [name, location, id])
            res.status(201).send(query.rows[0]);
        } catch(e){
            console.log(e)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/certificates/get', async(req, res)=>{
        const {id} = req.query;
        try{
            const query = await db.query(`
                select * from certificates where carer_id = ${id};
            `)
            res.status(201).send(query.rows);
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.messsage})

        }
    })
    app.post('/certificates/delete', async(req, res)=>{
        const {id} = req.body;
        try{
            const query = await db.query(`delete from certificates where id = ${id}`)
            res.status(200).send({message:"Success"});
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:e.messsage})

        }
    })
}