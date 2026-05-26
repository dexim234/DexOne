# OneDex — Solana DEX Terminal

Advanced DEX trading terminal for Solana blockchain.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **next-themes** (dark/light mode)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Market HUB (home) |
| `/market-hub` | Market HUB |
| `/calls` | Calls |
| `/alerts` | Alerts |
| `/tracker` | Tracker |
| `/smart` | Smart |
| `/about` | About |

All pages currently show "Under Development" placeholder.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Static export goes to `./dist/`.

## Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project
3. Import your GitHub repo
4. Framework preset: **Next.js**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

## Deploy on GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages → Source: GitHub Actions
3. Use the workflow below (`.github/workflows/pages.yml`)

### GitHub Actions workflow

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: my-app/package-lock.json
      - run: cd my-app && npm ci
      - run: cd my-app && npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: my-app/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```
