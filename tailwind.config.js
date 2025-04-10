const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors'); // Import default colors if you want to reference them

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other config like darkMode, content ...

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Remove oklch and define colors using HEX or RGB
        // Example: Overriding the 'green' scale
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // <-- Your bg-green-500 will now use this HEX value
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // You might need to override other colors you use frequently too
        // e.g., gray, red, blue, etc.
        // You can copy the HEX values from the Tailwind CSS documentation
        // or use the imported 'colors' object if you prefer standard names
        // For example, to use the default Tailwind v3 grays:
        gray: colors.neutral, // or colors.gray, colors.zinc, etc.

        // Keep your custom variables from the original CSS file if needed
        // but ensure their definitions (:root) use HEX/RGB
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... and so on for all your custom variables from app.css
      },
      fontFamily: {
        sans: ['Instrument Sans', ...defaultTheme.fontFamily.sans],
      },
      // ... other extensions ...
    },
  },

  plugins: [require('tailwindcss-animate')],
};
