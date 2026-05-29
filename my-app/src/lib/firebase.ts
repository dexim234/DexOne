import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";

// Fallback config for local development without .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBPyESAvFn4wXG9OJjQv1zFcGnkKahJHE8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "onedex-osnova.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "onedex-osnova",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "onedex-osnova.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1032769450215",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1032769450215:web:3711c31a94f58d342c3242"
};

console.log("🔥 Firebase Config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase - check if already initialized
let app: FirebaseApp | null = null;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
export const db = getFirestore(app);
export { app };

// Firestore operations
export interface WalletData {
  id?: string;
  group: string;
  wallet: string;
  balance: string;
  active: boolean;
  lastActivity: number;
  name?: string;
  emoji?: string;
  userId?: string;
  createdAt?: Timestamp;
}

export interface GroupData {
  id?: string;
  name: string;
  emoji?: string;
  hidden?: boolean;
  pinned?: boolean;
  userId?: string;
  createdAt?: Timestamp;
}

export interface GroupData {
  id?: string;
  name: string;
  emoji?: string;
  hidden?: boolean;
  pinned?: boolean;
  userId?: string;
  createdAt?: Timestamp;
}

// Groups interface
export interface GroupData {
  id?: string;
  name: string;
  emoji?: string;
  hidden?: boolean;
  createdAt?: Timestamp;
}

export const walletCollection = collection(db, "wallets");
export const groupsCollection = collection(db, "groups");

// Create wallet
export const addWalletToFirestore = async (wallet: Omit<WalletData, "id">) => {
  try {
    const docRef = await addDoc(walletCollection, {
      ...wallet,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding wallet:", error);
    throw error;
  }
};

// Read all wallets
export const getWalletsFromFirestore = async (userId?: string) => {
  try {
    const q = userId 
      ? query(walletCollection, orderBy("createdAt", "desc"))
      : query(walletCollection, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const wallets: WalletData[] = [];
    querySnapshot.forEach((doc) => {
      wallets.push({
        id: doc.id,
        ...doc.data(),
      } as WalletData);
    });
    return wallets;
  } catch (error) {
    console.error("Error getting wallets:", error);
    throw error;
  }
};

// Update wallet
export const updateWalletInFirestore = async (walletId: string, updates: Partial<WalletData>) => {
  try {
    const walletDoc = doc(db, "wallets", walletId);
    await updateDoc(walletDoc, updates);
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

// Delete wallet
export const deleteWalletFromFirestore = async (walletId: string) => {
  try {
    const walletDoc = doc(db, "wallets", walletId);
    await deleteDoc(walletDoc);
  } catch (error) {
    console.error("Error deleting wallet:", error);
    throw error;
  }
};

// Group operations
export const addGroupToFirestore = async (group: Omit<GroupData, "id">) => {
  try {
    const docRef = await addDoc(groupsCollection, {
      ...group,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding group:", error);
    throw error;
  }
};

export const getGroupsFromFirestore = async () => {
  try {
    const q = query(groupsCollection, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const groups: GroupData[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data(),
      } as GroupData);
    });
    return groups;
  } catch (error) {
    console.error("Error getting groups:", error);
    throw error;
  }
};

export const updateGroupInFirestore = async (groupIdentifier: string, updates: Partial<GroupData>) => {
  try {
    // Try to find the group document by name
    const q = query(groupsCollection, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    let groupDocRef: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().name === groupIdentifier) {
        groupDocRef = doc.ref;
      }
    });
    
    if (!groupDocRef) {
      console.error("Group not found:", groupIdentifier);
      return;
    }
    
    await updateDoc(groupDocRef, updates);
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const deleteGroupFromFirestore = async (groupIdentifier: string) => {
  try {
    // Try to find the group document by name
    const q = query(groupsCollection, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    let groupDocRef: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().name === groupIdentifier) {
        groupDocRef = doc.ref;
      }
    });
    
    if (!groupDocRef) {
      console.error("Group not found:", groupIdentifier);
      return;
    }
    
    await deleteDoc(groupDocRef);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};
