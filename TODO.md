# Admin Section Rewrite Plan

## Information Gathered
- AdminDashboard.jsx contains all admin components inline, with duplicates (e.g., Icon, Card defined twice).
- Firebase Firestore is set up, with 'users' collection already used in UsersPage.
- Resources are currently mock data in state.
- Analytics are hardcoded values and placeholder chart data.
- No real-time calculations for analytics; need to fetch user data and compute metrics like total users, active users, user growth over time.
- Resources need to be stored in Firestore for dynamic CRUD operations.

## Plan
1. **Refactor AdminDashboard.jsx**:
   - Remove duplicate definitions (e.g., Icon, Card, PageHeader, etc.).
   - Clean up imports and structure.

2. **Update AnalyticsPage**:
   - Fetch all users from Firestore.
   - Calculate total users: length of users array.
   - Calculate active users: users with lastLogin within last 30 days (assume lastLogin field exists).
   - Calculate user growth: group users by month of createdAt, create chart data.
   - Fetch bookings if collection exists, calculate sessions booked.
   - Use real data for percentages (e.g., growth rates based on previous periods).

3. **Update ResourcesPage**:
   - Fetch resources from 'resources' collection on load.
   - Implement add, edit, delete using Firestore operations (addDoc, updateDoc, deleteDoc).
   - Update state after operations.

4. **Add necessary Firebase imports**:
   - addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, Timestamp.

5. **Enhance UsersPage**:
   - Already fetches users; ensure it handles loading and errors properly.

6. **Testing and Validation**:
   - Ensure Firestore rules allow admin read/write.
   - Test CRUD for resources.
   - Verify analytics calculations.

## Dependent Files
- src/admin/AdminDashboard.jsx (main file to edit)
- src/firebase.js (already set up)
- Firestore collections: users, resources, bookings (if exists)

## Followup Steps
- After edits, run the app and check admin dashboard.
- Add sample data to Firestore if needed.
- Update Firestore rules if necessary for admin access.
