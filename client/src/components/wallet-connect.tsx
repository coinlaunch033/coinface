import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet-context";

interface WalletConnectProps {
  onConnect?: (address: string, chain: string) => void;
  onDisconnect?: () => void;
  className?: string;
}

export default function WalletConnect({ onConnect, onDisconnect, className }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { isConnected, walletAddress, connectedChain, connect, disconnect, switchChain } = useWallet();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      await connect();
      onConnect?.(walletAddress, connectedChain);
      
      toast({
        title: "Wallet Connected! 🎉",
        description: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} on ${connectedChain}`,
      });
    } catch (error) {
      console.error("Connection error:", error);
      
      if (error instanceof Error && error.message === "MetaMask not installed") {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        
        // Open MetaMask download page
        window.open('https://metamask.io/download/', '_blank');
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnect?.();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const handleSwitchChain = async (targetChain: string) => {
    try {
      await switchChain(targetChain);
      toast({
        title: "Chain Switched",
        description: `Switched to ${targetChain}`,
      });
    } catch (error) {
      console.error("Chain switch error:", error);
      toast({
        title: "Chain Switch Failed",
        description: "Failed to switch chain. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isConnected) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-sm text-gray-300">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSwitchChain('ethereum')}
          className="text-xs"
        >
          Switch Chain
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 neon-glow ${className}`}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}

 