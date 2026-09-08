// Replace every empty value with the Firebase Web App configuration from the
// Firebase console. Do not add Admin SDK credentials or private keys here.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
