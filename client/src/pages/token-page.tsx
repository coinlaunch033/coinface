import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FloatingEmojis from "@/components/floating-emojis";
import TokenCard from "@/components/token-card";
import { apiRequest } from "@/lib/queryClient";
import type { Token } from "@shared/schema";

export default function TokenPage() {
  const { tokenName } = useParams<{ tokenName: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  const { data: token, isLoading, error } = useQuery<Token>({
    queryKey: ["/api/tokens", tokenName],
    enabled: !!tokenName,
  });

  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tokens/${tokenName}/view`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens", tokenName] });
    },
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareOnTwitter = (token: Token) => {
    const text = `Check out ${token.tokenName} on COINFACE! 🚀 #${token.tokenName} #memecoin #crypto`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = (token: Token) => {
    const text = `Check out ${token.tokenName} on COINFACE! 🚀`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnReddit = (token: Token) => {
    const title = `${token.tokenName} - Promote Your Meme Coin`;
    const url = `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The share link has been copied to your clipboard.",
    });
  };

  useEffect(() => {
    if (token && !hasIncrementedView) {
      incrementViewMutation.mutate();
      setHasIncrementedView(true);
    }
  }, [token, hasIncrementedView]);

  // Update page title and meta tags
  useEffect(() => {
    if (token) {
      document.title = `${token.tokenName} - COINFACE`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Trade and showcase ${token.tokenName} meme coin with COINFACE. View on DexScreener, Birdeye, and more.`);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${token.tokenName} - COINFACE`);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', `Trade and showcase ${token.tokenName} meme coin with COINFACE`);
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && token.logoUrl) {
        ogImage.setAttribute('content', `${window.location.origin}${token.logoUrl}`);
      }
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen meme-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <div className="text-2xl font-bold mb-2 text-white">Loading Token Page...</div>
          <div className="text-gray-300">Please wait while we fetch your token data</div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen meme-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-2xl font-bold mb-2 text-white">Token Not Found</div>
          <div className="text-gray-300 mb-6">The token you're looking for doesn't exist or has been removed.</div>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen meme-gradient text-white relative overflow-hidden">
      <FloatingEmojis />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-4 cursor-pointer">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">
              COINFACE
            </div>
            <div className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
              Beta 🚀
            </div>
          </div>
        </Link>
        
        <Link href="/">
          <Button variant="outline" className="bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 border-white border-opacity-20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Promote New Token
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Meme-style Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <span className="text-4xl">💎</span>
              Share Your Token with the World
            </h2>
          </motion.div>

          {/* Token Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <TokenCard token={token} />
          </motion.div>
          
          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 text-center"
          >
            <h3 className="text-xl font-bold mb-4">📢 Share This Token</h3>
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                onClick={() => shareOnTwitter(token)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                🐦 Twitter
              </Button>
              <Button
                onClick={() => shareOnTelegram(token)}
                className="bg-blue-400 hover:bg-blue-500"
              >
                📱 Telegram
              </Button>
              <Button
                onClick={() => shareOnReddit(token)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                🔗 Reddit
              </Button>
            </div>
            <div className="text-sm text-gray-400 mb-2">Share Link:</div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="text-white border-gray-700 hover:bg-gray-700"
              >
                📋 Copy
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
