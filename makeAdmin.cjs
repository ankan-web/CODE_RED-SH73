const admin = require("firebase-admin");

// initialize with service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// The email of the user you want to make admin
const email = "admin@example.com";

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ ${email} is now an admin!`);
  } catch (error) {
    console.error("Error setting admin role:", error);
  }
}

setAdmin();
