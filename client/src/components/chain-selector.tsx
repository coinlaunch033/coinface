import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Circle, Sparkles } from "lucide-react";

interface Chain {
  id: string;
  name: string;
  symbol: string;
  icon: any; // Lucide icon
  color: string;
}

const chains: Chain[] = [
  { id: "solana", name: "Solana", symbol: "SOL", icon: Circle, color: "#9945FF" },
];

interface ChainSelectorProps {
  selectedChain: string;
  onChainSelect: (chainId: string) => void;
}

export default function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-200">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Promote Your Coin</span>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-sm text-gray-400">
          Powered by Solana blockchain
        </p>
      </div>

      {/* Chain Selection */}
      <div className="flex justify-center">
        {chains.map((chain) => (
          <motion.div
            key={chain.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "chain-button relative cursor-pointer group",
              selectedChain === chain.id && "active"
            )}
            onClick={() => onChainSelect(chain.id)}
          >
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            
            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 min-w-[200px] text-center transition-all duration-300 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20">
              {/* Icon with glow effect */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg"></div>
                <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                  <chain.icon 
                    className="w-12 h-12 text-purple-400 drop-shadow-lg" 
                    style={{ color: chain.color }} 
                  />
                </div>
              </div>
              
              {/* Chain name with gradient text */}
              <div className="mb-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {chain.name}
                </h3>
              </div>
              
              {/* Symbol with subtle styling */}
              <div className="text-sm text-gray-400 font-medium">
                {chain.symbol}
              </div>
              
              {/* Selection indicator */}
              {selectedChain === chain.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <Circle className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">
            Fast & Low-Cost Transactions
          </span>
        </div>
      </div>
    </div>
  );
}
