/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "branding-background": "hsl(var(--branding-background))",
        "branding-background-hover": "hsl(var(--branding-background-hover))",
        "branding-foreground": "hsl(var(--branding-foreground))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))",
          "modal-background": "hsl(var(--modal-btn-background))",
          "modal-background-hover": "hsl(var(--modal-btn-background-hover))",
        },

        "logo-blue": "#3a4a69",
      },
      maxWidth: {
        "200": "800px",
      },
    },
  },
  plugins: [],
};
