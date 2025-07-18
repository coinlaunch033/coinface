import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppKitAccount } from '@reown/appkit-controllers/react';
import { useAppKitProvider } from '@reown/appkit/library/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

interface PaymentFlowProps {
  amount: string;
  chain: string;
  tokenName: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

// Your business wallet address
const RECIPIENT_ADDRESS = "5xDHKXERdpPGoY3bofLcjc4rRrMy22qRem588PgdR2RP";

export default function PaymentFlow({ 
  amount, 
  chain, 
  tokenName, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  
  // Use Reown AppKit hooks for wallet connection and provider
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { connection } = useAppKitConnection();

  const sendTransaction = useCallback(async (transaction: Transaction): Promise<string> => {
    if (!address || !walletProvider) {
      throw new Error('Wallet not connected or provider not available');
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Get latest blockhash
      const { blockhash } = await connection!.getLatestBlockhash();

      // Set transaction details
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(address);

      // Send transaction using the wallet provider - this will trigger wallet popup
      const signature = await walletProvider.signAndSendTransaction(transaction);
      
      console.log('Transaction sent with signature:', signature);

      return signature;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [address, walletProvider, connection]);

  const handlePayment = async () => {
    if (!isConnected || !address) {
      onPaymentError("Please connect your wallet first");
      return;
    }

    if (!walletProvider) {
      onPaymentError("Wallet provider not available");
      return;
    }

    if (!connection) {
      onPaymentError("Wallet connection not available");
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    try {
      console.log('Starting payment process...');
      console.log('Amount:', amount);
      console.log('Recipient:', RECIPIENT_ADDRESS);
      console.log('From address:', address);

      // Parse amount correctly - remove the "~" if present
      const cleanAmount = amount.replace('~', '').trim();
      const amountInLamports = parseFloat(cleanAmount) * LAMPORTS_PER_SOL;

      // Check wallet balance BEFORE attempting transaction
      console.log('Checking wallet balance...');
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log('Current balance:', solBalance, 'SOL');
      console.log('Required amount:', cleanAmount, 'SOL');
      
      // Add a small buffer for transaction fees (0.001 SOL)
      const requiredAmount = parseFloat(cleanAmount) + 0.001;
      
      if (solBalance < requiredAmount) {
        setError(`Insufficient balance. You need at least ${requiredAmount.toFixed(3)} SOL (including fees). Current balance: ${solBalance.toFixed(4)} SOL`);
        setPaymentStep('error');
        onPaymentError(`Insufficient balance. You need at least ${requiredAmount.toFixed(3)} SOL (including fees). Current balance: ${solBalance.toFixed(4)} SOL`);
        return;
      }

      console.log('Balance check passed. Creating transaction...');
      console.log(`Creating transaction: ${cleanAmount} SOL (${amountInLamports} lamports)`);

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(RECIPIENT_ADDRESS),
          lamports: amountInLamports,
        })
      );

      // Send transaction - this will trigger wallet popup
      const signature = await sendTransaction(transaction);
      setTransactionSignature(signature);

      console.log('Transaction confirmed:', signature);

      // Success
      setPaymentStep('success');
      onPaymentSuccess();
      toast({
        title: "Payment Confirmed! 🎉",
        description: `Payment of ${amount} SOL has been sent successfully.`,
      });
      
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStep('error');
      
      // Handle specific error types
      if (error.message?.includes('User rejected') || error.message?.includes('User cancelled')) {
        onPaymentError("Transaction was cancelled by user");
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction in your wallet.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Insufficient funds') || error.message?.includes('insufficient funds')) {
        onPaymentError("Insufficient balance");
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${amount} SOL to complete this transaction.`,
          variant: "destructive",
        });
      } else {
        onPaymentError("Payment failed. Please try again.");
        toast({
          title: "Payment Failed",
          description: error.message || "There was an error processing your payment.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">PROMOTE YOUR COIN:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Solana Chain Display */}
        <div className="flex justify-center">
          <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg cursor-default shadow-lg shadow-green-500/25 animate-pulse">
            (Solana)
          </div>
        </div>

        {/* Token Address Display */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Get Token Address</p>
          <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {tokenName}
          </p>
        </div>

        {/* Processing States */}
        {paymentStep === 'processing' && (
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-sm text-gray-400">
              {transactionSignature ? "Confirming transaction..." : "Waiting for wallet approval..."}
            </p>
            <p className="text-xs text-gray-500">
              {transactionSignature 
                ? "Transaction sent, waiting for confirmation..." 
                : "Check your wallet for the transaction popup"
              }
            </p>
            {transactionSignature && (
              <p className="text-xs text-gray-400">
                Signature: {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
              </p>
            )}
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center space-y-2">
            <div className="text-green-500 text-2xl">✅</div>
            <p className="text-sm text-green-600 font-semibold">Payment Confirmed!</p>
            <p className="text-xs text-gray-400">Your token page will be created shortly</p>
            {transactionSignature && (
              <p className="text-xs text-gray-400">
                Transaction: {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
              </p>
            )}
          </div>
        )}

        {paymentStep === 'error' && (
          <div className="text-center space-y-2">
            <div className="text-red-500 text-2xl">❌</div>
            <p className="text-sm text-red-600 font-semibold">Payment Failed</p>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <Button
              onClick={() => setPaymentStep('pending')}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Promote Button - Only show when not processing/success/error */}
        {paymentStep === 'pending' && (
          <Button
            onClick={handlePayment}
            disabled={!isConnected || !address || isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected || !address ? "Connect Wallet First" : "Promote"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 