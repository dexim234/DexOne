import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPyESAvFn4wXG9OJjQv1zFcGnkKahJHE8",
  authDomain: "onedex-osnova.firebaseapp.com",
  projectId: "onedex-osnova",
  storageBucket: "onedex-osnova.firebasestorage.app",
  messagingSenderId: "1032769450215",
  appId: "1:1032769450215:web:3711c31a94f58d342c3242"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore operations
export interface WalletData {
  id?: string;
  group: string;
  wallet: string;
  balance: string;
  active: boolean;
  lastActivity: number;
  name?: string;
  userId?: string;
  createdAt?: Timestamp;
}

// Groups interface
export interface GroupData {
  id?: string;
  name: string;
  emoji?: string;
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

export const updateGroupInFirestore = async (groupId: string, updates: Partial<GroupData>) => {
  try {
    const groupDoc = doc(db, "groups", groupId);
    await updateDoc(groupDoc, updates);
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const deleteGroupFromFirestore = async (groupId: string) => {
  try {
    const groupDoc = doc(db, "groups", groupId);
    await deleteDoc(groupDoc);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};
