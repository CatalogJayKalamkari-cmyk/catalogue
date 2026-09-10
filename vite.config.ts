import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works from a GitHub Pages project URL
  // (https://<user>.github.io/<repo>/) regardless of the repo name.
  base: './',
  plugins: [react()],
})
