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

For authenticated editing in production you need GitHub OAuth plus an auth proxy, as recommended in the Sveltia docs and example setups:

1. **Create a GitHub OAuth App**:
   - **Homepage URL**: your deployed site URL (e.g. `https://otiot.example.com`)
   - **Authorization callback URL**: the URL of your auth proxy (see next step)

2. **Deploy the Sveltia auth worker**:
   - Use the [`sveltia-cms-auth` Cloudflare Worker](https://github.com/sveltia/sveltia-cms-auth)
   - Configure it with your GitHub Client ID/Secret and repo settings
   - Point the OAuth callback to the worker

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


