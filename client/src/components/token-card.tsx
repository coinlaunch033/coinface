import { motion } from "framer-motion";
import { Copy, ExternalLink, Lightbulb, Share2, Twitter, Send, BarChart2, LineChart, Activity, TrendingUp, Circle, Hexagon, Square, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Token } from "@shared/schema";

interface TokenCardProps {
  token: Token;
  className?: string;
}

const chainColors = {
  solana: "bg-purple-500",
  ethereum: "bg-blue-500", 
  base: "bg-blue-600",
  bnb: "bg-yellow-500",
  polygon: "bg-purple-600",
};

// URL templates for DEX terminals
const urlTemplates = {
  dexscreener: (chain: string, tokenAddress: string) => `https://dexscreener.com/${chain}/${tokenAddress}`,
  dextools: (chain: string, tokenAddress: string) => `https://www.dextools.io/app/en/${chain}/pair-explorer/${tokenAddress}`,
  gmgn: (chain: string, tokenAddress: string) => `https://gmgn.ai/${chain === 'solana' ? 'sol' : 'bnb'}/token/${tokenAddress}`,
  birdeye: (chain: string, tokenAddress: string) => `https://birdeye.so/token/${tokenAddress}?chain=${chain}`,
};

// Validation function for token addresses
function isValidTokenAddress(chain: string, address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  return chain === 'solana' ? base58Regex.test(address) : evmRegex.test(address);
}

// Generate dynamic DEX links based on chain and token address
function generateDexLinks(chain: string, tokenAddress: string) {
  if (!chain || !tokenAddress || !isValidTokenAddress(chain, tokenAddress)) {
    // Return default links if validation fails
    return [
      { name: "DexScreener", icon: BarChart2, color: "bg-blue-500 hover:bg-blue-600", url: "https://dexscreener.com", disabled: true },
      { name: "GMGN", icon: Activity, color: "bg-purple-500 hover:bg-purple-600", url: "https://gmgn.ai", disabled: true },
      { name: "Birdeye", icon: TrendingUp, color: "bg-orange-500 hover:bg-orange-600", url: "https://birdeye.so", disabled: true },
      { name: "DexTools", icon: LineChart, color: "bg-green-500 hover:bg-green-600", url: "https://www.dextools.io", disabled: true },
      { name: "Upcoming", icon: ExternalLink, color: "bg-gray-500 hover:bg-gray-600", url: "#", disabled: true },
    ];
  }

  return [
    { 
      name: "DexScreener", 
      icon: BarChart2, 
      color: "bg-blue-500 hover:bg-blue-600", 
      url: urlTemplates.dexscreener(chain, tokenAddress),
      disabled: false
    },
    { 
      name: "GMGN", 
      icon: Activity, 
      color: "bg-purple-500 hover:bg-purple-600", 
      url: urlTemplates.gmgn(chain, tokenAddress),
      disabled: false
    },
    { 
      name: "Birdeye", 
      icon: TrendingUp, 
      color: "bg-orange-500 hover:bg-orange-600", 
      url: urlTemplates.birdeye(chain, tokenAddress),
      disabled: false
    },
    { 
      name: "DexTools", 
      icon: LineChart, 
      color: "bg-green-500 hover:bg-green-600", 
      url: urlTemplates.dextools(chain, tokenAddress),
      disabled: false
    },
    { 
      name: "Upcoming", 
      icon: ExternalLink, 
      color: "bg-gray-500 hover:bg-gray-600", 
      url: "#", 
      disabled: true 
    },
  ];
}

const socialLinks = [
  { name: "Twitter", icon: Twitter, color: "bg-blue-400 hover:bg-blue-500", url: "https://twitter.com/intent/tweet" },
  { name: "Reddit", icon: MessageCircle, color: "bg-orange-500 hover:bg-orange-600", url: "https://reddit.com/submit" },
  { name: "Telegram", icon: Send, color: "bg-blue-500 hover:bg-blue-600", url: "https://t.me/share/url" },
];

const chainIcons = {
  solana: Circle,
  ethereum: Hexagon,
  base: Square,
  bnb: Circle,
  polygon: Hexagon,
};

export default function TokenCard({ token, className }: TokenCardProps) {
  const { toast } = useToast();
  
  // Generate dynamic DEX links
  const dexLinks = generateDexLinks(token.chain || '', token.tokenAddress || '');
  
  // Check if token address is valid
  const isAddressValid = token.chain && token.tokenAddress && isValidTokenAddress(token.chain, token.tokenAddress);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.tokenAddress || 'No address available');
      toast({
        title: "Address copied!",
        description: "Token address has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy address to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/coin/${token.tokenName?.toLowerCase() || 'unknown'}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Token page link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = `${window.location.origin}/coin/${token.tokenName?.toLowerCase() || 'unknown'}`;
    const text = `Check out my new meme coin ${token.tokenName || 'Unknown Token'}! 🚀`;
    
    let shareUrl = "";
    
    switch (platform) {
      case "Twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "Reddit":
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case "Telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const getThemeClasses = () => {
    switch (token.theme) {
      case "light":
        return "bg-white text-gray-900 border-gray-200";
      case "rainbow":
        return "meme-rainbow text-white";
      default:
        return "token-card";
    }
  };

  const getButtonClasses = () => {
    switch (token.buttonStyle) {
      case "pixel":
        return "button-pixel";
      case "glow":
        return "button-glow neon-glow";
      default:
        return "button-rounded";
    }
  };

  const getFontClasses = () => {
    switch (token.fontStyle) {
      case "comic":
        return "font-comic";
      case "pixel":
        return "font-pixel";
      case "futuristic":
        return "font-futuristic";
      default:
        return "font-sans";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("max-w-4xl mx-auto", className)}
    >
      <Card className={cn("p-8 border-2", getThemeClasses(), getFontClasses())}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
            {/* Token Logo */}
            <div className="flex-shrink-0">
              {token.logoUrl ? (
                <img 
                  src={token.logoUrl} 
                  alt={`${token.tokenName} Logo`} 
                  className="w-32 h-32 rounded-full border-4 border-primary shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-primary shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                  {token.tokenName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {/* Chain logo badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 border-2 border-primary">
                <Circle className="w-8 h-8" />
              </div>
            </div>
            
            {/* Token Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 mb-4">
                <h1 className="text-4xl font-bold">{token.tokenName || 'Unknown Token'}</h1>
                <Badge className={cn("text-white font-semibold", chainColors[token.chain as keyof typeof chainColors])}>
                  {token.chain || 'Unknown'}
                </Badge>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <div className="text-sm opacity-70 mb-2">Contract Address</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm break-all mr-2">{token.tokenAddress || 'No address available'}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyAddress}
                    className={cn("flex-shrink-0", getButtonClasses())}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* View Count */}
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-6">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-semibold">{(token.viewCount || 0).toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* DEX Links */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              View on DEX Terminals
            </h3>
            
            {!isAddressValid ? (
              <div className="text-center mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-semibold">❌ Invalid token address for {token.chain || 'selected chain'}</div>
                <div className="text-sm text-red-300 mt-1">
                  {token.chain === 'solana' 
                    ? 'Solana addresses must be Base58 format (32-44 characters)'
                    : 'EVM addresses must start with 0x and be 42 characters long'
                  }
                </div>
              </div>
            ) : (
              <div className="text-center mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="text-green-400 font-semibold">✅ Valid token address for {token.chain}</div>
                <div className="text-sm text-green-300 mt-1">
                  Token promoted on DEX terminals, click to preview
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dexLinks.map((link) => (
                <Button
                  key={link.name}
                  className={cn(
                    "pixel-hover", 
                    link.color, 
                    getButtonClasses(),
                    link.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!link.disabled) {
                      window.open(link.url, '_blank');
                    } else {
                      toast({
                        title: "Invalid Address",
                        description: `Cannot open ${link.name} - token address is invalid for ${token.chain || 'selected chain'}`,
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={link.disabled}
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Social Share */}
          <div className="border-t border-white/20 pt-6">
            <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Token
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  className={cn("social-button pixel-hover", social.color, getButtonClasses())}
                  onClick={() => handleSocialShare(social.name)}
                >
                  <social.icon className="w-4 h-4 mr-2" />
                  <span>{social.name}</span>
                </Button>
              ))}
              <Button
                className={cn("social-button pixel-hover bg-purple-500 hover:bg-purple-600", getButtonClasses())}
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
