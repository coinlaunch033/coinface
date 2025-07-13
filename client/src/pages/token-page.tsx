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
              v1.0 🚀
            </div>
          </div>
        </Link>
        
        <Link href="/">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Create New Token
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

        {/* Token Card */}
        <TokenCard token={token} className="mb-8" />

        {/* Theme Selector */}
        <ThemeSelector
          selectedTheme={token.theme}
          onThemeSelect={handleThemeSelect}
        />
      </div>
    </div>
  );
}
