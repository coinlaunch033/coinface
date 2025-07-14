import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { blockchainLogos } from "@/assets/logos";

interface Chain {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  logo: string;
}

const chains: Chain[] = [
  { id: "solana", name: "Solana", symbol: "SOL", icon: "S", color: "from-purple-500 to-pink-500", logo: blockchainLogos.solana },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "E", color: "from-blue-500 to-purple-500", logo: blockchainLogos.ethereum },
  { id: "base", name: "Base", symbol: "ETH", icon: "B", color: "from-blue-600 to-indigo-600", logo: blockchainLogos.base },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", icon: "B", color: "from-yellow-500 to-orange-500", logo: blockchainLogos.bnb },
  { id: "polygon", name: "Polygon", symbol: "MATIC", icon: "P", color: "from-purple-600 to-indigo-600", logo: blockchainLogos.polygon },
];

interface ChainSelectorProps {
  selectedChain: string;
  onChainSelect: (chainId: string) => void;
}

export default function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <img 
              src={chain.logo} 
              alt={`${chain.name} logo`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="font-semibold text-sm">{chain.name}</div>
          <div className="text-xs text-gray-400">{chain.symbol}</div>
        </motion.div>
      ))}
    </div>
  );
}
