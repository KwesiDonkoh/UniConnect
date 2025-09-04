import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCslfTN6E517THNrf4KAs4L8DzVgu5aIpQ",
    authDomain: "uniconnect-cedf3.firebaseapp.com",
    projectId: "uniconnect-cedf3",
    storageBucket: "uniconnect-cedf3.firebasestorage.app",
    messagingSenderId: "682619823833",
    appId: "1:682619823833:web:e281e93bbf5b53e0a440c8",
    measurementId: "G-V879DBCXEH"
  };

// Initialize Firebase only if it hasn't been initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  // First try to initialize auth with persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  // If already initialized, get the existing instance
  console.log('Firebase Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Firestore with persistent cache
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
  console.log('Firestore initialized with persistent cache');
} catch (error) {
  // If already initialized, get the existing instance
  console.log('Firestore already initialized, using existing instance');
  db = getFirestore(app);
}

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app; 