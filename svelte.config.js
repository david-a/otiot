import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    alias: {
      $lib: 'src/lib'
    },
    // Set base path for GitHub Pages if deploying to a subdirectory
    // For root domain (username.github.io), leave empty or set to ''
    // For subdirectory (username.github.io/repo-name), set to '/repo-name'
    paths: {
      base: process.env.BASE_PATH || ''
    }
  }
};

export default config;


