import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#8b5cf6',
          warning: '#f97316',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#3abff8',
          success: '#36d399',
          error: '#f87272',
        },
      },
    ],
  },
}
