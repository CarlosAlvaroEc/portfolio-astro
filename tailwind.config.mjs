/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      // Tokens del sistema "code'm up" — mapeados a variables CSS para que el
      // cambio claro/oscuro (html.obsidian-mode) sea automático.
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        ink: 'var(--text)',
        meta: 'var(--muted)',
        signal: 'var(--signal)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Geist Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', '"Geist Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
