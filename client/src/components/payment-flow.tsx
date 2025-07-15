import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PaymentFlowProps {
  amount: string;
  chain: string;
  tokenName: string;
  walletAddress?: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentFlow({ 
  amount, 
  chain, 
  tokenName, 
  walletAddress, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!walletAddress) {
      onPaymentError("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Create a transaction to send the payment
      // 2. Sign the transaction with the wallet
      // 3. Wait for confirmation
      // 4. Verify the payment on the backend
      
      setPaymentStep('success');
      onPaymentSuccess();
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Payment of ${amount} on ${chain} completed successfully.`,
      });
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep('error');
      onPaymentError("Payment failed. Please try again.");
      
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentDetails = () => {
    const details = {
      ethereum: { symbol: "ETH", decimals: 18 },
      base: { symbol: "ETH", decimals: 18 },
      bnb: { symbol: "BNB", decimals: 18 },
      polygon: { symbol: "MATIC", decimals: 18 },
      solana: { symbol: "SOL", decimals: 9 },
    };
    
    return details[chain as keyof typeof details] || { symbol: "ETH", decimals: 18 };
  };

  const { symbol } = getPaymentDetails();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Token:</span>
            <span className="font-semibold">{tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chain:</span>
            <span className="font-semibold capitalize">{chain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount:</span>
            <span className="font-semibold">{amount} {symbol}</span>
          </div>
          {walletAddress && (
            <div className="flex justify-between">
              <span className="text-gray-400">Wallet:</span>
              <span className="font-mono text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {paymentStep === 'pending' && (
          <Button
            onClick={handlePayment}
            disabled={!walletAddress || isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {!walletAddress ? "Connect Wallet First" : `Pay ${amount} ${symbol}`}
          </Button>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-sm text-gray-400">Processing payment...</p>
            <p className="text-xs text-gray-500">Please confirm the transaction in your wallet</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center space-y-2">
            <div className="text-green-500 text-2xl">✅</div>
            <p className="text-sm text-green-600 font-semibold">Payment Successful!</p>
            <p className="text-xs text-gray-400">Your token page will be created shortly</p>
          </div>
        )}

        {paymentStep === 'error' && (
          <div className="text-center space-y-2">
            <div className="text-red-500 text-2xl">❌</div>
            <p className="text-sm text-red-600 font-semibold">Payment Failed</p>
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
      </CardContent>
    </Card>
  );
} 