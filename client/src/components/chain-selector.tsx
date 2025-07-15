import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Circle, Hexagon, Square } from "lucide-react";

interface Chain {
  id: string;
  name: string;
  symbol: string;
  icon: any; // Lucide icon
  color: string;
}

const chains: Chain[] = [
  { id: "solana", name: "Solana", symbol: "SOL", icon: Circle, color: "#9945FF" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", icon: Circle, color: "#F3BA2F" },
];

interface ChainSelectorProps {
  selectedChain: string;
  onChainSelect: (chainId: string) => void;
}

export default function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {chains.map((chain) => (
        <motion.div
          key={chain.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "chain-button text-center cursor-pointer",
            selectedChain === chain.id && "active"
          )}
          onClick={() => onChainSelect(chain.id)}
        >
          <div className="flex items-center justify-center mb-2">
            <chain.icon className="w-10 h-10 rounded-full object-cover" style={{ color: chain.color }} />
          </div>
          <div className="font-semibold text-sm">{chain.name}</div>
          <div className="text-xs text-gray-400">{chain.symbol}</div>
        </motion.div>
      ))}
    </div>
  );
}
