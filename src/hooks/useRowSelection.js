import { useState } from 'react'

// Shared row-selection state for the admin list panels. Kept per-panel so that
// switching tabs (which unmounts the panel) clears any pending selection.
export function useRowSelection() {
  const [selected, setSelected] = useState(() => new Set())

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Add/remove a batch of ids at once — used by the "Select all" checkbox,
  // which passes the currently-visible (post-search-filter) ids.
  const setAll = (ids, on) =>
    setSelected(prev => {
      const next = new Set(prev)
      ids.forEach(id => (on ? next.add(id) : next.delete(id)))
      return next
    })

  const clear = () => setSelected(new Set())

  return { selected, toggle, setAll, clear }
}
