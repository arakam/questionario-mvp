/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563eb',
        'primary-blue-dark': '#1d4ed8',
        'primary-orange': '#f97316',
        'primary-orange-dark': '#ea580c',
        'accent-blue': '#3b82f6',
        'accent-orange': '#fb923c',
      },
    },
  },
};
