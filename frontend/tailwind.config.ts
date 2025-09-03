import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional Dark Theme - REPLACE ALL COLORS
        bg: {
          primary: '#0A0B0E',      // Main background - soft black
          secondary: '#131419',    // Sidebar background
          tertiary: '#1A1B23',     // Card backgrounds
          elevated: '#22232D',     // Elevated surfaces
          hover: '#2A2B38',        // Hover states
        },
        text: {
          primary: '#F7F8F9',      // Primary text - soft white
          secondary: '#B4B7C1',    // Secondary text
          muted: '#787B89',        // Muted text
          disabled: '#4A4D5C',     // Disabled text
        },
        accent: {
          primary: '#5B8DEE',      // Primary blue - professional
          success: '#4FD080',      // Success green
          warning: '#FFB547',      // Warning amber
          error: '#FF6B6B',        // Error red
          purple: '#8B7FD6',       // Secondary purple
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          default: 'rgba(255, 255, 255, 0.09)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        
        // Shadcn/UI Compatibility
        background: '#0A0B0E',
        foreground: '#F7F8F9',
        card: {
          DEFAULT: '#1A1B23',
          foreground: '#F7F8F9',
        },
        popover: {
          DEFAULT: '#1A1B23',
          foreground: '#F7F8F9',
        },
        muted: {
          DEFAULT: '#2A2B38',
          foreground: '#787B89',
        },
        primary: {
          DEFAULT: '#5B8DEE',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#8B7FD6',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#FF6B6B',
          foreground: '#FFFFFF',
        },
        ring: '#5B8DEE',
        input: 'rgba(255, 255, 255, 0.09)',
      },
      
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      
      backdropBlur: {
        'xs': '2px',
      },
      
      boxShadow: {
        'glow-blue': '0 0 30px rgba(91, 141, 238, 0.15)',
        'glow-purple': '0 0 30px rgba(139, 127, 214, 0.15)',
        'glow-success': '0 0 30px rgba(79, 208, 128, 0.15)',
      },
      
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
