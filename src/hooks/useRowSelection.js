import { useState } from 'react'

// Shared row-selection state for the admin list panels. Kept per-panel so that
// switching tabs (which unmounts the panel) clears any pending selection.
//
// Pass the currently-visible (post-search-filter) ids and the bulk-delete
// callback so the hook can derive the "select all" state and the confirm-then-
// delete flow, leaving each panel with no selection boilerplate of its own.
export function useRowSelection(visibleIds = [], onDeleteMany) {
  const [selected, setSelected] = useState(() => new Set())

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setAll = (ids, on) =>
    setSelected(prev => {
      const next = new Set(prev)
      ids.forEach(id => (on ? next.add(id) : next.delete(id)))
      return next
    })

  const clear = () => setSelected(new Set())

  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id))
  const toggleAll   = (on) => setAll(visibleIds, on)

  const removeSelected = async () => {
    await onDeleteMany([...selected])
    clear()
  }

  return { selected, toggle, setAll, clear, allSelected, toggleAll, removeSelected }
}
