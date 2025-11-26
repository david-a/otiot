# Otiot – Hebrew Reading Game (SvelteKit + Sveltia CMS)

Otiot is a lightweight, Jamstack-friendly rewrite of the original Deno/React game, built with:

- **Svelte** for the UI
- **SvelteKit** with a static adapter for SSG
- **Sveltia CMS** (Decap-compatible, Git-based) for content management
- **GitHub** as the content backend

Content (words, images, sounds) lives in the repo and is edited through Sveltia CMS. Game progress is saved in **localStorage** per player.

---

## Project structure

- `src/routes/+page.svelte` – entry page, player name & game shell
- `src/lib/components/Game.svelte` – main game logic and UI
- `src/lib/game/logic.ts` – pure Hebrew/nikud parsing & scoring logic
- `src/lib/data/words.ts` – loads words from `content/words/*.json`
- `src/lib/storage/progress.ts` – localStorage-backed progress per player
- `static/admin/*` – Sveltia CMS admin app and config
- `content/words/*.json` – words managed by the CMS

---

## Prerequisites

- **Node.js** (use `fnm` to match your preferred version)
- **pnpm** as the package manager

From the workspace root:

```bash
cd /Users/deddy/various/ddy/games/otiot
pnpm install
```

---

## Local development

1. **Install dependencies** (once):

   ```bash
   cd /Users/deddy/various/ddy/games/otiot
   pnpm install
   ```

2. **Run the dev server**:

   ```bash
   pnpm dev
   ```

   By default SvelteKit serves on `http://localhost:5173` (or the next free port).

3. **Play the game**:

   - Open `http://localhost:5173/`
   - Enter a player name and start
   - Progress is saved in `localStorage` per player (derived from the name)

4. **Access the CMS locally**:

   - Open `http://localhost:5173/admin/`
   - Sveltia CMS will load `static/admin/config.yml` and connect to GitHub once configured

---

## Managing content with Sveltia CMS

Sveltia CMS is integrated following the pattern from the official repository [`sveltia/sveltia-cms`](https://github.com/sveltia/sveltia-cms).

### 1. Configure GitHub backend

In `static/admin/config.yml`:

- Set **your** repository:

  ```yaml
  backend:
    name: github
    repo: your-username/otiot
    branch: main
  ```

- The main collection is:

  ```yaml
  collections:
    - name: words
      folder: content/words
      format: json
      extension: json
      # ...
  ```

Each word is stored as a JSON file under `content/words/` and is loaded at build time via `import.meta.glob` in `src/lib/data/words.ts`.

### 2. GitHub OAuth + auth proxy (production)

For authenticated editing in production you need GitHub OAuth plus an auth proxy, as recommended in the Sveltia docs and example setups.

#### Step 1: Create a GitHub OAuth App

1. **Go to GitHub Settings**:

   - Navigate to: https://github.com/settings/developers
   - Or: Your Profile → Settings → Developer settings → OAuth Apps

2. **Create a new OAuth App**:

   - Click **"New OAuth App"** (or **"Register a new application"**)
   - Fill in the form:
     - **Application name**: `Otiot CMS` (or any descriptive name)
     - **Homepage URL**: Your deployed site URL
       - Example: `https://your-username.github.io/otiot/`
       - Or: `https://otiot.example.com` (if using a custom domain)
     - **Authorization callback URL**: **Leave this blank for now** — you'll set it after deploying the auth worker
       - It will be something like: `https://your-auth-worker.your-subdomain.workers.dev/auth`
     - **Application description** (optional): `Content management for Otiot Hebrew reading game`

3. **Register the application**:

   - Click **"Register application"**
   - You'll be redirected to the app's settings page

4. **Generate a Client Secret**:
   - On the app settings page, click **"Generate a new client secret"**
   - **Important**: Copy both the **Client ID** and **Client Secret** immediately
     - The Client Secret will only be shown once
     - Store them securely (you'll need them for the auth worker)

#### Step 2: Deploy the Sveltia Auth Worker (Cloudflare Worker)

The auth worker acts as a proxy between Sveltia CMS and GitHub's API, handling OAuth authentication securely.

1. **Clone or download the auth worker**:

   ```bash
   git clone https://github.com/sveltia/sveltia-cms-auth.git
   cd sveltia-cms-auth
   ```

2. **Install Cloudflare Wrangler CLI** (if not already installed):

   ```bash
   npm install -g wrangler
   # Or with pnpm:
   pnpm add -g wrangler
   ```

3. **Authenticate with Cloudflare**:

   ```bash
   wrangler login
   ```

   - This will open a browser window to authorize Wrangler with your Cloudflare account

4. **Configure the worker**:

   - Edit `wrangler.toml` in the `sveltia-cms-auth` directory
   - Set your worker name (must be unique across Cloudflare):
     ```toml
     name = "otiot-cms-auth"  # Change to something unique
     ```
   - Or create a new `wrangler.toml` with:
     ```toml
     name = "otiot-cms-auth"
     main = "src/index.ts"
     compatibility_date = "2024-01-01"
     ```

5. **Set environment variables** (secrets):

   ```bash
   wrangler secret put GITHUB_CLIENT_ID
   # When prompted, paste your GitHub OAuth Client ID

   wrangler secret put GITHUB_CLIENT_SECRET
   # When prompted, paste your GitHub OAuth Client Secret

   wrangler secret put GITHUB_REPO
   # When prompted, enter: your-username/otiot (or your actual repo)

   wrangler secret put GITHUB_BRANCH
   # When prompted, enter: main (or your default branch)
   ```

6. **Deploy the worker**:
   ```bash
   wrangler deploy
   ```
   - After deployment, you'll get a URL like: `https://otiot-cms-auth.your-subdomain.workers.dev`
   - **Copy this URL** — you'll need it for the next steps

#### Step 3: Update GitHub OAuth App Callback URL

1. **Go back to your GitHub OAuth App settings**:

   - https://github.com/settings/developers → Your OAuth App

2. **Update the Authorization callback URL**:
   - Set it to: `https://your-worker-url.workers.dev/auth`
   - Example: `https://otiot-cms-auth.your-subdomain.workers.dev/auth`
   - Click **"Update application"**

#### Step 4: Configure Sveltia CMS to Use the Auth Worker

1. **Update `static/admin/config.yml`**:

   ```yaml
   backend:
     name: github
     repo: your-username/otiot # Replace with your actual repo
     branch: main
     base_url: https://your-worker-url.workers.dev # Your Cloudflare Worker URL
     auth_endpoint: auth # Relative path to auth endpoint
   ```

   Example:

   ```yaml
   backend:
     name: github
     repo: deddy/otiot
     branch: main
     base_url: https://otiot-cms-auth.your-subdomain.workers.dev
     auth_endpoint: auth
   ```

2. **Ensure your GitHub token has write access**:
   - The auth worker will request GitHub OAuth permissions
   - Users logging into `/admin` must have write access to the repository
   - For a personal repo, you'll automatically have access
   - For an organization repo, ensure the user is a collaborator with write permissions

#### Step 5: Test the Setup

1. **Deploy your site** (if not already deployed):

   - Build and deploy your SvelteKit app to your hosting platform
   - Ensure `/admin` is accessible

2. **Access the admin panel**:

   - Navigate to `https://your-deployed-site/admin/`
   - You should see a **"Login with GitHub"** button

3. **Authenticate**:

   - Click **"Login with GitHub"**
   - You'll be redirected to GitHub to authorize the OAuth app
   - After authorization, you'll be redirected back to `/admin`
   - You should now be able to edit words, upload images, etc.

4. **Verify commits**:
   - Make a test edit (e.g., add a new word or update an existing one)
   - Click **"Save"** or **"Publish"**
   - Check your GitHub repository — you should see a new commit with your changes

#### Troubleshooting

- **"Failed to authenticate"**:

  - Verify the callback URL in GitHub OAuth App matches your worker URL + `/auth`
  - Check that all secrets are set correctly in Cloudflare Workers
  - Ensure the worker URL in `config.yml` matches your deployed worker

- **"Repository not found"**:

  - Verify `GITHUB_REPO` secret matches `your-username/repo-name` format
  - Ensure the authenticated user has access to the repository

- **"Permission denied"**:

  - The authenticated GitHub user must have write access to the repository
  - For organization repos, check repository access settings

- **Worker deployment fails**:
  - Ensure you're logged in: `wrangler login`
  - Check that `wrangler.toml` is properly configured
  - Verify all required secrets are set

#### Alternative: Using Netlify Identity (if deploying to Netlify)

If you're deploying to Netlify, you can use Netlify Identity instead of the Cloudflare Worker:

- Enable Netlify Identity in your Netlify site settings
- Configure the GitHub provider in Netlify Identity
- Update `config.yml` to use `netlify` backend instead of `github`

Once configured, `/admin` will authenticate against GitHub and commit changes (new words, image uploads, etc.) directly to your repo.

---

## Game data model

Words are defined as JSON files like:

```json
{
  "word": "כלב",
  "nikud": "כֶּלֶב",
  "image": "/images/dog.webp",
  "sound": null,
  "level": 1
}
```

- `word` – plain Hebrew word (no nikud)
- `nikud` – fully pointed word (used for the game and TTS)
- `image` – public URL to an image (usually under `static/images`)
- `sound` – optional URL to a recorded pronunciation
- `level` – difficulty level (1–4)

> Note: you should copy the existing `dog.webp` (or any other assets) into `otiot/static/images/` and keep paths consistent with the JSON.

---

## Deployment (Jamstack)

The app is configured with the **static adapter**, so builds into a static bundle you can host on any static/Jamstack platform (Netlify, Vercel static, Cloudflare Pages, GitHub Pages, etc.).

1. **Build**:

   ```bash
   cd /Users/deddy/various/ddy/games/otiot
   pnpm build
   ```

   This outputs a static site to `build/`.

2. **Push to GitHub**:

   ```bash
   git init              # only if this is a new repo
   git remote add origin git@github.com:your-username/otiot.git
   git add .
   git commit -m "Initial SvelteKit + Sveltia CMS version"
   git push -u origin main
   ```

3. **Connect to a Jamstack host**:

   - **Netlify**:
     - New site from Git
     - Build command: `pnpm build`
     - Publish directory: `build`
   - **GitHub Pages** (via GitHub Action):
     - Use `actions/setup-node` and `pnpm` to run `pnpm build`
     - Publish the `build` directory

4. **Use `/admin` in production**:

   - Visit `https://your-deployed-site/admin/`
   - Log in with GitHub via the configured auth worker
   - Edit words, upload images, etc.

---

## Notes & extension points

- Leaderboard and cross-device sync are intentionally **client-only** in this version to keep the app purely Jamstack; they can be added later via serverless functions or a hosted DB.
- All core game logic (`src/lib/game/logic.ts`) is framework-agnostic and unit-testable.
- If you prefer another adapter (Netlify/Vercel), swap it in `svelte.config.js` – everything else stays the same.
