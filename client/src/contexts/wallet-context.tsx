import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  connectedChain: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chain: string) => Promise<void>;
  balance: string;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connectedChain, setConnectedChain] = useState("");
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainMap: { [key: string]: string } = {
              '0x1': 'ethereum',
              '0xa': 'optimism',
              '0xa4b1': 'arbitrum',
              '0x2105': 'base',
              '0x38': 'bnb',
              '0x89': 'polygon',
              'solana': 'solana',
            };
            
            setIsConnected(true);
            setWalletAddress(accounts[0]);
            setConnectedChain(chainMap[chainId] || 'ethereum');
            
            // Get balance
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
          }
        } catch (error) {
          console.log("No existing wallet connection");
        }
      }
    };
    
    checkConnection();
  }, []);

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsLoading(true);
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ 
            method: 'eth_chainId' 
          });
          
          const chainMap: { [key: string]: string } = {
            '0x1': 'ethereum',
            '0xa': 'optimism',
            '0xa4b1': 'arbitrum',
            '0x2105': 'base',
            '0x38': 'bnb',
            '0x89': 'polygon',
            'solana': 'solana',
          };
          
          setIsConnected(true);
          setWalletAddress(accounts[0]);
          setConnectedChain(chainMap[chainId] || 'ethereum');
          
          // Get balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        }
      } catch (error) {
        console.error("Connection error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      throw new Error("MetaMask not installed");
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setConnectedChain("");
    setBalance("0");
  };

  const switchChain = async (targetChain: string) => {
    if (!window.ethereum) return;
    
    const chainMap: { [key: string]: string } = {
      'ethereum': '0x1',
      'base': '0x2105',
      'bnb': '0x38',
      'polygon': '0x89',
      'solana': 'solana',
    };
    
    const targetChainId = chainMap[targetChain];
    if (!targetChainId) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      setConnectedChain(targetChain);
    } catch (error) {
      console.error("Chain switch error:", error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      walletAddress,
      connectedChain,
      connect,
      disconnect,
      switchChain,
      balance,
      isLoading,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Add TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
} 