import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf6f7',
          100: '#f8e9ec',
          200: '#f0d2d8',
          300: '#e5aab5',
          400: '#d27586',
          500: '#b9495e',
          600: '#8B1E2D',
          700: '#731723',
          800: '#5b121d',
          900: '#3a0c13',
          950: '#22070b',
        },
        vortex: {
          dark: '#0a0a1a',
          deeper: '#0f0c29',
          mid: '#302b63',
          light: '#24243e',
          accent: '#6366f1',
        },
        category: {
          technical: '#3b82f6',
          workshop: '#8b5cf6',
          cultural: '#ec4899',
          sports: '#22c55e',
          seminar: '#f97316',
          hackathon: '#ef4444',
          webinar: '#06b6d4',
          conference: '#eab308',
          other: '#6b7280',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-vortex': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(99, 102, 241, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
