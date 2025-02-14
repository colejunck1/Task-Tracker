import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Add external dependencies if needed
      external: ['@supabase/supabase-js']
    }
  }
})