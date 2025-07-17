// Solana RPC utility functions for payment verification

export interface SolanaTransaction {
  signature: string;
  slot: number;
  err: any;
  memo: string | null;
  blockTime: number;
}

export interface SolanaAccount {
  pubkey: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

/**
 * Verify a Solana transaction signature
 */
export async function verifyTransaction(
  signature: string, 
  rpcUrl: string
): Promise<SolanaTransaction | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          signature,
          {
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Solana RPC error:', data.error);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return null;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(
  publicKey: string, 
  rpcUrl: string
): Promise<number | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [publicKey],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Solana RPC error:', data.error);
      return null;
    }

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    return data.result.value / 1_000_000_000;
  } catch (error) {
    console.error('Error getting account balance:', error);
    return null;
  }
}

/**
 * Get recent transactions for an account
 */
export async function getRecentTransactions(
  publicKey: string, 
  rpcUrl: string, 
  limit: number = 10
): Promise<string[]> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          publicKey,
          {
            limit,
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Solana RPC error:', data.error);
      return [];
    }

    return data.result.map((tx: any) => tx.signature);
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
}

/**
 * Check if a transaction is confirmed
 */
export async function isTransactionConfirmed(
  signature: string, 
  rpcUrl: string
): Promise<boolean> {
  const transaction = await verifyTransaction(signature, rpcUrl);
  return transaction !== null && transaction.err === null;
}

/**
 * Get transaction details with confirmation status
 */
export async function getTransactionDetails(
  signature: string, 
  rpcUrl: string
): Promise<{
  confirmed: boolean;
  error: string | null;
  blockTime: number | null;
  slot: number | null;
} | null> {
  const transaction = await verifyTransaction(signature, rpcUrl);
  
  if (!transaction) {
    return null;
  }

  return {
    confirmed: transaction.err === null,
    error: transaction.err ? JSON.stringify(transaction.err) : null,
    blockTime: transaction.blockTime,
    slot: transaction.slot,
  };
}

/**
 * Monitor transaction status with polling
 */
export async function monitorTransaction(
  signature: string, 
  rpcUrl: string, 
  onUpdate?: (status: 'pending' | 'confirmed' | 'failed') => void,
  maxAttempts: number = 30
): Promise<'confirmed' | 'failed' | 'timeout'> {
  let attempts = 0;
  
  const poll = async (): Promise<'confirmed' | 'failed' | 'timeout'> => {
    attempts++;
    
    if (attempts > maxAttempts) {
      return 'timeout';
    }

    const details = await getTransactionDetails(signature, rpcUrl);
    
    if (!details) {
      onUpdate?.('pending');
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      return poll();
    }

    if (details.confirmed) {
      onUpdate?.('confirmed');
      return 'confirmed';
    } else if (details.error) {
      onUpdate?.('failed');
      return 'failed';
    } else {
      onUpdate?.('pending');
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      return poll();
    }
  };

  return poll();
} 