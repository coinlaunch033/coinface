import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import FloatingEmojis from "@/components/floating-emojis";
import TokenCard from "@/components/token-card";
import ThemeSelector from "@/components/theme-selector";
import { apiRequest } from "@/lib/queryClient";
import type { Token, UpdateTokenTheme } from "@shared/schema";

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

  const updateThemeMutation = useMutation({
    mutationFn: async (themeData: UpdateTokenTheme) => {
      const response = await apiRequest("PATCH", `/api/tokens/${tokenName}/theme`, themeData);
      return response.json();
    },
    onSuccess: (updatedToken) => {
      queryClient.setQueryData(["/api/tokens", tokenName], updatedToken);
      toast({
        title: "Theme updated!",
        description: "Your token page theme has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleThemeSelect = (themeId: string) => {
    if (!token) return;

    updateThemeMutation.mutate({
      theme: themeId,
      buttonStyle: token.buttonStyle,
      fontStyle: token.fontStyle,
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareOnTwitter = (token: Token) => {
    const text = `Check out ${token.tokenName} on MemeSite! 🚀 #${token.tokenName} #memecoin #crypto`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = (token: Token) => {
    const text = `Check out ${token.tokenName} on MemeSite! 🚀`;
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
      document.title = `${token.tokenName} - MemeSite`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Trade and showcase ${token.tokenName} meme coin with MemeSite. View on DexScreener, BirdEye, and more.`);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${token.tokenName} - MemeSite`);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', `Trade and showcase ${token.tokenName} meme coin with MemeSite`);
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
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MemeSite
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
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4">
            <span>✅</span>
            <span className="font-semibold">Token Page is Live!</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Share Your Token with the World</h2>
          <p className="text-gray-300 mb-6">
            Share this link with your community: 
            <span className="text-purple-400 font-mono ml-2">
              {window.location.href}
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Card and Share Section */}
          <div className="space-y-8">
            <TokenCard token={token} />
            
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

          {/* Theme Selector */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ThemeSelector
                selectedTheme={token.theme}
                onThemeSelect={handleThemeSelect}
                isCreator={true}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
