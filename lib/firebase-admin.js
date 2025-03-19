// lib/firebase-admin.js
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if it hasn't been initialized already
let adminApp;
if (!getApps().find(app => app.name === 'admin')) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, 'admin');
} else {
  adminApp = getApp('admin');
}

const adminStorage = getStorage(adminApp);

export { adminStorage };