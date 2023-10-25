const { Pool } = require('pg');
const { Storage } = require('@google-cloud/storage')

// Initialize storage
const storage = new Storage({
  keyFilename: `./bucket/velvety-broker-401923-f8ad88a12fb3.json`,
})
const bucketName = 'wyecare-bucket'
const bucket = storage.bucket(bucketName)


const pool = new Pool({
    host:'127.0.0.1',
    database:'mycare',
    password:'blackbird',
    user:'postgres',
    port:5432
})

module.exports = {pool, bucket};
