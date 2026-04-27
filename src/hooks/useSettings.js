import { useState } from 'react'

const STORAGE_KEY = 'serena_gallery_settings'

const DEFAULTS = {
  gridDensity: 'standard', // 'small' | 'standard' | 'large'
  lightbox: true,
  colorDot: true,
  showEmptySlots: true,
  showDimSlots: true,
  cardLabel: 'tournament', // 'notes' | 'tournament'
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  function updateSetting(key, value) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { settings, updateSetting }
}
