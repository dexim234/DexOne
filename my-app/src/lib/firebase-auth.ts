import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app!);

let currentUser: User | null = null;
let userId: string | null = null;

// Initialize anonymous auth
export const initializeAuth = async (): Promise<string> => {
  console.log("🔐 Initializing Firebase Auth...");
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        userId = user.uid;
        console.log("✅ Auth successful, userId:", userId);
        unsubscribe();
        resolve(user.uid);
      } else {
        // No user, sign in anonymously
        console.log("🔑 Signing in anonymously...");
        signInAnonymously(auth)
          .then((userCredential) => {
            currentUser = userCredential.user;
            userId = userCredential.user.uid;
            console.log("✅ Anonymous auth successful, userId:", userId);
            unsubscribe();
            resolve(userCredential.user.uid);
          })
          .catch((err) => {
            console.error("❌ Auth failed:", err);
            reject(err);
          });
      }
    });
  });
};

export const getCurrentUser = (): User | null => currentUser;
export const getCurrentUserId = (): string | null => userId;
