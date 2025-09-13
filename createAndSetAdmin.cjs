// createAndSetAdmin.cjs
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "admin@example.com";
const password = "StrongPassword123"; // set a secure password

async function createAndSetAdmin() {
  try {
    let user;
    try {
      // Try to get the user first
      user = await admin.auth().getUserByEmail(email);
      console.log(`User already exists: ${user.uid}`);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // If user doesn't exist, create it
        user = await admin.auth().createUser({
          email: email,
          password: password,
        });
        console.log(`User created: ${user.uid}`);
      } else {
        throw err;
      }
    }

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`${email} is now an admin!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Something went wrong:", error);
    process.exit(1);
  }
}

createAndSetAdmin();
