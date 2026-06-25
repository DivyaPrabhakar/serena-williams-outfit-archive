import { createContext, useState } from 'react'

export const HeaderSlotContext = createContext({ slotEl: null, setSlotEl: () => {} })

export function HeaderSlotProvider({ children }) {
  const [slotEl, setSlotEl] = useState(null)
  return (
    <HeaderSlotContext.Provider value={{ slotEl, setSlotEl }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}
