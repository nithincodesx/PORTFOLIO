import { getApps, initializeApp, type FirebaseApp } from "firebase/app";

/**
 * Firebase web configuration.
 *
 * These NEXT_PUBLIC_* values identify your Firebase project — they are public
 * by design (every Firebase web app ships them in its bundle) and are NOT
 * secrets. Real security is enforced by:
 *   1. Firebase Authentication (who can sign in to /control)
 *   2. Firestore security rules (who can write — see firestore.rules)
 *
 * Never put service-account keys, admin passwords, or other server secrets
 * in NEXT_PUBLIC_* variables.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when the required Firebase web config env vars are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | null = null;

/** Returns the shared Firebase app instance, or null when not configured. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}
