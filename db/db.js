const { Pool } = require('pg');
const aws = require('aws-sdk');
const { S3 } = require('aws-sdk');

// const { Storage } = require('@google-cloud/storage')

// // Initialize storage
// const storage = new Storage({
//   keyFilename: `./bucket/velvety-broker-401923-f8ad88a12fb3.json`,
// })
// const bucketName = 'wyecare-bucket'
// const bucket = storage.bucket(bucketName)

const s3 = new aws.S3({
    accessKeyId: 'AKIATFR52UK4KHZVJ67B',
    secretAccessKey: 'vl75WGYhql+JA+JEyuk9jOIOxzjtbhW1FFk8qAAJ',
    region: 'eu-west-2', // Replace with your AWS region
  });
  

const pool = new Pool({
    host:'127.0.0.1',
    database:'mycare',
    password:'blackbird',
    user:'postgres',
    port:5432
})

module.exports = {pool, s3};
