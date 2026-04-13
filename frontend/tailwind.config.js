// tailwind.config.js — built from your existing CSS
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],  // scan all component files

  theme: {
    extend: {
      // ─── Colors ──────────────────────────────────────────
      // From: #752586, #9d4edd, #c060ff, #e0aaff, #00dcff
      colors: {
        purple: {
          brand:  '#752586',   // buttons, profile border
          hover:  '#9d4edd',   // hover accents
          light:  '#c060ff',   // lobby start button
          pale:   '#e0aaff',   // section titles, labels
        },
        cyan: {
          glow:   '#00dcff',   // lobby code, ready badge
        },
        'game-cyan': 'rgb(0 220 255 / <alpha-value>)',
        'game-cyan-soft': 'rgb(0 200 255 / <alpha-value>)',
        'game-purple': 'rgb(180 60 255 / <alpha-value>)',
        'game-purple-soft': 'rgb(200 160 255 / <alpha-value>)',
        'game-panel': 'rgb(10 5 20 / <alpha-value>)',
      },

      fontFamily: {
        'moonstrike': ['Moonstrike', 'sans-serif'],
      },

      // ─── Background opacity shorthands ───────────────────
      backgroundColor: {
        'card':        'rgba(10, 5, 20, 0.75)',
        'card-input':  'rgba(0, 0, 0, 0.3)',
        'btn-muted':   'rgba(255, 255, 255, 0.04)',
        'btn-purple':  'rgba(140, 40, 200, 0.15)',
        'btn-cyan':    'rgba(0, 200, 255, 0.08)',
      },

      // ─── Box shadows ─────────────────────────────────────
      boxShadow: {
        'card': '0 0 40px rgba(125,116,129,0.2), inset 0 0 20px rgba(169,98,216,0.4)',
        'btn-purple': '0 0 16px rgba(140, 40, 200, 0.3)',
        'btn-cyan': '0 0 16px rgba(0, 200, 255, 0.3)',
        'glow-purple': '0 0 16px rgba(140, 40, 200, 0.4)',
      },

      // ─── Text shadows (via plugin) ───────────────────────
      textShadow: {
        'purple':  '0 0 12px rgba(180, 80, 255, 0.8)',
        'purple-lg': '0 0 20px rgba(180, 80, 255, 1), 0 0 40px rgba(180, 80, 255, 0.4)',
        'cyan':    '0 0 12px rgba(0, 220, 255, 0.6)',
      },

      // ─── Border colors (rgba) ────────────────────────────
      borderColor: {
        'purple-dim':  'rgba(180, 60, 255, 0.15)',
        'purple-mid':  'rgba(180, 60, 255, 0.4)',
        'purple-str':  'rgba(180, 60, 255, 0.6)',
        'cyan-mid':    'rgba(0, 220, 255, 0.25)',
        'cyan-str':    'rgba(0, 220, 255, 0.5)',
      },

      // ─── Letter spacing ──────────────────────────────────
      // From: letter-spacing: 0.15em, 0.35em etc.
      letterSpacing: {
        'ui':    '0.12em',
        'title': '0.15em',
        'code':  '0.35em',
      },

      // ─── Width / height ──────────────────────────────────
      width: { '18': '4.5rem' },
      height: { '18': '4.5rem' },

      // ─── Animations ──────────────────────────────────────
      // Keyframes stay in CSS (or global.css) — see last tab
      keyframes: {
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'crt-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'crt-pulse': {
          '0%, 100%': { textShadow: '0 0 12px rgba(180, 80, 255, 0.8)' },
          '50%': { textShadow: '0 0 20px rgba(180, 80, 255, 1), 0 0 40px rgba(180, 80, 255, 0.4)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'rotate-phone': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(90deg)' },
        },
      },
      animation: {
        'pulse-name':  'pulse-name 1.5s ease-in-out infinite',
        'dot-bounce':  'dot-bounce 1.4s ease-in-out infinite',
        'crt-blink':   'crt-blink 1.5s step-end infinite',
        'crt-pulse':   'crt-pulse 2s ease-in-out infinite',
        'fade-in':     'fade-in 0.6s ease forwards',
        'pulse-check': 'pulse-check 1.2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'rotate-phone': 'rotate-phone 1.5s ease-in-out infinite',
      },
    },
  },

  plugins: [
    // text-shadow isn't built into Tailwind — add it via plugin
    function({ matchUtilities, theme }) {
      matchUtilities(
        { 'text-shadow': (value) => ({ textShadow: value }) },
        { values: theme('textShadow') }
      );
    },
  ],
};
