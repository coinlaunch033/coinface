import { useAppKitAccount, useDisconnect } from '@reown/appkit-controllers/react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    try {
      await disconnect({ namespace: 'solana' });
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {formatAddress(address)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <appkit-button 
      namespace="solana"
      label="Connect Wallet"
      size="sm"
    />
  );
} 