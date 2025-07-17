import { useAppKitAccount } from '@reown/appkit-controllers/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function ReownExample() {
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });
  const { connection } = useAppKitConnection();

  const handleGetBalance = async () => {
    if (!isConnected || !address || !connection) {
      console.error('Wallet not connected or connection not available');
      return;
    }

    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`Wallet balance: ${solBalance} SOL`);
      alert(`Your wallet balance: ${solBalance.toFixed(4)} SOL`);
    } catch (error) {
      console.error('Error getting balance:', error);
      alert('Error getting wallet balance');
    }
  };

  const handleSignMessage = async () => {
    if (!isConnected || !connection) {
      console.error('Wallet not connected');
      return;
    }

    try {
      // Note: This is a simplified example. In a real implementation,
      // you would need to get the wallet provider from the connection
      console.log('Message signing would be implemented here');
      alert('Message signing would be implemented here');
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Error signing message');
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reown AppKit Example</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Connect your wallet to try Reown AppKit features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reown AppKit Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Connected Address:</strong>
          </p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">
            {address}
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleGetBalance}
            className="w-full"
            variant="outline"
          >
            Get Wallet Balance
          </Button>
          
          <Button 
            onClick={handleSignMessage}
            className="w-full"
            variant="outline"
          >
            Sign Test Message
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          Check the browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
} 