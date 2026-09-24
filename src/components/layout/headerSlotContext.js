import { createContext } from 'react'

// Split out of HeaderSlot.jsx (which keeps only the Provider component) so
// Fast Refresh can hot-swap that component without a full reload.
export const HeaderSlotContext = createContext({ slotEl: null, setSlotEl: () => {} })
