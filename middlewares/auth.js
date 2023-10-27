const { verify } = require('jsonwebtoken');
const { verifyToken } = require('../controller/util');
const {pool} = require('../db/db');

const login = (req, res, next) =>{
    const { email, password } = req.body;
    if(!email){
        return res.status(400).send({error:'email not valid'})
    }
    if(!password){
        return res.status(400).send({error:'password not valid'})
    }
    next()
}

const signup = async ( req, res, next ) =>{
    const { email, password, role } = req.body;
    const user = await pool.query(`
        SELECT * from users WHERE email = $1
    `, [email])
    if(user.rows.length>0){
        return res.status(400).send({error:'User already exists!'})
    }

    if(!email){
        return res.status(400).send({error:'email not valid'})
    }
    if(!password){
        return res.status(400).send({error:'password not valid'})
    }
    next()
}

const isAuth = async (req, res, next) =>{
    try{
        const t = req.headers.authorization;
        const token = t.split(" ").length>1?t.split(" ")[1]:t.split(" ")[0];
        console.log(token, "hello")
        const {id, email} = verifyToken(token);
        next();
    }
    catch(e){
        console.log(e, "error")
        return res.status(400).send({error:'Unauthorized'})
    }
}
const isAdmin = async (req, res, next) =>{
    try{
        const t = req.headers.authorization;
        const token = t.split(" ").length>1?t.split(" ")[1]:t.split(" ")[0];
        const {id, email, role} = verifyToken(token);
        if(role === 'ADMIN'){
            next();
        }
        else{
            return res.status(400).send({error:'Unauthorized'})
        }
        next();
    }
    catch(e){
        return res.status(400).send({error:'Unauthorized'})
    }
}
const isHome = async (req, res, next) =>{
    try{
        const t = req.headers.authorization;
        const token = t.split(" ").length>1?t.split(" ")[1]:t.split(" ")[0];
        const {id, email, role} = verifyToken(token);
        
        if(role === 'HOME'){
            next();
        }
        else{
            return res.status(400).send({error:'Unauthorized'})
        }
    }
    catch(e){
        return res.status(400).send({error:'Unauthorized'})
    }
}

module.exports = { login, signup, isAuth, isHome, isAdmin }