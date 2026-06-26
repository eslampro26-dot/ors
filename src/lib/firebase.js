
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// معرف قاعدة البيانات الجديد
const databaseId = "9Evrgg7IPODZgBc21XKQ";

// Initialize Firebase (prevent re-initialization in dev hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let db;
try {
  // استخدام معرف قاعدة البيانات الجديد إذا كان متاحاً
  const customDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId;
  db = initializeFirestore(app, { 
    experimentalForceLongPolling: true,
    databaseId: customDbId
  });
} catch (e) {
  db = getFirestore(app);
}

export { db };
export default app;
