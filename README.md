# PoserionOS 4.0

An interactive desktop-style portfolio for Atharv Pose. The site is designed as a browser-based workspace rather than a conventional scrolling portfolio.

## Stack

- React and TypeScript
- Vite
- Motion for React
- Lucide icons
- Custom CSS design system

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## GitHub Pages

The site is configured for root-path hosting and includes the existing custom domain in `CNAME`. Configure GitHub Pages to publish the `dist/` directory through GitHub Actions, or use the included workflow after reviewing it.

## Notes

- Theme and wallpaper preferences are stored in the current browser's local storage.
- The terminal is a portfolio command interface. It does not execute operating-system commands.
- Project descriptions and credentials are data-driven in `src/data.ts`.
- The selected wallpaper is stored locally in `public/wallpapers/`.
