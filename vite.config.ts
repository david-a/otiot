import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [resolve(__dirname, 'content')]
    }
  }
};

export default config;


