import { useState, useEffect } from "react";
import { useAppKitAccount } from '@reown/appkit-controllers/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";

interface WalletBalanceProps {
  requiredAmount?: number;
  showWarning?: boolean;
}

export default function WalletBalance({ requiredAmount = 0.01, showWarning = true }: WalletBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });
  const { connection } = useAppKitConnection();

  const fetchBalance = async () => {
    if (!isConnected || !address || !connection) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const publicKey = new PublicKey(address);
      const balanceLamports = await connection.getBalance(publicKey);
      const solBalance = balanceLamports / LAMPORTS_PER_SOL;
      setBalance(solBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, connection]);

  if (!isConnected) {
    return null;
  }

  const hasSufficientBalance = balance !== null && balance >= requiredAmount;
  const isLowBalance = balance !== null && balance < requiredAmount && balance > 0;

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
          ) : error ? (
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          ) : balance !== null ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-green-400">
                {balance.toFixed(4)} SOL
              </span>
              
              {showWarning && (
                <>
                  {hasSufficientBalance ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : isLowBalance ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">--</span>
          )}
        </div>

        {showWarning && balance !== null && (
          <div className="mt-2">
            {hasSufficientBalance ? (
              <div className="text-xs text-green-600 bg-green-100 dark:bg-green-900/20 p-2 rounded">
                ✅ Sufficient balance for platform fee ({requiredAmount} SOL)
              </div>
            ) : isLowBalance ? (
              <div className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                ⚠️ Low balance. You need at least {requiredAmount} SOL (including fees)
              </div>
            ) : balance === 0 ? (
              <div className="text-xs text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded">
                ❌ No balance. You need at least {requiredAmount} SOL to proceed
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 