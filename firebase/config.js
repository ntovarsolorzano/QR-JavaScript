/* ================================================================
   DoveQR — Firebase Configuration
   ================================================================

   SETUP INSTRUCTIONS
   ------------------
   1. Go to https://console.firebase.google.com
   2. Create a project (or select an existing one)
   3. Project Settings → General → Your apps → "Add app" (Web)
   4. Copy the firebaseConfig object and paste it below
   5. Uncomment the firebase.initializeApp(...) block
   6. In index.html, uncomment the three Firebase SDK <script> tags

   FIRESTORE DATA MODEL
   --------------------
   /users/{userId}/qrHistory/{entryId}
     url:       string    — the URL encoded in the QR
     dotStyle:  string    — 'square' | 'dots' | 'rounded' | 'smooth'
     fgColor:   string    — foreground hex colour
     bgColor:   string    — background hex colour
     iconId:    string    — brand icon id ('none', 'github', etc.)
     createdAt: timestamp — Firestore server timestamp

   MIGRATION PLAN
   --------------
   In js/app.js, three functions are ready to swap:
     • saveToHistory()  → FirebaseService.saveQRCode(entry)
     • loadHistory()    → FirebaseService.getQRHistory().then(renderHistory)
     • clearHistory()   → FirebaseService.deleteQRHistory()

   ================================================================ */

/*
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();
*/

/* Stub — keeps the rest of the app working before Firebase is wired up */
var FirebaseService = (function () {
  'use strict';

  return {
    isEnabled: false,

    saveQRCode: function (entry) {
      /*
        return db
          .collection('users/' + auth.currentUser.uid + '/qrHistory')
          .add({ ...entry, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      */
      console.info('[DoveQR] Firebase not yet configured — history saved locally.');
    },

    getQRHistory: function (limit) {
      /*
        return db
          .collection('users/' + auth.currentUser.uid + '/qrHistory')
          .orderBy('createdAt', 'desc')
          .limit(limit || 12)
          .get()
          .then(function (snap) {
            return snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
          });
      */
      console.info('[DoveQR] Firebase not yet configured — reading history locally.');
      return Promise.resolve([]);
    },

    deleteQRHistory: function () {
      /*
        // Batch-delete all history documents for current user
        return db
          .collection('users/' + auth.currentUser.uid + '/qrHistory')
          .get()
          .then(function (snap) {
            var batch = db.batch();
            snap.docs.forEach(function (d) { batch.delete(d.ref); });
            return batch.commit();
          });
      */
      console.info('[DoveQR] Firebase not yet configured — cleared history locally.');
      return Promise.resolve();
    },
  };
}());
