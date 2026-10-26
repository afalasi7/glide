<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Deploy to VPS (Dokploy)

## Trigger
"push to dokploy", "deploy", "launch", "ship" → run the workflow below automatically.
Do not ask first. Show the result at the end.

## Credentials
Stored at `~/.secrets/dokploy.env` (mode 600, **outside** the repo — the workflow
runs `git add .`, so anything in the working tree gets committed and pushed).
Load with `set -a; . ~/.secrets/dokploy.env; set +a`. Never inline them into
files under version control.

## Repo facts
- Remote: `origin` → `github.com/afalasi7/glide`, repo name `glide`, production branch `main`.
- Dokploy deploys **`main` only**. Work often happens on `polish/*` branches — merge to
  `main` first (fast-forward when `origin/main` has no commits the branch lacks).
- `Dockerfile` (bun:1.3-alpine, standalone output) and `.dockerignore` both exist.
- `.env.local` is dockerignored and only holds `GEMINI_API_KEY`, which is used solely by
  `scripts/gen-images.py` — the app build does not need it.

## Gotchas — read before running
1. **iCloud duplicates.** `git add .` will stage `* 2.*` junk (`automation/README 2.md`,
   `ios/App/App/config 2.xml`, …). Stage explicit paths, or keep them ignored.
2. **Next's security gate kills the first build.** Next 16 defaults
   `experimental.agentUpgrade: 'security'`, so the first `next build` exits 1 with
   `SecurityFatalError` and only succeeds on retry. `next.config.ts` sets
   `agentUpgrade: false` to make container builds deterministic — note this only
   silences the *nudge*; the underlying Next.js vulnerability is still present and
   still needs `next upgrade`.
3. The production server needs `output: "standalone"` — `CMD ["bun", "server.js"]`,
   not `next start` (which warns and misbehaves).

## Steps
1. **Push** — `git add <paths> && git commit && git merge/push` onto `main`.
   Confirm the push landed before deploying.
2. **Dokploy** — `application.all` to find `glide`; `application.create` if missing
   (buildType `dockerfile`, dockerfilePath `./Dockerfile`, sourceType `github`,
   repository `afalasi7/glide`, branch `main`); then `application.deploy`.
3. **Domain** — `domain.all` for the app; if none, `domain.create` with
   host `glide.alfalasi.io`, port 3000, https, certManager `letsencrypt`.
   Only then create the Cloudflare A record (proxied, content = VPS IP).
4. **Report** — `https://glide.alfalasi.io`. Cert takes ~1 min.

## Troubleshooting
- Deploy stuck → `deployment.all?input={"json":{"applicationId":"<id>"}}`
- Not loading after 2 min → check the Dockerfile build logs on the server.
- DNS not resolving → Cloudflare can take up to 5 minutes.
