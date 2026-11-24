import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        canvas: {
          bg: "#F8F7F4",
          surface: "#FFFFFF",
          subtle: "#F4F1EA",
          muted: "#EFECE6",
          border: "#E6E2D8",
          borderHover: "#CFC9BC",
          dark: "#1C1917",
          darkSurface: "#292524",
        },
        civic: {
          900: "#0D281E",
          800: "#1B4332",
          700: "#2D6A4F",
          600: "#40916C",
          500: "#52B788",
          200: "#B7E4C7",
          100: "#D8F3DC",
          50: "#ECFDF5",
        },
        urgency: {
          terracotta: "#C2410C",
          amber: "#B45309",
          slate: "#57534E",
          charcoal: "#1C1917",
        },
        primary: {
          50: "#ECFDF5",
          100: "#D8F3DC",
          200: "#B7E4C7",
          300: "#74C69D",
          400: "#52B788",
          500: "#1B4332",
          600: "#2D6A4F",
          700: "#1B4332",
          800: "#0D281E",
          900: "#081C15",
          950: "#040F0B",
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(28, 25, 23, 0.06)',
        'card-hover': '0 6px 16px rgba(28, 25, 23, 0.10)',
        'hero': '0 10px 30px -10px rgba(27, 67, 50, 0.35)',
        'modal': '0 20px 40px -10px rgba(28, 25, 23, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
        'lg': '10px',
        'md': '8px',
        'sm': '6px',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
