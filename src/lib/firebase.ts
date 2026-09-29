
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// IMPORTANT: Your provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiXZ-nNYTDT-_hCWCaZwazDiDbQlHLHfY",
  authDomain: "stafflink-id-dp-87884038-7a31a.firebaseapp.com",
  projectId: "stafflink-id-dp-87884038-7a31a",
  storageBucket: "stafflink-id-dp-87884038-7a31a.appspot.com",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
