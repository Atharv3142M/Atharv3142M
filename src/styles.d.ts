// Vite handles stylesheet imports at build time. This declaration keeps
// TypeScript's side-effect import checking aware of bundled CSS assets.
declare module '*.css' {}
