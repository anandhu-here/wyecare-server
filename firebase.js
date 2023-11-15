var admin = require("firebase-admin");

var serviceAccount = require("./config/fcm_config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



// Send FCM notification to a specific device token



export const sendNotification = (token, title, body, data) =>{
    return new Promise((resolve, reject)=>{
        const message = {
            notification: {
              title,
              body,
              data
            },
            data,
            token: deviceToken,
          };
      
        admin.messaging().send(message).then(response=>{
            resolve(response)
        }).catch(error=>{
            reject(error)
        })
    })
}