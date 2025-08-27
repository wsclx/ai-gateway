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
        // Design-Token-Integration
        primary: 'var(--brand-primary)',
        secondary: 'var(--brand-secondary)',
        accent: 'var(--brand-accent)',
        success: 'var(--brand-success)',
        warning: 'var(--brand-warning)',
        error: 'var(--brand-error)',
        info: 'var(--brand-info)',
        
        // Background Colors
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-overlay': 'var(--color-bg-overlay)',
        
        // Text Colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-inverse': 'var(--color-text-inverse)',
        'text-muted': 'var(--color-text-muted)',
        
        // Border Colors
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-focus': 'var(--color-border-focus)',
        'border-divider': 'var(--color-border-divider)',
      },
      spacing: {
        // Design-Token-Integration
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
        '32': 'var(--spacing-32)',
      },
      borderRadius: {
        // Design-Token-Integration
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        // Design-Token-Integration
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      fontFamily: {
        // Design-Token-Integration
        'sans': 'var(--font-family-sans)',
        'mono': 'var(--font-family-mono)',
      },
      fontSize: {
        // Design-Token-Integration
        'xs': 'var(--typography-fontSize-xs)',
        'sm': 'var(--typography-fontSize-sm)',
        'base': 'var(--typography-fontSize-base)',
        'lg': 'var(--typography-fontSize-lg)',
        'xl': 'var(--typography-fontSize-xl)',
        '2xl': 'var(--typography-fontSize-2xl)',
        '3xl': 'var(--typography-fontSize-3xl)',
        '4xl': 'var(--typography-fontSize-4xl)',
        '5xl': 'var(--typography-fontSize-5xl)',
      },
      fontWeight: {
        // Design-Token-Integration
        'normal': 'var(--typography-fontWeight-normal)',
        'medium': 'var(--typography-fontWeight-medium)',
        'semibold': 'var(--typography-fontWeight-semibold)',
        'bold': 'var(--typography-fontWeight-bold)',
      },
      lineHeight: {
        // Design-Token-Integration
        'tight': 'var(--typography-lineHeight-tight)',
        'normal': 'var(--typography-lineHeight-normal)',
        'relaxed': 'var(--typography-lineHeight-relaxed)',
      },
      animation: {
        // Design-Token-Integration
        'fade-in': 'fadeIn var(--motion-duration-normal) var(--motion-easing-default)',
        'slide-up': 'slideUp var(--motion-duration-normal) var(--motion-easing-default)',
        'scale-in': 'scaleIn var(--motion-duration-fast) var(--motion-easing-default)',
        'slide-in-from-bottom': 'slideInFromBottom var(--motion-duration-normal) var(--motion-easing-default)',
        'slide-in-from-top': 'slideInFromTop var(--motion-duration-normal) var(--motion-easing-default)',
        'slide-in-from-left': 'slideInFromLeft var(--motion-duration-normal) var(--motion-easing-default)',
        'slide-in-from-right': 'slideInFromRight var(--motion-duration-normal) var(--motion-easing-default)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        // Design-Token-Integration
        'fast': 'var(--motion-duration-fast)',
        'normal': 'var(--motion-duration-normal)',
        'slow': 'var(--motion-duration-slow)',
      },
      transitionTimingFunction: {
        // Design-Token-Integration
        'default': 'var(--motion-easing-default)',
        'in': 'var(--motion-easing-in)',
        'out': 'var(--motion-easing-out)',
        'inOut': 'var(--motion-easing-inOut)',
      },
      zIndex: {
        // Design-Token-Integration
        'dropdown': 'var(--zIndex-dropdown)',
        'sticky': 'var(--zIndex-sticky)',
        'fixed': 'var(--zIndex-fixed)',
        'modal': 'var(--zIndex-modal)',
        'popover': 'var(--zIndex-popover)',
        'tooltip': 'var(--zIndex-tooltip)',
      },
      screens: {
        // Design-Token-Integration
        'sm': 'var(--breakpoints-sm)',
        'md': 'var(--breakpoints-md)',
        'lg': 'var(--breakpoints-lg)',
        'xl': 'var(--breakpoints-xl)',
        '2xl': 'var(--breakpoints-2xl)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
