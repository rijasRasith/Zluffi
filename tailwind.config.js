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
          'zluffi': {
            'dark-brown': '#3E362E',
            'medium-brown': '#865D36',
            'light-brown': '#93785B',
            'tan': '#AC8968',
            'clay': '#A69080',
            'slate': '#4A4A4A',
            'sky': '#6BBBDC',
            'fern': '#7CAA72',
          },
        },
      },
    },
    plugins: [],
  }
  