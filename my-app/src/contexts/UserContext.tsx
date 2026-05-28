"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initializeAuth, getCurrentUserId } from "@/lib/firebase-auth";
import { 
  getUserProfile, 
  updateUserProfile, 
  getWalletsForUser, 
  addWalletToFirestore, 
  updateWallet, 
  deleteWallet,
  decryptWalletPrivateKey,
  UserProfile,
  EncryptedWalletData
} from "@/lib/firebase-user";
import { getWalletsFromStorage, saveWalletsToStorage, WalletData as LocalWalletData } from "@/lib/solana-wallet-creator";
import { useToast } from "@/components/ui/toast";

interface WalletData {
  id: string;
  name: string;
  publicKey: string;
  privateKeyBase58: string;
  createdAt: number;
}

interface UserContextType {
  userId: string | null;
  isLoading: boolean;
  profile: UserProfile | null;
  wallets: WalletData[];
  activeWalletId: string | null;
  error: string | null;
  
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadWallets: () => Promise<void>;
  createWallet: (name?: string) => Promise<WalletData>;
  importWallet: (privateKey: string, name?: string) => Promise<WalletData>;
  renameWallet: (walletId: string, name: string) => Promise<void>;
  deleteWalletLocal: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
  isFirebaseConnected: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  
  const { addToast } = useToast();

  const setActiveWallet = (walletId: string) => {
    setActiveWalletId(walletId);
    localStorage.setItem('active-wallet-id', walletId);
    window.dispatchEvent(new CustomEvent('activeWalletChanged', { detail: walletId }));
  };

  // Initialize auth
  useEffect(() => {
    const init = async () => {
      try {
        const uid = await initializeAuth();
        setUserId(uid);
        setIsFirebaseConnected(true);
      } catch (err) {
        console.error("Firebase auth failed:", err);
        setIsFirebaseConnected(false);
        const localWallets = getWalletsFromStorage();
        setWallets(localWallets);
        const savedActive = localStorage.getItem('active-wallet-id');
        if (savedActive && localWallets.find(w => w.id === savedActive)) {
          setActiveWalletId(savedActive);
        } else if (localWallets.length > 0) {
          setActiveWalletId(localWallets[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (userId && isFirebaseConnected) {
      loadProfile();
    }
  }, [userId, isFirebaseConnected]);

  // Load wallets when userId is available
  useEffect(() => {
    if (userId && isFirebaseConnected) {
      loadWallets();
    }
  }, [userId, isFirebaseConnected]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) throw new Error("User not authenticated");
    console.log("💾 updateProfile called, userId:", userId, "updates:", updates);
    try {
      console.log("📡 Updating Firestore profile...");
      await updateUserProfile(userId, updates);
      console.log("✅ Profile updated successfully");
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      addToast("success", "Profile Updated", "Your profile has been saved");
    } catch (err: any) {
      console.error("❌ Failed to update profile:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      addToast("error", "Update Failed", "Failed to save profile");
      throw err;
    }
  };

  const loadWallets = async () => {
    if (!userId) return;
    try {
      const encryptedWallets = await getWalletsForUser(userId);
      
      if (encryptedWallets.length > 0) {
        const decryptedWallets: WalletData[] = await Promise.all(
          encryptedWallets.map(async (ew) => {
            const privateKey = await decryptWalletPrivateKey(ew.encryptedPrivateKey);
            return {
              id: ew.id!,
              name: ew.name,
              publicKey: ew.publicKey,
              privateKeyBase58: privateKey,
              createdAt: ew.createdAt?.toDate().getTime() || Date.now()
            };
          })
        );
        
        setWallets(decryptedWallets);
      } else {
        const localWallets = getWalletsFromStorage();
        setWallets(localWallets);
        
        for (const wallet of localWallets) {
          try {
            await addWalletToFirestore({
              name: wallet.name,
              publicKey: wallet.publicKey,
              privateKey: wallet.privateKeyBase58,
              userId
            });
          } catch (err) {
            console.error("Failed to sync wallet to Firebase:", err);
          }
        }
      }
      
      if (wallets.length > 0 && !activeWalletId) {
        const savedActive = localStorage.getItem('active-wallet-id');
        if (savedActive && wallets.find(w => w.id === savedActive)) {
          setActiveWalletId(savedActive);
        } else {
          setActiveWalletId(wallets[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load wallets from Firebase:", err.message);
      const localWallets = getWalletsFromStorage();
      setWallets(localWallets);
      const savedActive = localStorage.getItem('active-wallet-id');
      if (savedActive && localWallets.find(w => w.id === savedActive)) {
        setActiveWalletId(savedActive);
      } else if (localWallets.length > 0) {
        setActiveWalletId(localWallets[0].id);
      }
      addToast("info", "Firebase Error", "Using local wallets");
    }
  };

  const createWallet = async (name?: string): Promise<WalletData> => {
    if (!userId) throw new Error("User not authenticated");
    try {
      const { generateSolanaWallet } = await import("@/lib/solana-wallet-creator");
      const newWallet = await generateSolanaWallet(name);
      
      await addWalletToFirestore({
        name: newWallet.name,
        publicKey: newWallet.publicKey,
        privateKey: newWallet.privateKeyBase58,
        userId,
        nickname: profile?.nickname
      });
      
      const walletData: WalletData = {
        id: newWallet.id,
        name: newWallet.name,
        publicKey: newWallet.publicKey,
        privateKeyBase58: newWallet.privateKeyBase58,
        createdAt: newWallet.createdAt
      };
      
      // Also save to localStorage for fallback
      const localWallets = getWalletsFromStorage();
      saveWalletsToStorage([walletData, ...localWallets]);
      
      setWallets(prev => [walletData, ...prev]);
      addToast("success", "Wallet Created", `${newWallet.name} has been created`);
      
      return walletData;
    } catch (err) {
      console.error("Failed to create wallet:", err);
      addToast("error", "Creation Failed", "Failed to create wallet");
      throw err;
    }
  };

  const importWallet = async (privateKey: string, name?: string): Promise<WalletData> => {
    if (!userId) throw new Error("User not authenticated");
    try {
      const { importSolanaWallet } = await import("@/lib/solana-wallet-creator");
      const importedWallet = await importSolanaWallet(privateKey, name);
      
      await addWalletToFirestore({
        name: importedWallet.name,
        publicKey: importedWallet.publicKey,
        privateKey: importedWallet.privateKeyBase58,
        userId,
        nickname: profile?.nickname
      });
      
      const walletData: WalletData = {
        id: importedWallet.id,
        name: importedWallet.name,
        publicKey: importedWallet.publicKey,
        privateKeyBase58: importedWallet.privateKeyBase58,
        createdAt: importedWallet.createdAt
      };
      
      // Also save to localStorage for fallback
      const localWallets = getWalletsFromStorage();
      saveWalletsToStorage([walletData, ...localWallets]);
      
      setWallets(prev => [walletData, ...prev]);
      addToast("success", "Wallet Imported", `${importedWallet.name} has been imported`);
      
      return walletData;
    } catch (err) {
      console.error("Failed to import wallet:", err);
      addToast("error", "Import Failed", "Invalid private key");
      throw err;
    }
  };

  const renameWallet = async (walletId: string, name: string): Promise<void> => {
    try {
      await updateWallet(walletId, { name });
      setWallets(prev => prev.map(w => w.id === walletId ? { ...w, name } : w));
      addToast("success", "Wallet Renamed", "Wallet name has been updated");
    } catch (err) {
      console.error("Failed to rename wallet:", err);
      addToast("error", "Update Failed", "Failed to rename wallet");
      throw err;
    }
  };

  const deleteWalletLocal = async (walletId: string): Promise<void> => {
    try {
      await deleteWallet(walletId);
      setWallets(prev => prev.filter(w => w.id !== walletId));
      
      if (activeWalletId === walletId) {
        const remaining = wallets.filter(w => w.id !== walletId);
        setActiveWalletId(remaining.length > 0 ? remaining[0].id : null);
      }
      
      addToast("info", "Wallet Deleted", "Wallet has been removed");
    } catch (err) {
      console.error("Failed to delete wallet:", err);
      addToast("error", "Delete Failed", "Failed to delete wallet");
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!userId) throw new Error("User not authenticated");
    try {
      const { uploadUserImage } = await import("@/lib/firebase-storage");
      
      // Remove old avatar if exists
      if (profile?.avatarUrl) {
        const { deleteUserImage } = await import("@/lib/firebase-storage");
        await deleteUserImage(profile.avatarUrl);
      }
      
      const avatarUrl = await uploadUserImage(file, userId);
      await updateProfile({ avatarUrl });
      
      return avatarUrl;
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      addToast("error", "Upload Failed", "Failed to upload image");
      throw err;
    }
  };

  const removeAvatar = async () => {
    if (!userId || !profile?.avatarUrl) return;
    try {
      const { deleteUserImage } = await import("@/lib/firebase-storage");
      await deleteUserImage(profile.avatarUrl);
      await updateProfile({ avatarUrl: undefined });
    } catch (err) {
      console.error("Failed to remove avatar:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        isLoading,
        profile,
        wallets,
        activeWalletId,
        error,
        isFirebaseConnected,
        loadProfile,
        updateProfile,
        loadWallets,
        createWallet,
        importWallet,
        renameWallet,
        deleteWalletLocal,
        setActiveWallet,
        uploadAvatar,
        removeAvatar
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
