const { upload } = require("../controller/util")

module.exports = (app, db) =>{
    app.post('/doc/upload', upload.single('file'), async(req, res, next)=>{
        const {id, name} = req.body
        try{
            const file = req.file;
            if(file){

                console.log(file.buffer, "file")
                
                res.status(200).send({message:'suuu '})

            }
            else{
                console.log("no file ")
            }
            
        } catch(e){
            console.log(e.message)
            res.status(400).send({error:e.message})
        }
    })
    app.get('/get/docs', async(req, res)=>{
        const {id} = req.query;
        try{
            const docs = await db.Doc.findAll({where:{carerId:id}});
            const names = await db.DocNames.findAll({attributes:['name']});
            if(!docs){

                res.status(200).send(names);
            }
            else{
                const names_ = names.map(n=>n.name);
                const docs_ = docs.map(n=>n.name);
                const final_docs = new Set(docs_);
                var final = names_.filter(i=>!final_docs.has(i))

                res.status(200).send(final);
            }
        }
        catch(e){
            console.log(e.message)
            res.status(400).send({error:e.messsage})

        }
    })
    app.get('/get/documents', async(req, res)=>{
        const {id} = req.query;
        try{
            const doc  = await db.Doc.findAll({where:{carerId:id}});
            res.status(200).send(doc);
        }
        catch(e){
            console.log(e.message)
            res.status(400).send({error:e.messsage})

        }
    })
}