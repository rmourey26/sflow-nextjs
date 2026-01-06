/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // TailwindCSS v4 CSS-first approach uses @import in CSS, not PostCSS plugin
    // Only autoprefixer is needed for Next.js
  },
}

export default config
