// setAdmin.js
const admin = require("firebase-admin");

// load your service account key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// paste the UID you copied from Firebase Authentication → Users
const uid = "qQ9wPU7PEPfKgIo0aXY0unrkIjV2";

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for user ${uid}`);
    process.exit();
  })
  .catch((error) => {
    console.error("❌ Error setting admin claim:", error);
    process.exit(1);
  });
