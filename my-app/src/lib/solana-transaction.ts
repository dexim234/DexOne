import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { WalletData, base58ToUint8Array } from './solana-wallet-creator';

export const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=e1c6a036-1d29-4dd6-b47d-78b438efb6f8";

// Минимальный баланс для rent exemption (примерно 0.00203928 SOL)
export const MIN_SOL_FOR_RENT = 0.00203928;
// Комиссия за транзакцию (~5000 lamports = 0.000005 SOL)
export const TRANSACTION_FEE = 0.000005;

/**
 * Отправляет SOL с одного кошелька на другой
 * @param senderWallet - Кошелек отправителя (из localStorage)
 * @param recipientAddress - Адрес получателя
 * @param amountSol - Количество SOL для отправки
 * @returns signature - подпись транзакции
 */
export async function sendSolTransaction(
  senderWallet: WalletData,
  recipientAddress: string,
  amountSol: number
): Promise<string> {
  try {
    // Создаем соединение с Solana
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    // Восстанавливаем Keypair из приватного ключа
    const secretKey = base58ToUint8Array(senderWallet.privateKeyBase58);
    const senderKeypair = Keypair.fromSecretKey(secretKey);

    // Проверяем, что кошелек совпадает
    const senderPublicKey = senderKeypair.publicKey.toBase58();
    if (senderPublicKey !== senderWallet.publicKey) {
      throw new Error('Invalid private key for this wallet');
    }

    // Проверяем баланс
    const balance = await connection.getBalance(senderKeypair.publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    const totalRequired = amountSol + MIN_SOL_FOR_RENT + TRANSACTION_FEE;
    
    if (balanceInSol < totalRequired) {
      throw new Error(
        `Insufficient balance!\n\nRequired: ${totalRequired.toFixed(6)} SOL\n  - Send: ${amountSol.toFixed(4)} SOL\n  - Rent reserve: ${MIN_SOL_FOR_RENT.toFixed(6)} SOL\n  - Fee: ${TRANSACTION_FEE.toFixed(6)} SOL\n\nAvailable: ${balanceInSol.toFixed(6)} SOL`
      );
    }

    // Создаем PublicKey адресата
    const recipientPubKey = new PublicKey(recipientAddress);

    // Создаем транзакцию
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPubKey,
        lamports: amountSol * LAMPORTS_PER_SOL,
      })
    );

    // Получаем recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    // Подписываем транзакцию
    transaction.sign(senderKeypair);

    // Отправляем транзакцию
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Ждем подтверждения
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return signature;
  } catch (error) {
    console.error('sendSolTransaction error:', error);
    throw error instanceof Error ? error : new Error('Failed to send transaction');
  }
}

/**
 * Проверяет баланс кошелька в SOL
 */
export async function getSolBalance(publicKey: string): Promise<number> {
  try {
    const connection = new Connection(HELIUS_RPC_URL);
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('getSolBalance error:', error);
    return 0;
  }
}

