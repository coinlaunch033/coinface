import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Timer, Users, Zap } from "lucide-react";
import FloatingEmojis from "@/components/floating-emojis";
import { useQuery } from "@tanstack/react-query";

const entrySchema = z.object({
  twitter: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
});

type EntryData = z.infer<typeof entrySchema>;

// Mock previous winners (fake wallet addresses)
const previousWinners = [
  { address: "9WzDXw...K7pQm", week: "Week 1", amount: "1 SOL" },
  { address: "7VbGHs...N2xRt", week: "Week 2", amount: "1 SOL" },
  { address: "4KcMnP...J8wVk", week: "Week 3", amount: "1 SOL" },
];

export default function MemeDrop() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm<EntryData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      twitter: "",
      email: "",
    },
  });

  // Get entry count from API
  const { data: entryCount = 0 } = useQuery<number>({
    queryKey: ["/api/memedrop/entries"],
    enabled: true,
  });

  // Calculate time until next Sunday 9PM UTC
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date();
      
      // Find next Sunday
      const daysUntilSunday = (7 - now.getUTCDay()) % 7;
      nextSunday.setUTCDate(now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      nextSunday.setUTCHours(21, 0, 0, 0); // 9PM UTC
      
      // If it's already past 9PM on Sunday, add 7 days
      if (now.getUTCDay() === 0 && now.getUTCHours() >= 21) {
        nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
      }
      
      const difference = nextSunday.getTime() - now.getTime();
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (data: EntryData) => {
    // Save entry data (would normally save to database)
    console.log("MemeDrop entry:", data);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="min-h-screen meme-gradient text-white relative overflow-hidden">
      <FloatingEmojis />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 10,
                opacity: 0,
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

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
            Back to Home
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🎁 Enter the MemeDrop
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Win <span className="text-yellow-400 font-bold">1 SOL</span> Every Week!
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg neon-glow">
              <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
              <div className="text-sm text-gray-200">Days</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg neon-glow">
              <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
              <div className="text-sm text-gray-200">Hours</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg neon-glow">
              <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
              <div className="text-sm text-gray-200">Minutes</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg neon-glow">
              <div className="text-3xl font-bold text-white">{timeLeft.seconds}</div>
              <div className="text-sm text-gray-200">Seconds</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center">
                <Users className="w-6 h-6 mr-2" />
                {entryCount}
              </div>
              <div className="text-sm text-gray-400">Entries This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                3
              </div>
              <div className="text-sm text-gray-400">Previous Winners</div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* How it Works */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">How MemeDrop Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-purple-400">Promote Your Meme Coin</h4>
                      <p className="text-sm text-gray-300">Pay $15 to promote your token and get a custom website</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-pink-400">Automatic Entry</h4>
                      <p className="text-sm text-gray-300">You're automatically entered into the weekly MemeDrop</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-green-400">Win 1 SOL</h4>
                      <p className="text-sm text-gray-300">Winner announced every Sunday at 9PM UTC</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/">
                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 neon-glow"
                    onClick={triggerConfetti}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    🚀 Promote & Enter
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Entry Form & Previous Winners */}
            <div className="space-y-6">
              {/* Optional Entry Form */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Get Updates (Optional)</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter Handle</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="@yourusername"
                                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your@email.com"
                                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        📧 Get Winner Notifications
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Previous Winners */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">🏆 Previous Winners</h3>
                  <div className="space-y-3">
                    {previousWinners.map((winner, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                        <div>
                          <div className="font-semibold text-yellow-400">{winner.address}</div>
                          <div className="text-sm text-gray-400">{winner.week}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">{winner.amount}</div>
                          <div className="text-sm text-gray-400">Won</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}