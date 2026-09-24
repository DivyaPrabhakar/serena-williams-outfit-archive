import { createContext, useContext } from 'react'

// Registry that each rendered StickyGroupHeader registers itself into. The
// GroupNav rail reads the ordered section list from here so the left jump-nav
// always reflects exactly what was rendered, for every grouping mode.
// Split out of GroupNavContext.jsx (which keeps only the Provider component)
// so Fast Refresh can hot-swap that component without a full reload.
export const GroupNavContext = createContext({
  register: () => () => {},
  sections: [],
})

export function useGroupNav() {
  return useContext(GroupNavContext)
}
