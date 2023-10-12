const jwt = require('jsonwebtoken');
const bcpt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

require('dotenv').config()


const createToken = ({ id, email, role }) =>{
    const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '24h' })
    return token 
}
const createTokenGuest = ({ id, username, role }) =>{
    const token = jwt.sign({ id, username, role }, process.env.JWT_SECRET, { expiresIn: '24h' })
    return token 
}

const verifyToken = (token) =>{
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {expiresIn:'24h'});
    return decoded;
}

const hashPassword = (password) =>{
    const h = bcpt.hashSync(password, 10);
    return h;
}

const comparePassord = (password, hash) => bcpt.compareSync(password, hash);


const checkShiftAssign = (shift, carers) =>{
    const {longday, night, early, late} = shift;
    if(longday + night + early + late < carers.length){
        return {error:"Too many assignments", status:1};
    }

    var data = {longday:0, night:0, late:0, early:0};

    carers.map(c=>{
        data[c.type] += 1;

    })
    console.log(data, "data", longday, night)
    if(data["longday"] > longday){
        return {error:"Too many longday assignments", status:1};
    }
    if(data["night"] > night){
        return {error:"Too many night assignments", status:1};
    }
    if(data["early"] > early){
        return {error:"Too many early assignments", status:1};
    }
    if(data["late"] > late){
        return {error:"Too many late assignments", status:1};
    }
    return { error:"NULL", status:0 }

}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(path.dirname(require.main.filename), '/public/uploads/'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
var upload = multer({ storage: storage })


module.exports = { createToken, verifyToken, hashPassword, upload, comparePassord, checkShiftAssign, createTokenGuest}

