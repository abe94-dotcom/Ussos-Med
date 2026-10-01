# Website repository rules

## What belongs here

- Keep the Astro site in `src/`, live site assets in `public/`, operational notes in `docs/`, and the package and build configuration at the repository root.
- Keep only assets the current site uses in `public/`. Check references in `src/` before moving an asset; preserve unused originals in the sibling `../project-files/` folder when working in the local workspace.
- Keep marketing exports, video compositions, raw media, retired designs, and unused images in `../project-files/`. That folder is outside this repository and must not be added to Git.
- Keep generated output and local dependencies out of Git: `dist/`, `.astro/`, and `node_modules/`. Never commit `.env` files or credentials.

## Before publishing

- Review `git status` and the staged diff so the commit contains only intended website files.
- Run `npm run build` and confirm every image path used by the site exists in `public/`.
- Keep English and Arabic public routes paired when adding or changing pages.
- Push from this repository only after the intended website changes are committed.
