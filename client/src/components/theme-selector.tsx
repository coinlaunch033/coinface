import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  isCreator?: boolean;
}

export default function ThemeSelector({ selectedTheme, onThemeSelect, isCreator = false }: ThemeSelectorProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-center">🎨 Customize Your Page Theme</h3>
      {isCreator && (
        <p className="text-sm text-center text-gray-400 mb-6">
          Set your preferred theme for visitors to see
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-center"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={cn("w-12 h-12 rounded-lg", theme.preview)}></div>
              <Label htmlFor={`theme-${theme.id}`} className="text-sm font-medium">
                {theme.name}
              </Label>
              <Switch
                id={`theme-${theme.id}`}
                checked={selectedTheme === theme.id}
                onCheckedChange={(checked) => checked && onThemeSelect(theme.id)}
              />
              <div className="text-xs text-gray-400">{theme.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
