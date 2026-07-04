# VR.q-c.hk Blank Static Site

This is an independent blank static site for `vr.q-c.hk`. It has no runtime dependency on any other website.

## Current State

- The public website root is `public/`.
- `public/index.html` is intentionally blank.
- `public/CNAME` sets the custom domain to `vr.q-c.hk`.
- GitHub Pages deployment runs through `.github/workflows/deploy.yml`.

## Deployment

Pushes to `main` deploy through GitHub Actions. Keep this repository, domain, and deployment separate from every other site.
