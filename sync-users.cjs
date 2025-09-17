// This is a one-time script to read all users from Firebase Authentication
// and create corresponding documents for them in your Firestore 'users' collection.

const admin = require("firebase-admin");

// Make sure this path points to your actual service account key file.
const serviceAccount = require("./serviceAccountKey.json");

console.log("Initializing Firebase Admin SDK...");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function backfillUsers() {
  console.log("Starting user backfill process...");
  const usersToSync = [];
  let nextPageToken;

  try {
    // Fetch all users, handling pagination for large user bases
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        usersToSync.push(userRecord.toJSON());
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Found ${usersToSync.length} total users in Authentication.`);
    if (usersToSync.length === 0) {
      console.log("No users to sync. Exiting.");
      return;
    }

    const usersCollectionRef = db.collection("users");
    let batch = db.batch();
    let writeCount = 0;
    let syncedCount = 0;

    for (const user of usersToSync) {
      const userDocRef = usersCollectionRef.doc(user.uid);

      // --- FIX STARTS HERE ---
      // Safely handle potentially missing or invalid date strings from Firebase Auth.
      const creationTime = user.metadata.creationTimestamp
        ? new Date(user.metadata.creationTimestamp)
        : new Date();
      const lastLoginTime = user.metadata.lastSignInTimestamp
        ? new Date(user.metadata.lastSignInTimestamp)
        : creationTime;
      // --- FIX ENDS HERE ---

      batch.set(
        userDocRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null,
          createdAt: creationTime, // Use the safe date object
          lastLogin: lastLoginTime, // Use the safe date object
          status: "active",
          emailVerified: user.emailVerified,
        },
        { merge: true } // Use merge to avoid overwriting existing data
      );

      writeCount++;

      // Firestore batches have a limit of 500 operations.
      if (writeCount === 499) {
        await batch.commit();
        syncedCount += writeCount;
        console.log(`Committed a batch of ${writeCount} users...`);
        batch = db.batch(); // Start a new batch
        writeCount = 0;
      }
    }

    // Commit the final batch if there are any remaining writes
    if (writeCount > 0) {
      await batch.commit();
      syncedCount += writeCount;
      console.log(`Committed the final batch of ${writeCount} users...`);
    }

    console.log(
      `\n✅ Success! Synced a total of ${syncedCount} users to Firestore.`
    );
  } catch (error) {
    console.error("\n❌ Error during backfill process:", error);
  }
}

backfillUsers();
