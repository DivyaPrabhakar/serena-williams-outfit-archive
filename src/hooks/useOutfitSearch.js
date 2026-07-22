import { useState } from 'react'
import { filterByQuery } from '../lib/adminUtils'

// Local search state + filtered view for the admin list panels: owns the
// query string and returns the subset of `list` matching it. Panels whose
// search is controlled externally (e.g. via a URL param) keep their own wiring.
export function useOutfitSearch(list) {
  const [search, setSearch] = useState('')
  const visible = filterByQuery(list, search)
  return { search, setSearch, visible }
}
