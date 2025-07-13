import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  name: string;
  preview: string;
  description: string;
}

const themes: Theme[] = [
  { id: "dark", name: "Dark", preview: "bg-gray-800", description: "Classic dark theme" },
  { id: "light", name: "Light", preview: "bg-gray-100", description: "Clean light theme" },
  { id: "rainbow", name: "Rainbow", preview: "bg-gradient-to-r from-pink-500 to-purple-500", description: "Colorful meme theme" },
  { id: "matrix", name: "Matrix", preview: "bg-black border border-green-500", description: "Hacker aesthetic" },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeSelect: (themeId: string) => void;
}

export default function ThemeSelector({ selectedTheme, onThemeSelect }: ThemeSelectorProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-center">🎨 Customize Your Page Theme</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "theme-button text-center cursor-pointer",
              selectedTheme === theme.id && "active"
            )}
            onClick={() => onThemeSelect(theme.id)}
          >
            <div className={cn("w-12 h-12 rounded-lg mx-auto mb-2", theme.preview)}></div>
            <div className="font-semibold text-sm">{theme.name}</div>
            <div className="text-xs text-gray-400">{theme.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
