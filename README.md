# VR.q-c.hk Static Site

This repository is prepared as an independent static website for `VR.q-c.hk` (`vr.q-c.hk`). It has no runtime dependency on any other website.

## Current State

- The public website root is `public/`.
- `public/index.html` renders the mobile Secret Language Trade language selector for this site.
- GitHub Pages deployment is prepared in `.github/workflows/deploy.yml`.
- Search engines are allowed in `public/robots.txt`.

## Deployment

The custom domain is set in `public/CNAME`.
Pushes to `main` deploy through GitHub Actions.

This site must be deployed from its own repository or hosting project. Do not reuse another site's repository, Pages settings, Actions workflow, or DNS records.

For GitHub Pages:

1. Create a new repository for this VR site.
2. Push this project to that repository's `main` branch.
3. In the new repository, set Pages source to GitHub Actions.
4. Add `vr.q-c.hk` as the custom domain for that new repository.
5. In DNS, point the `vr` subdomain to the GitHub Pages default domain for the new repository owner.
