import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FloatingEmojis from "@/components/floating-emojis";
import ChainSelector from "@/components/chain-selector";
import ThemeSelector from "@/components/theme-selector";
import { useLocation, Link } from "wouter";
import { dexLogos } from "@/assets/logos";

const step1Schema = z.object({
  chain: z.string().min(1, "Please select a chain"),
  tokenAddress: z.string().min(1, "Please enter a token address"),
});

const step2Schema = z.object({
  tokenName: z.string().min(1, "Please enter a token name"),
  logo: z.any().optional(),
  theme: z.string().default("dark"),
  buttonStyle: z.string().default("rounded"),
  fontStyle: z.string().default("sans"),
  email: z.string().email().optional().or(z.literal("")),
  twitter: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const paymentAmounts = {
  solana: "~0.15 SOL",
  ethereum: "~0.008 ETH",
  base: "~0.008 ETH",
  bnb: "~0.05 BNB",
  polygon: "~15 MATIC",
};

const chainNames = {
  solana: "Solana",
  ethereum: "Ethereum",
  base: "Base",
  bnb: "BNB Chain",
  polygon: "Polygon",
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      chain: "",
      tokenAddress: "",
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      tokenName: "",
      theme: "dark",
      buttonStyle: "rounded",
      fontStyle: "sans",
      email: "",
      twitter: "",
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/tokens", data);
      return response.json();
    },
    onSuccess: (token) => {
      toast({
        title: "Token page is live! 🎉",
        description: `Your token page is now live at /coin/${token.tokenName.toLowerCase()}`,
      });
      setLocation(`/coin/${token.tokenName.toLowerCase()}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: { chain: string; amount: string; tokenName: string }) => {
      const response = await apiRequest("POST", "/api/payment", data);
      return response.json();
    },
  });

  const handleStep1Submit = async (data: Step1Data) => {
    setIsLoading(true);
    
    try {
      // Process payment first
      await paymentMutation.mutateAsync({
        chain: data.chain,
        amount: paymentAmounts[data.chain as keyof typeof paymentAmounts],
        tokenName: "payment-step1", // Temporary name for payment
      });
      
      // Payment successful, proceed to step 2
      setStep1Data(data);
      setCurrentStep(2);
      
      toast({
        title: "Payment successful!",
        description: "Now customize your token promotion page",
      });
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    setIsGenerating(true);

    try {
      // Create token page (payment was already processed in step 1)
      const formData = new FormData();
      formData.append("tokenName", data.tokenName);
      formData.append("tokenAddress", step1Data.tokenAddress);
      formData.append("chain", step1Data.chain);
      formData.append("theme", data.theme);
      formData.append("buttonStyle", data.buttonStyle);
      formData.append("fontStyle", data.fontStyle);

      if (data.logo && data.logo[0]) {
        formData.append("logo", data.logo[0]);
      }

      console.log("Form data being sent:", {
        tokenName: data.tokenName,
        tokenAddress: step1Data.tokenAddress,
        chain: step1Data.chain,
        theme: data.theme,
        buttonStyle: data.buttonStyle,
        fontStyle: data.fontStyle,
        hasLogo: !!(data.logo && data.logo[0])
      });

      await createTokenMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Token creation error:", error);
      toast({
        title: "Token creation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChainSelect = (chainId: string) => {
    step1Form.setValue("chain", chainId);
  };

  const handleThemeSelect = (themeId: string) => {
    step2Form.setValue("theme", themeId);
  };

  return (
    <div className="min-h-screen meme-gradient text-white relative overflow-hidden">
      <FloatingEmojis />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            MemeSite
          </motion.div>
          <div className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
            Beta 🚀
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/memedrop">
            <Button variant="ghost" className="hover:bg-white hover:bg-opacity-20 text-yellow-400">
              🎁 MemeDrop
            </Button>
          </Link>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 neon-glow">
            Connect Wallet
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Promote Your Meme Coin
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
                Get a <span className="text-green-400 font-bold">fully generated website</span> for your meme coin in 2 easy steps. 
                Pay just <span className="text-yellow-400 font-bold">$15 USD</span> and start promoting! 🚀
              </p>
              
              <div className="flex justify-center space-x-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">2</div>
                  <div className="text-sm text-gray-300">Easy Steps</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-400">$15</div>
                  <div className="text-sm text-gray-300">Flat Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="text-3xl font-bold text-purple-400">5</div>
                  <div className="text-sm text-gray-300">Chains</div>
                </div>
              </div>
            </div>

            {/* Step 1 Form */}
            <div className="max-w-2xl mx-auto mb-12">
              <Card className="glass-card p-8">
                <CardContent className="p-0">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4">1</div>
                    <h2 className="text-2xl font-bold">Select Chain & Pay $15</h2>
                  </div>
                  
                  <Form {...step1Form}>
                    <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                      <FormField
                        control={step1Form.control}
                        name="chain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">Choose Your Chain</FormLabel>
                            <FormControl>
                              <ChainSelector
                                selectedChain={field.value}
                                onChainSelect={handleChainSelect}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step1Form.control}
                        name="tokenAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">Token Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your token contract address..."
                                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <div className="text-sm text-gray-400">
                              ℹ️ This will be displayed on your promotion page
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Section */}
                      <div className="bg-gradient-to-r from-purple-500 bg-opacity-20 to-pink-500 bg-opacity-20 rounded-lg p-6 mt-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          💳 Payment - $15 USD
                        </h3>
                        <div className="text-sm text-gray-300 mb-4">
                          Pay in native token of your selected chain. Rate automatically calculated.
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center">
                            <span>Selected Chain:</span>
                            <span className="font-bold text-purple-400">
                              {step1Form.watch("chain") ? chainNames[step1Form.watch("chain") as keyof typeof chainNames] : "Select a chain"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span>Amount:</span>
                            <span className="font-bold text-green-400">
                              {step1Form.watch("chain") ? paymentAmounts[step1Form.watch("chain") as keyof typeof paymentAmounts] : "Select a chain"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-4 text-lg font-bold neon-glow"
                      >
                        {isLoading ? "Processing Payment..." : "Promote Coin 🚀"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* How it Works Section */}
            <div className="mb-12 glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold mb-3 text-purple-400">Step 1: Promote Your Coin</h3>
                  <p className="text-gray-300">
                    Select your blockchain, enter your token address, and pay just $15 USD equivalent to get started. No complex setup required.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold mb-3 text-pink-400">Step 2: Customize & Share</h3>
                  <p className="text-gray-300">
                    Upload your token logo, set your token name, and get an instant promotional website with social sharing and DEX links.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-3 text-green-400">Instant Results</h3>
                <p className="text-gray-300 mb-6">
                  Your coin will be promoted on <span className="text-yellow-400 font-bold">DexScreener</span>, <span className="text-blue-400 font-bold">GMGN</span>, <span className="text-purple-400 font-bold">Axiom</span>, and more! Plus get a <span className="text-green-400 font-bold">free website generated</span> for you with all the tools you need to succeed.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex flex-col items-center">
                    <img src={dexLogos.dexscreener} alt="DexScreener" className="w-8 h-8 mb-2" />
                    <div className="text-sm font-bold">DexScreener</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex flex-col items-center">
                    <img src={dexLogos.gmgn} alt="GMGN" className="w-8 h-8 mb-2" />
                    <div className="text-sm font-bold">GMGN</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex flex-col items-center">
                    <img src={dexLogos.geckoterminal} alt="GeckoTerminal" className="w-8 h-8 mb-2" />
                    <div className="text-sm font-bold">GeckoTerminal</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex flex-col items-center">
                    <div className="text-2xl mb-2">🌐</div>
                    <div className="text-sm font-bold">Free Website</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* MemeDrop Notification - Top, full width */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-1 rounded-lg w-full">
                <div className="bg-gray-900 rounded-lg p-4 text-left">
                  <div className="text-2xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">You're entered into this week's MemeDrop!</h3>
                  <p className="text-gray-300 mb-3">Winner announced Sunday - 1 SOL prize!</p>
                  <Link href="/memedrop">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
                      View MemeDrop Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Step 2 Form */}
              <div>
                <Card className="glass-card p-8">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4">2</div>
                      <h2 className="text-2xl font-bold">Customize Your Token Page</h2>
                    </div>
                    
                    <Form {...step2Form}>
                      <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                        <FormField
                          control={step2Form.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg font-semibold">Upload Meme Logo</FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-white border-opacity-30 rounded-lg p-8 text-center hover:border-purple-500 transition-all">
                                  <div className="text-4xl mb-2">📷</div>
                                  <div className="text-lg font-semibold mb-2">Drop your logo here</div>
                                  <div className="text-sm text-gray-400 mb-4">PNG, JPEG up to 5MB</div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => field.onChange(e.target.files)}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                  >
                                    Choose File
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={step2Form.control}
                          name="tokenName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg font-semibold">Custom Token Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., PepeBlaster, ShibaMoon..."
                                  className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-4 text-lg font-bold neon-glow"
                        >
                          {isGenerating ? "Generating Website..." : "Generate Promotion Site 🚀"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="w-full bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 border-white border-opacity-20"
                        >
                          ← Back to Step 1
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Theme Selector */}
              <div>
                <ThemeSelector
                  selectedTheme={step2Form.watch("theme")}
                  onThemeSelect={handleThemeSelect}
                  isCreator={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading Overlay - Only for step 2 generation */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <div className="text-2xl font-bold mb-2">
              Generating Your Token Page...
            </div>
            <div className="text-gray-300">
              Please wait while we create your awesome site!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
