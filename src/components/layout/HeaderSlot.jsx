import { useState } from 'react'
import { HeaderSlotContext } from './headerSlotContext'

export function HeaderSlotProvider({ children }) {
  const [slotEl, setSlotEl] = useState(null)
  return (
    <HeaderSlotContext.Provider value={{ slotEl, setSlotEl }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}
