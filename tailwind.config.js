/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-600': 'var(--brand-primary-600)',
          'primary-700': 'var(--brand-primary-700)',
          'primary-050': 'var(--brand-primary-050)',
          'primary-100': 'var(--brand-primary-100)',
          teal: 'var(--brand-teal)',
          'teal-600': 'var(--brand-teal-600)',
          'teal-050': 'var(--brand-teal-050)',
        },
        bg: {
          app:       'var(--bg-app)',
          surface:   'var(--bg-surface)',
          'surface-2': 'var(--bg-surface-2)',
          'surface-3': 'var(--bg-surface-3)',
        },
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        txt: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          inverse:   'var(--text-inverse)',
        },
        status: {
          present: 'var(--status-present)',
          late:    'var(--status-late)',
          absent:  'var(--status-absent)',
          leave:   'var(--status-leave)',
          pending: 'var(--status-pending)',
        },
        sidebar: {
          bg:      'var(--sidebar-bg)',
          border:  'var(--sidebar-border)',
          active:  'var(--sidebar-active)',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      borderRadius: {
        card:  '16px',
        btn:   '10px',
        badge: '6px',
        xl2:   '20px',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        glow: '0 0 24px rgba(47,107,255,0.30)',
        'glow-teal': '0 0 20px rgba(18,181,165,0.25)',
        'dropdown': '0 8px 32px rgba(14,27,52,0.14), 0 2px 8px rgba(14,27,52,0.06)',
        'inner-highlight': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'count-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.6s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':  'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-600) 60%, var(--brand-teal-600) 100%)',
      }
    }
  },
  plugins: []
};
