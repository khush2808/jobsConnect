import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/Button";
import { Sun, Moon, Monitor } from "lucide-react";

function ThemeToggle({ variant = "icon", className = "" }) {
  const { theme, toggleTheme, setThemeMode } = useTheme();

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => setThemeMode("light")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center space-x-2 ${
                theme === "light" ? "text-primary" : "text-foreground"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center space-x-2 ${
                theme === "dark" ? "text-primary" : "text-foreground"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setThemeMode("system")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center space-x-2 ${
                theme === "system" ? "text-primary" : "text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}

export default ThemeToggle;
