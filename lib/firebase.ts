// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// (اختياري) دالة لضمان وجود مستخدم قبل الكتابة على Firestore
export async function ensureSignedIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
}
