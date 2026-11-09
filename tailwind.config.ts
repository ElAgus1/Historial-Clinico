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
        // Brand colors (teal)
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Semantic background colors (use 'surface' to avoid 'bg-' prefix conflict)
        surface: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          inverse: 'var(--color-bg-inverse)',
        },
        // Semantic border colors (use 'stroke' to avoid 'border-' prefix conflict)
        stroke: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          focus: 'var(--color-border-focus)',
          inverse: 'var(--color-border-inverse)',
        },
        // Semantic text colors (use 'content' to avoid 'text-' prefix conflict)
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        // Status colors - Success
        success: {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
          border: 'var(--color-success-border)',
        },
        // Status colors - Warning
        warning: {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
          border: 'var(--color-warning-border)',
        },
        // Status colors - Error
        error: {
          bg: 'var(--color-error-bg)',
          text: 'var(--color-error-text)',
          border: 'var(--color-error-border)',
        },
        // Status colors - Info
        info: {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info-text)',
          border: 'var(--color-info-border)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        in: 'var(--ease-in)',
        spring: 'var(--ease-spring)',
      },
    },
  },
  plugins: [],
};

export default config;