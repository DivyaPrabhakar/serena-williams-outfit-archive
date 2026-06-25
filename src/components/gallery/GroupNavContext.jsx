import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Registry that each rendered StickyGroupHeader registers itself into. The
// GroupNav rail reads the ordered section list from here so the left jump-nav
// always reflects exactly what was rendered, for every grouping mode.
const GroupNavContext = createContext({
  register: () => () => {},
  sections: [],
})

export function GroupNavProvider({ children }) {
  const [entries, setEntries] = useState([])

  const register = useCallback(({ id, label, el }) => {
    setEntries(prev => [...prev.filter(s => s.id !== id), { id, label, el }])
    return () => setEntries(prev => prev.filter(s => s.id !== id))
  }, [])

  // Ordered by DOM document position so the list matches the visual order
  // regardless of React mount/unmount ordering.
  const sections = useMemo(() => {
    return [...entries]
      .filter(s => s.el && s.el.isConnected)
      .sort((a, b) => {
        const pos = a.el.compareDocumentPosition(b.el)
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1
        return 0
      })
  }, [entries])

  const value = useMemo(() => ({ register, sections }), [register, sections])

  return <GroupNavContext.Provider value={value}>{children}</GroupNavContext.Provider>
}

export function useGroupNav() {
  return useContext(GroupNavContext)
}

export default GroupNavContext
