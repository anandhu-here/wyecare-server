const { sendNotification } = require("../firebase");

module.exports = (app, db) => {
    app.post('/fcm/update-token', async(req, res)=>{
        const { token, userId } = req.body;
        console.log(token, userId, 'ff')
        try{
            const query = await db.query(`
                update users set fcm_token = $1 where id = $2;
            `, [token, userId])

            
            res.status(200).send(query.rows[0])
        }
        catch(error){
            console.log(error, 'error')
            res.status(400).send(error)
        }
    })
    app.get('/fcm/get-notifications', async(req, res)=>{
        const { reciever } = req.query;
        try{
            const query = await db.query(`
                select * from notifications where reciever = $1
            `, [reciever])

            
            res.status(200).send(query.rows[0])
        }
        catch(error){
            console.log(error, 'error')
            res.status(400).send(error)
        }
    })

    // app.post('/fcm/send-token', async(req, res)=>{
    //     const { userId} = req.body;
    //     try{
    //         const query = await db.query(`
    //             select id from users where id = $1;
    //         `, [userId])

    //         sendNotification()
            
    //         res.status(200).send(query.rows[0])
    //     }
    //     catch(error){
    //         console.log(error, 'error')
    //         res.status(400).send(error)
    //     }
    // })



}