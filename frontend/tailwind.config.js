/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // By using 'var()', we tell Tailwind to use the CSS variables from index.css.
        // This makes the theme dynamic.
        'dark-bg-primary': 'var(--bg-secondary)',
        'dark-bg-secondary': 'var(--bg-primary)', // Swapped to match your naming
        'dark-text-light': 'var(--text-primary)',
        'dark-text-lighter': 'var(--text-primary)', // Can use the same for simplicity
        'dark-text-muted': 'var(--text-secondary)',

        'accent-teal': 'var(--accent-primary)',
        'accent-pink': 'var(--accent-secondary)',
        
        // These can remain hardcoded as they are for status (success/error)
        // and likely won't change with the mood theme.
        'accent-purple': '#A633F0',
        'accent-green-positive': '#4CAF50',
        'accent-red-negative': '#EF4444',
      },
    },
  },
  plugins: [],
}