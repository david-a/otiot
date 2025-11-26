# GitHub Pages Setup Instructions

This guide will help you deploy the Otiot game to GitHub Pages.

## Prerequisites

- A GitHub repository (already created or you'll create one)
- GitHub Pages enabled in your repository settings

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
cd /Users/deddy/various/ddy/games/otiot
git init  # if not already initialized
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

## Step 3: Configure Base Path (if needed)

The GitHub Actions workflow automatically detects whether you need a base path:

- **If your repo is `username.github.io`** (root domain): No base path needed ✅
- **If your repo is `username/otiot`** (subdirectory): Base path will be `/otiot` automatically ✅

The workflow sets the `BASE_PATH` environment variable automatically based on your repository name.

### Manual Override (Optional)

If you need to manually set the base path, edit `.github/workflows/deploy.yml` and modify the `BASE_PATH` environment variable:

```yaml
BASE_PATH: '/your-repo-name'  # For subdirectory
# or
BASE_PATH: ''  # For root domain
```

## Step 4: Trigger the Deployment

The GitHub Actions workflow will automatically run when you:

1. **Push to `main` branch** - Automatic deployment
2. **Manually trigger** - Go to Actions tab → "Deploy to GitHub Pages" → "Run workflow"

## Step 5: Access Your Site

Once the workflow completes successfully:

- **For subdirectory repos**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
- **For root domain repos**: `https://YOUR_USERNAME.github.io/`

You can find the exact URL in:
- Repository Settings → Pages → "Your site is live at..."
- The Actions workflow run output

## Troubleshooting

### Build Fails

1. Check the Actions tab for error messages
2. Ensure `pnpm-lock.yaml` is committed
3. Verify Node.js version compatibility (workflow uses Node 20)

### Assets Not Loading

- Verify the base path is set correctly in `svelte.config.js`
- Check that asset paths in your code use relative paths or the `$app/paths` helper

### 404 Errors

- Ensure `fallback: undefined` is set in `svelte.config.js` (already configured)
- For SPA-like behavior, you may need to set a fallback, but GitHub Pages works best with static files

### CMS Admin Not Working

The `/admin` route requires additional setup:
1. Configure GitHub OAuth App (see README.md)
2. Deploy the Sveltia auth worker
3. Update `static/admin/config.yml` with your repository details

## Updating Your Site

Every time you push changes to the `main` branch, GitHub Actions will:
1. Build your SvelteKit app
2. Deploy it to GitHub Pages
3. Make it live within a few minutes

You can monitor the deployment progress in the **Actions** tab of your repository.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `static/` with your domain name
2. Configure DNS settings with your domain provider
3. Enable "Enforce HTTPS" in GitHub Pages settings

The workflow will automatically include the CNAME file in the build.

