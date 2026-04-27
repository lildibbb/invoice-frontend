/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          light: '#6B7280',
          muted: '#9CA3AF',
        },
        accent: {
          DEFAULT: '#0066FF',
          hover: '#0052CC',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          alt: '#F3F4F6',
        },
        border: '#E8E8E8',
        dark: '#0A0A0A',
      },
      animation: {
        'marquee': 'marquee 45s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
};