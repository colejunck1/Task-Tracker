// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Set base to a relative path so assets load correctly in production
  base: './',
  plugins: [react()],
  // Remove "external" configuration if it's not necessary.
  // external: ['@supabase/supabase-js'],
});
