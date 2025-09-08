/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tarkov-inspired color palette with improved contrast
        tarkov: {
          // Main background colors - using grays instead of blacks
          dark: '#1a1f2e',        // Dark blue-gray background
          secondary: '#2a3441',   // Secondary dark gray
          tertiary: '#374151',    // Tertiary gray for cards
          accent: '#d4af37',      // Gold accent (Tarkov's signature color)
          
          // Text colors
          light: '#f8fafc',       // Primary light text
          muted: '#94a3b8',       // Muted text with better contrast
          
          // UI colors
          border: '#475569',      // Border color with more contrast
          hover: '#4b5563',       // Hover states
          
          // Status colors
          success: '#22c55e',     // Green for success
          warning: '#f59e0b',     // Orange for warnings
          error: '#ef4444',       // Red for errors
          info: '#3b82f6',        // Blue for info
          
          // Rarity colors (for items)
          common: '#9ca3af',      // Gray
          uncommon: '#22c55e',    // Green
          rare: '#3b82f6',        // Blue
          epic: '#a855f7',        // Purple
          legendary: '#f59e0b',   // Orange
          mythic: '#ef4444',      // Red
          
          // Price change colors
          'price-up': '#22c55e',
          'price-down': '#ef4444',
          'price-neutral': '#6b7280',
        },
        
        // Additional semantic colors
        background: {
          DEFAULT: '#1a1f2e',
          secondary: '#2a3441',
          tertiary: '#374151',
          surface: '#475569',
        },
        
        foreground: {
          DEFAULT: '#f5f5f5',
          muted: '#a1a1aa',
          accent: '#d4af37',
        },
        
        // Component-specific colors
        card: {
          DEFAULT: '#2a3441',
          hover: '#374151',
          border: '#475569',
          elevated: '#334155',
        },
        
        input: {
          DEFAULT: '#374151',
          border: '#475569',
          focus: '#d4af37',
          background: '#2a3441',
        },
        
        button: {
          primary: '#d4af37',
          'primary-hover': '#b8941f',
          secondary: '#475569',
          'secondary-hover': '#64748b',
          ghost: '#374151',
          'ghost-hover': '#475569',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-in': 'slideIn 0.15s ease-out',
        'slide-out': 'slideOut 0.15s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1.5s infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'spin-fast': 'spin 0.5s linear infinite',
        // Garantir que as animações básicas estão disponíveis
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        // Garantir que os keyframes básicos estão disponíveis
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%, 100%': { 
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
          },
          '50%': { 
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        ping: {
          '75%, 100%': { 
            transform: 'scale(2)',
            opacity: '0'
          },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    // Custom plugin for utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Glass morphism effect
        '.glass': {
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(42, 42, 42, 0.5)',
        },
        
        // Gradient text
        '.text-gradient': {
          background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Scrollbar styles
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#2a2a2a #1a1a1a',
        },
        
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#1a1a1a',
        },
        
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: '#2a2a2a',
          borderRadius: '3px',
        },
        
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: '#3a3a3a',
        },
        
        // Hide scrollbar
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
        
        // Focus ring
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            'box-shadow': '0 0 0 2px rgba(212, 175, 55, 0.5)',
          },
        },
        
        // Button hover effects - Optimized
        '.btn-hover': {
          transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
          'will-change': 'transform, box-shadow',
          '&:hover': {
            transform: 'translateY(-1px) translateZ(0)',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
        
        // Card hover effects - Optimized
        '.card-hover': {
          transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
          'will-change': 'transform, box-shadow',
          '&:hover': {
            transform: 'translateY(-2px) translateZ(0)',
            'box-shadow': '0 8px 25px rgba(0, 0, 0, 0.4)',
          },
        },
        
        // GPU acceleration utility
        '.gpu-accelerated': {
          'will-change': 'transform',
          'transform': 'translateZ(0)',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};