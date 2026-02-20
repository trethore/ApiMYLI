import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        "background-secondary": "hsl(var(--background-secondary))",
        foreground: "hsl(var(--foreground))",
        "foreground-secondary": "hsl(var(--foreground-secondary))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-bis": "hsl(var(--primary-bis))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-bis": "hsl(var(--secondary-bis))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Keeping "muse-*" for direct reference if needed, but mapped to variables
        "muse-dark-blue": "hsl(var(--color-dark-blue))",
        "muse-sky-blue": "hsl(var(--color-sky-blue))",
        "muse-purple": "hsl(var(--color-purple))",
        "muse-pink": "hsl(var(--color-pink))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-alexandria)", "system-ui", "sans-serif"],
        heading: ["var(--font-protest-strike)", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
