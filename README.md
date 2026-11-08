# PoserionOS portfolio

An interactive portfolio workspace for Atharv Pose. The interface is built with React, TypeScript and Vite, and is intended for static hosting on GitHub Pages.

## Run locally

Use Node.js 22.12 or later.

```bash
npm install
npm run dev
```

## Validate

```bash
npm run typecheck
npm test
npm run build
```

## Design system

`DESIGN.md` defines the visual tokens and interaction rules. The interface deliberately uses mostly opaque, tinted surfaces instead of large-area blur effects. This keeps the wallpaper legible and reduces expensive repainting.

## Local preferences

Theme, accent, wallpaper, widget visibility, shortcut visibility and reduced-motion preferences are stored in the visitor's browser using `localStorage`. The Settings application includes **Reset to defaults**. No visitor preference is sent to a server.

## GitHub Pages

This repository is configured to deploy from the `portfolio-site` branch through `.github/workflows/deploy.yml`. The workflow listens for pushes to that branch, builds `dist`, and deploys the artifact to the `github-pages` environment.

For the custom domain, keep `atharvpose.dpdns.org` in `public/CNAME` and configure that domain in **Repository Settings → Pages**. If the `github-pages` environment restricts deployment branches, allow `portfolio-site`.

`vite.config.ts` uses `/` as the base path because this is the repository's user-site and custom-domain root.
