const express = require('express');
const router = require('./routes/index');
const {pool} = require('./db/db.js');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');



const app = express();
app.use(express.static(path.join(__dirname, 'build')));

// Define a catch-all route to serve your React app's HTML file


app.use(cors({
    origin:"*"
}))
app.use('/public/uploads',express.static(__dirname + '/public/uploads/'))

app.use(bodyParser.json());


const server = app.listen(8080, (req, res)=>{
    console.log('App running')
})
router(app, pool);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});










