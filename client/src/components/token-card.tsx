import { motion } from "framer-motion";
import { Copy, ExternalLink, Lightbulb, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Token } from "@shared/schema";
import { dexLogos, socialLogos } from "@/assets/logos";

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

const dexLinks = [
  { name: "DexScreener", logo: dexLogos.dexscreener, color: "bg-blue-500 hover:bg-blue-600", url: "https://dexscreener.com" },
  { name: "BirdEye", logo: dexLogos.birdeye, color: "bg-green-500 hover:bg-green-600", url: "https://birdeye.so" },
  { name: "GeckoTerminal", logo: dexLogos.geckoterminal, color: "bg-purple-500 hover:bg-purple-600", url: "https://geckoterminal.com" },
  { name: "GMGN", logo: dexLogos.gmgn, color: "bg-orange-500 hover:bg-orange-600", url: "https://gmgn.ai" },
];

const socialLinks = [
  { name: "Twitter", logo: socialLogos.twitter, color: "bg-blue-400 hover:bg-blue-500", url: "https://twitter.com/intent/tweet" },
  { name: "Reddit", logo: socialLogos.reddit, color: "bg-orange-500 hover:bg-orange-600", url: "https://reddit.com/submit" },
  { name: "Telegram", logo: socialLogos.telegram, color: "bg-blue-500 hover:bg-blue-600", url: "https://t.me/share/url" },
];

export default function TokenCard({ token, className }: TokenCardProps) {
  const { toast } = useToast();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.tokenAddress);
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
      const url = `${window.location.origin}/coin/${token.tokenName.toLowerCase()}`;
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
    const url = `${window.location.origin}/coin/${token.tokenName.toLowerCase()}`;
    const text = `Check out my new meme coin ${token.tokenName}! 🚀`;
    
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
                  {token.tokenName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Token Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 mb-4">
                <h1 className="text-4xl font-bold">{token.tokenName}</h1>
                <Badge className={cn("text-white font-semibold", chainColors[token.chain as keyof typeof chainColors])}>
                  {token.chain}
                </Badge>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <div className="text-sm opacity-70 mb-2">Contract Address</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm break-all mr-2">{token.tokenAddress}</span>
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
                <span className="text-lg font-semibold">{token.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* DEX Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {dexLinks.map((link) => (
              <Button
                key={link.name}
                className={cn("pixel-hover", link.color, getButtonClasses())}
                onClick={() => window.open(link.url, '_blank')}
              >
                <img src={link.logo} alt={`${link.name} logo`} className="w-4 h-4 mr-2" />
                {link.name}
              </Button>
            ))}
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
                  <img src={social.logo} alt={`${social.name} logo`} className="w-4 h-4 mr-2" />
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
