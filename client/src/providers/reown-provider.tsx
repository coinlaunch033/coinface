import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { solana } from '@reown/appkit/networks';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ReownAppKitProviderProps {
  children: ReactNode;
}

// Create a query client for React Query
const queryClient = new QueryClient();

// Create AppKit at module level (as per official example)
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || import.meta.env.REOWN_PROJECT_ID || 'default-project-id';

console.log('ReownAppKitProvider: Using project ID:', projectId);

try {
  // Create Solana adapter
  const solanaAdapter = new SolanaAdapter();
  
  createAppKit({
    projectId,
    metadata: {
      name: 'Coinface',
      description: 'Meme token marketing platform',
      url: 'https://coinface.fun',
      icons: ['/favicon.ico']
    },
    themeMode: 'dark',
    networks: [solana],
    adapters: [solanaAdapter],
    showWallets: true,
    themeVariables: {
      '--w3m-accent': '#8b5cf6' // Purple accent
    }
  });
  
  console.log('ReownAppKitProvider: AppKit created successfully with Solana adapter');
} catch (error) {
  console.error('ReownAppKitProvider: Error creating AppKit:', error);
}

export function ReownAppKitProvider({ children }: ReownAppKitProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 