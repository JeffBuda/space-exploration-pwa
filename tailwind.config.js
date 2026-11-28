/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          hover: 'hsl(var(--color-secondary-hover))',
          active: 'hsl(var(--color-secondary-active))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* ── Game status colors (semantic) ──────────────────────────── */
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          bg: 'hsl(var(--color-success-bg))',
          border: 'hsl(var(--color-success-border))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          bg: 'hsl(var(--color-warning-bg))',
          border: 'hsl(var(--color-warning-border))',
        },
        danger: {
          DEFAULT: 'hsl(var(--color-danger))',
          bg: 'hsl(var(--color-danger-bg))',
          border: 'hsl(var(--color-danger-border))',
        },

        /* ── Rarity colors (semantic, game-specific) ──────────────────── */
        rarity: {
          common: 'hsl(var(--color-rarity-common))',
          uncommon: 'hsl(var(--color-rarity-uncommon))',
          rare: 'hsl(var(--color-rarity-rare))',
          epic: 'hsl(var(--color-rarity-epic))',
          legendary: 'hsl(var(--color-rarity-legendary))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
