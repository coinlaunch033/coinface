import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Mix of real meme coin symbols and crypto emojis
const cryptoSymbols = [
  "🐕", // Dogecoin
  "🐸", // Pepe
  "🦊", // Shiba Inu
  "🚀", // Rocket
  "💎", // Diamond hands
  "🌙", // To the moon
  "⚡", // Lightning
  "🔥", // Fire
  "💰", // Money
  "🎯", // Target
  "🦄", // Unicorn
  "⭐", // Star
];

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function FloatingEmojis() {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    const generateEmojis = () => {
      const newEmojis: FloatingEmoji[] = [];
      
      for (let i = 0; i < 8; i++) {
        newEmojis.push({
          id: `emoji-${i}`,
          emoji: cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)],
          x: Math.random() * 90 + 5, // 5% to 95% of screen width
          y: Math.random() * 90 + 5, // 5% to 95% of screen height
          delay: Math.random() * 3,
          duration: 3 + Math.random() * 2, // 3-5 seconds
        });
      }
      
      setFloatingEmojis(newEmojis);
    };

    generateEmojis();
    
    // Regenerate emojis every 10 seconds
    const interval = setInterval(generateEmojis, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {floatingEmojis.map((emoji) => (
        <motion.div
          key={emoji.id}
          className="absolute text-4xl select-none"
          style={{
            left: `${emoji.x}%`,
            top: `${emoji.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: emoji.duration,
            repeat: Infinity,
            delay: emoji.delay,
            ease: "easeInOut",
          }}
        >
          {emoji.emoji}
        </motion.div>
      ))}
    </div>
  );
}
