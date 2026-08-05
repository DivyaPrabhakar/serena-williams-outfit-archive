---
name: stop-serena-project
description: Stop the Serena Williams Fit-dex gallery's local Netlify Dev server (started via start-serena-project). Use when the user wants to stop, kill, or shut down the serena-gallery local server.
---

This project is normally started with `npx netlify dev` (see [[start-serena-project]]), which spawns a process tree: the `netlify dev` parent, an underlying Vite dev server, and an esbuild service for the local functions runtime. Stopping just one of these can leave orphans holding the port, so kill the whole tree.

## Steps

1. **Find the tree**:
   ```
   ps aux | grep -i -E "netlify dev|serena-gallery/node_modules/.bin/vite|netlify-cli.*esbuild" | grep -v grep
   ```
2. **Kill every matching PID** (the `netlify dev` process, the `vite` child, the `esbuild` service, and the wrapping shell if one shows up from `npx netlify dev`):
   ```
   kill <pid> <pid> ...
   ```
3. **Confirm it's down**:
   ```
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/.netlify/functions/outfits
   ```
   A connection error (not a `200`) confirms the server is stopped. Also re-run the `ps` search from step 1 — it should return nothing.

## What NOT to do

- Don't `kill -9` on the first try — a plain `kill` (SIGTERM) lets Netlify Dev clean up its proxy/function watchers; only escalate to `-9` if processes are still alive a few seconds later.
- Don't just kill the `vite` child and assume the server is stopped — `netlify dev` will still be listening on 8888 and will hold the port.
