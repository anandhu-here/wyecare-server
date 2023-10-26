const express = require('express');
const router = require('./routes/index');
const {pool} = require('./db/db.js');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');

const cors = require('cors');



const bucketName = 'wyecare-bucket'
const bucket = storage.bucket(bucketName)



const app = express();

app.use(cors({
    origin:'*'
}))
app.use('/public/uploads',express.static(__dirname + '/public/uploads/'))

app.use(bodyParser.json());


const server = app.listen(8080, (req, res)=>{
    console.log('App running')
})
router(app, pool)










