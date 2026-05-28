import { 
  getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  query, where, orderBy, getDocs, Timestamp, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { encryptPrivateKey, decryptPrivateKey } from "./encryption";

export interface EncryptedWalletData {
  id?: string;
  name: string;
  publicKey: string;
  encryptedPrivateKey: string;
  nickname?: string;
  userId: string;
  createdAt?: Timestamp;
}

export interface UserProfile {
  userId: string;
  nickname?: string;
  avatarUrl?: string;
  socialLinks: {
    platform: "telegram" | "youtube" | "other";
    url: string;
    label: string;
  }[];
  tradingSetups?: any[];
  updatedAt?: Timestamp;
}

const userProfilesCollection = collection(db, "userProfiles");
const walletsCollection = collection(db, "userWallets");

// ==================== USER PROFILE ====================

export const createUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    await setDoc(profileRef, {
      userId,
      socialLinks: [],
      updatedAt: serverTimestamp(),
      ...data
    }, { merge: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { ...profileSnap.data() } as UserProfile;
    }
    
    // Create default profile if not exists
    await createUserProfile(userId, {});
    return { userId, socialLinks: [] };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const profileRef = doc(db, "userProfiles", userId);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// ==================== WALLET OPERATIONS ====================

export const addWalletToFirestore = async (walletData: Omit<EncryptedWalletData, "id" | "encryptedPrivateKey"> & { privateKey: string }): Promise<string> => {
  try {
    const encryptedPrivateKey = await encryptPrivateKey(walletData.privateKey);
    
    const walletRef = doc(walletsCollection);
    await setDoc(walletRef, {
      name: walletData.name,
      publicKey: walletData.publicKey,
      encryptedPrivateKey,
      userId: walletData.userId,
      nickname: walletData.nickname,
      createdAt: serverTimestamp()
    } as Partial<EncryptedWalletData>);
    
    return walletRef.id;
  } catch (error) {
    console.error("Error adding wallet:", error);
    throw error;
  }
};

export const getWalletsForUser = async (userId: string): Promise<EncryptedWalletData[]> => {
  try {
    const q = query(
      walletsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const wallets: EncryptedWalletData[] = [];
    
    querySnapshot.forEach((doc) => {
      wallets.push({
        id: doc.id,
        ...doc.data()
      } as EncryptedWalletData);
    });
    
    return wallets;
  } catch (error) {
    console.error("Error getting wallets:", error);
    throw error;
  }
};

export const updateWallet = async (walletId: string, updates: Partial<EncryptedWalletData>): Promise<void> => {
  try {
    const walletRef = doc(walletsCollection, walletId);
    await updateDoc(walletRef, updates);
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

export const deleteWallet = async (walletId: string): Promise<void> => {
  try {
    const walletRef = doc(walletsCollection, walletId);
    await deleteDoc(walletRef);
  } catch (error) {
    console.error("Error deleting wallet:", error);
    throw error;
  }
};

export const getWalletById = async (walletId: string): Promise<EncryptedWalletData | null> => {
  try {
    const walletRef = doc(walletsCollection, walletId);
    const walletSnap = await getDoc(walletRef);
    
    if (walletSnap.exists()) {
      return { id: walletSnap.id, ...walletSnap.data() } as EncryptedWalletData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting wallet:", error);
    throw error;
  }
};

export const decryptWalletPrivateKey = async (encryptedPrivateKey: string): Promise<string> => {
  return await decryptPrivateKey(encryptedPrivateKey);
};
