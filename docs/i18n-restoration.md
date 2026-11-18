# Restoring localized News automation

Localized News production builds are retired, but translation files, local Ghost fixtures, tests, and frozen production images are retained to keep restoration practical.

## Preserved in this repository

- Locale configuration and translations under `config/i18n/locales/`.
- Chinese and Spanish Cypress coverage under `cypress/e2e/`.
- Seeded local Ghost instances under `docker/ghost/`.
- Manual Crowdin upload and download workflows.
- Weekly localized tests in `.github/workflows/i18n-weekly.yml`.
- The removed deployment workflow remains available through Git history:

  ```console
  git log --all -- .github/workflows/deploy-i18n.yml
  git restore --source=<commit> .github/workflows/deploy-i18n.yml
  ```

## External archives to retain

- Ghost backups in `ghost-backup.freecodecamp.org/Linode-Backups/<code>/2026-10-06/`.
- Localized media in the R2 `cdn-media-i18n` bucket.
- The last working localized images in DigitalOcean Container Registry.
- Crowdin News project data and localized Algolia index exports.

Do not remove these archives until the organization no longer needs a restoration path.

## Production restoration

1. Restore `.github/workflows/deploy-i18n.yml` from Git history.
2. Follow `freeCodeCamp/infra/docs/runbooks/archive/2026-10-15/17-i18n-ghost-decommission.md` to restore Ghost, its database, DNS, firewall, NGINX upstreams, and Tailscale devices.
3. Restore localized services in `freeCodeCamp/infra/docker/swarm/stacks/news/stack-news.yml` if they were removed.
4. Restore localized News routes and caches in `freeCodeCamp/nginx-config` if they were replaced with redirects or archives.
5. Recreate the localized DOCR repositories and Algolia indexes if they were retired.
6. Restore the external six-hour workflow dispatcher and enable the deployment workflow.
7. Run a manual build and verify each localized URL before re-enabling scheduled deployment.

### Deployment secret names

Recreate these repository secrets from the appropriate secret manager; never store their values in Git:

- `<LOCALE>_GHOST_API_URL`
- `<LOCALE>_GHOST_API_VERSION`
- `<LOCALE>_GHOST_CONTENT_API_KEY`

`<LOCALE>` is each of `CHINESE`, `ESPANOL`, `ITALIAN`, `JAPANESE`, `KOREAN`, `PORTUGUESE`, and `UKRAINIAN`.

The deployment also uses shared English infrastructure credentials for Algolia, DigitalOcean/DOCR, Tailscale, Gantry, advertising, pagination, and Google Chat. Confirm their current names in `.github/workflows/deploy-eng.yml`; do not create separate copies unless required.

## Translation automation restoration

1. Confirm the Crowdin News project and its source configuration still exist.
2. Confirm access to `CROWDIN_PROJECT_ID_NEWS`, `CROWDIN_CAMPERBOT_SERVICE_TOKEN`, `CROWDIN_BASE_URL_FCC`, and `CROWDIN_CAMPERBOT_PAT`.
3. Add an approved schedule back to `.github/workflows/crowdin-upload.yml` and `.github/workflows/crowdin-download.yml`.
4. Recreate the `i18n-sync` branch if the download workflow requires it.
5. Run each workflow manually and review its output before restoring schedules.

## Per-commit CI restoration

1. Add `chinese` and `espanol` back to the matrix in `.github/workflows/cypress.yml`.
2. Add `espanol` back to the test matrix in `.github/workflows/node.js-test.yml`.
3. Restore the localized CI Ghost environment variables and container startup steps from Git history or `.github/workflows/i18n-weekly.yml`.
4. Update the GitHub ruleset only after all restored checks pass reliably.

CI uses the `CI_CHINESE_GHOST_*` and `CI_ESPANOL_GHOST_*` secret triplets for seeded local fixtures. These are separate from retired production Ghost credentials.
