importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBtCLZ1_vGqeVPIfT2TdqwgAEHzGy3bPPI",
  authDomain: "wyecare-4b25e.firebaseapp.com",
  projectId: "wyecare-4b25e",
  storageBucket: "wyecare-4b25e.appspot.com",
  messagingSenderId: "925855734592",
  appId: "1:925855734592:web:e1a62965d64bb25552b8a5",
  measurementId: "G-MW5LJWNZCL"
} // firebaseConfig is required

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || payload.notification.image,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', (event) => {
  if (event.action) {
    clients.openWindow(event.action)
  }
  event.notification.close()
})