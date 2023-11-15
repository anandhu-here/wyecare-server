var admin = require("firebase-admin");

var serviceAccount = require("./config/fcm_config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



// Send FCM notification to a specific device token



const sendNotification = (token, title, body, data) =>{
    return new Promise((resolve, reject)=>{
        const message = {
            data:{
                score:'1'
            },
            token: token,
          };
      
        admin.messaging().send(message).then(response=>{
            resolve(response)
        }).catch(error=>{
            reject(error)
        })
    })
}

module.exports = {sendNotification}