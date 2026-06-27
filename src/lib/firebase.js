
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA3Q9bwzj9Xr05ha_gMIMrg-pOTIhSeCTI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'orluxus.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'orluxus',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'orluxus.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '872645887221',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:872645887221:web:bff0ea7fd48b18f21e31bc',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RHDWKRF546'
};

// معرف قاعدة البيانات الافتراضي لمشروع Firebase المجاني
const databaseId = "(default)";

// Initialize Firebase (prevent re-initialization in dev hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let db;
try {
  // استخدام معرف قاعدة البيانات الجديد إذا كان متاحاً (مع تصحيح التلقائي للمعرف القديم الخاطئ)
  let customDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId;
  if (customDbId === "9Evrgg7IPODZgBc21XKQ") {
    customDbId = "(default)";
  }
  db = initializeFirestore(app, { 
    experimentalForceLongPolling: true,
    databaseId: customDbId
  });
} catch (e) {
  db = getFirestore(app);
}

export { db };
export default app;
