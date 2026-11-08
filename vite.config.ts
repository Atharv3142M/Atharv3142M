import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Root path is correct for the repository's user-site URL and custom domain.
  base: '/'
});
