const { Pool } = require('pg');


const pool = new Pool({
    host:'127.0.0.1',
    database:'mycare',
    password:'blackbird',
    user:'postgres',
    port:5432
})

module.exports = pool;
