import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA3Q9bwzj9Xr05ha_gMIMrg-pOTIhSeCTI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'orluxus.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'orluxus',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'orluxus.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '872645887221',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:872645887221:web:bff0ea7fd48b18f21e31bc',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RHDWKRF546'
};

// Default database ID
const databaseId = "(default)";

// Initialize Firebase (prevent re-initialization in dev hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let db;
try {
  let customDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId;
  if (customDbId === "9Evrgg7IPODZgBc21XKQ") {
    customDbId = "(default)";
  }

  // ✅ Enable IndexedDB offline persistence - THIS IS CRITICAL
  // Without this, pending writes are lost on page reload, causing edits to disappear.
  // With this, all writes are stored in IndexedDB and synced to Firebase when online.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true,
    databaseId: customDbId,
    ignoreUndefinedProperties: true
  });
} catch (e) {
  // Fallback: persistence might fail in Safari private mode or SSR
  console.warn('Firestore persistence unavailable, using memory cache:', e?.message);
  try {
    let customDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId;
    if (customDbId === "9Evrgg7IPODZgBc21XKQ") customDbId = "(default)";
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      databaseId: customDbId,
      ignoreUndefinedProperties: true
    });
  } catch (e2) {
    console.error('Firestore initialization error:', e2);
    db = getFirestore(app);
  }
}

// Firebase Auth — used for verified Google sign-in on reviews
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { db, auth, googleProvider };
export default app;
