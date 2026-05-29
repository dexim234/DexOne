import { Keypair } from '@solana/web3.js';

export interface WalletData {
  id: string;
  name: string;
  publicKey: string;
  privateKeyBase58: string;
  createdAt: number;
}

function uint8ArrayToBase58(buffer: Uint8Array): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  const leadingOnes = buffer.findIndex(b => b !== 0);
  const prefix = leadingOnes === -1 ? buffer.length : leadingOnes;
  let result = '';
  for (let i = 0; i < prefix; i++) result += '1';
  for (let i = digits.length - 1; i >= 0; i--) result += alphabet[digits[i]];
  return result || '1';
}

function base58ToUint8Array(str: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const map = new Map<string, number>();
  for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

  const digits: number[] = [];
  for (const char of str) {
    let carry = map.get(char);
    if (carry === undefined) throw new Error('Invalid base58 character');
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] * 58;
      digits[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry) {
      digits.push(carry & 0xff);
      carry >>= 8;
    }
  }

  const leadingOnes = str.split('').findIndex(c => c !== '1');
  const prefix = leadingOnes === -1 ? str.length : leadingOnes;
  const result = new Uint8Array(prefix + digits.length);
  for (let i = digits.length - 1, j = prefix; i >= 0; i--, j++) {
    result[j] = digits[i];
  }
  return result;
}

function formatAddressForName(publicKey: string): string {
  if (publicKey.length < 10) return publicKey;
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
}

export async function generateSolanaWallet(name?: string): Promise<WalletData> {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  return {
    id: crypto.randomUUID(),
    name: name || formatAddressForName(publicKey),
    publicKey,
    privateKeyBase58: uint8ArrayToBase58(keypair.secretKey),
    createdAt: Date.now(),
  };
}

export async function importSolanaWallet(secretKeyBase58: string, name?: string): Promise<WalletData> {
  const secretKey = base58ToUint8Array(secretKeyBase58.trim());
  const keypair = Keypair.fromSecretKey(secretKey);
  const publicKey = keypair.publicKey.toBase58();
  return {
    id: crypto.randomUUID(),
    name: name || formatAddressForName(publicKey),
    publicKey,
    privateKeyBase58: secretKeyBase58.trim(),
    createdAt: Date.now(),
  };
}

export function getWalletsFromStorage(): WalletData[] {
  try {
    const stored = localStorage.getItem('solana-wallets');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load wallets:', e);
  }
  return [];
}

export function saveWalletsToStorage(wallets: WalletData[]): void {
  try {
    localStorage.setItem('solana-wallets', JSON.stringify(wallets));
  } catch (e) {
    console.error('Failed to save wallets:', e);
  }
}

export function addWalletToStorage(wallet: WalletData): void {
  const wallets = getWalletsFromStorage();
  wallets.push(wallet);
  saveWalletsToStorage(wallets);
}

export function removeWalletFromStorage(walletId: string): void {
  const wallets = getWalletsFromStorage();
  const filtered = wallets.filter(w => w.id !== walletId);
  saveWalletsToStorage(filtered);
}

export { base58ToUint8Array };
export { MIN_SOL_FOR_RENT, TRANSACTION_FEE } from './solana-transaction';
