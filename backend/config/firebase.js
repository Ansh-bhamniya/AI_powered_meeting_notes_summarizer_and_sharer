// backend/config/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./mychat-794fb-firebase-adminsdk-fbsvc-58fd374c1b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
