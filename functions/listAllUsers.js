const functions = require("firebase-functions");
const admin = require("firebase-admin");

try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Simple HTTPS function that lists Firebase Auth users (paginated up to 1000)
// Protect with a header `x-admin-key` matching process.env.ADMIN_API_KEY for basic protection.
exports.listAllUsers = functions.https.onRequest(async (req, res) => {
  const key = req.get("x-admin-key") || req.query.key;
  const expected = process.env.ADMIN_API_KEY || functions.config().admin?.key;
  if (!expected || key !== expected) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const list = [];
    let nextPageToken = undefined;
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      result.users.forEach((u) => {
        list.push({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          providerData: u.providerData,
          metadata: u.metadata,
        });
      });
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    res.json({ users: list });
  } catch (err) {
    console.error("listAllUsers error", err);
    res.status(500).json({ error: err.message });
  }
});
