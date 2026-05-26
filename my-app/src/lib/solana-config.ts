import { Connection, clusterApiUrl } from '@solana/web3.js';

/**
 * Конфигурация Solana сети
 */
export const SOLANA_CONFIG = {
  // Основная сеть Solana
  MAINNET_RPC: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
  
  // Тестовая сеть Solana
  DEVNET_RPC: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || clusterApiUrl('devnet'),
  
  // Адреса контрактов Pump.fun
  PUMP_FUN_PROGRAM_ID: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  
  // Адреса для Pump Swap
  PUMP_SWAP_PROGRAM_ID: 'PUMPckSMTMi5xvR5WZqACqHrTQW5K8a1vF7d5G5tJgE',
  
  // Расслаивающая программа для миграции токенов
  RAYDIUM_AMM_V4: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
};

/**
 * Получение подключения к Solana
 */
export function getSolanaConnection(network: 'mainnet' | 'devnet' = 'mainnet'): Connection {
  const rpcUrl = network === 'mainnet' 
    ? SOLANA_CONFIG.MAINNET_RPC 
    : SOLANA_CONFIG.DEVNET_RPC;
  
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    wsEndpoint: network === 'mainnet' 
      ? 'wss://api.mainnet-beta.solana.com' 
      : undefined,
  });
}

/**
 * Проверка корректности адреса Solana
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const bytes = Buffer.from(address, 'base64');
    return bytes.length === 32;
  } catch {
    return false;
  }
}

/**
 * Форматирование адреса Solana (сокращенный вид)
 */
export function formatSolanaAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Получение explorer URL для адреса
 */
export function getSolanaExplorerUrl(address: string, network: 'mainnet' | 'devnet' = 'mainnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://solscan.io' 
    : 'https://devnet.solscan.io';
  
  return `${baseUrl}/account/${address}`;
}

/**
 * Получение explorer URL для транзакции
 */
export function getSolanaTxUrl(txSignature: string, network: 'mainnet' | 'devnet' = 'mainnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://solscan.io' 
    : 'https://devnet.solscan.io';
  
  return `${baseUrl}/tx/${txSignature}`;
}
