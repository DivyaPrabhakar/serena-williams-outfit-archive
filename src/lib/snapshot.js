// Build-time outfit snapshot, mapped to the app model.
//
// src/generated/outfits.json is produced by scripts/fetch-outfits.mjs (the npm
// pre-build / pre-dev step). Pages import from here so static generation and the
// first client paint render real content; the client then refetches live data.
// createdAt is preserved so slug/collision ordering is deterministic and stable.

import rawRows from '../generated/outfits.json'
import { rowToOutfit } from './api'

export const snapshotOutfits = (rawRows ?? []).map((r) => ({
  ...rowToOutfit(r),
  createdAt: r.created_at ?? null,
}))
