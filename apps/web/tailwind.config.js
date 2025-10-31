/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SillyTavern specific colors
        "tavern-dark": {
          DEFAULT: "#171717",
          light: "#2a2a2a",
        },
        "tavern-purple": {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
        },
        "tavern-accent": {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
        },
        // Chat message colors
        "user-message": {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
        },
        "ai-message": {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xs': 'var(--radius-sm)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        'xs': 'var(--font-xs)',      // 12px
        'sm': 'var(--font-sm)',      // 14px
        'base': 'var(--font-base)',  // 16px
        'lg': 'var(--font-lg)',      // 18px
        'xl': 'var(--font-xl)',      // 20px
        '2xl': 'var(--font-2xl)',    // 24px
        '3xl': 'var(--font-3xl)',    // 30px
        '4xl': 'var(--font-4xl)',    // 36px
        '5xl': 'var(--font-5xl)',    // 48px
      },
      lineHeight: {
        'tight': 'var(--leading-tight)',
        'normal': 'var(--leading-normal)',
        'relaxed': 'var(--leading-relaxed)',
        'loose': 'var(--leading-loose)',
      },
      fontWeight: {
        'light': 'var(--font-light)',
        'normal': 'var(--font-normal)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'rose': 'var(--shadow-rose)',
        'gold': 'var(--shadow-gold)',
        'rose-gold': 'var(--shadow-rose-gold)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "typing-indicator": {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "typing": "typing-indicator 1.4s infinite ease-in-out",
      },
      // Custom spacing and sizes for SillyTavern UI (8px base grid)
      spacing: {
        'xs': 'var(--spacing-xs)',   // 4px
        'sm': 'var(--spacing-sm)',   // 8px
        'md': 'var(--spacing-md)',   // 16px
        'lg': 'var(--spacing-lg)',   // 24px
        'xl': 'var(--spacing-xl)',   // 32px
        '2xl': 'var(--spacing-2xl)', // 48px
        '3xl': 'var(--spacing-3xl)', // 64px
        '4xl': 'var(--spacing-4xl)', // 96px
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animationDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}