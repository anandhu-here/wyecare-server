
module.exports = (app, db) => {
    app.post('/fcm/update-token', async(req, res)=>{
        const { token, userId } = req.body;
        try{
            const query = await db.query(`
                update users set fcm_token = $1 where id = $2 returning *;
            `, [token. userId])
            res.status(200).send(query.rows[0])
        }
        catch(error){
            res.status(400).send(error)
        }
    })
    
}