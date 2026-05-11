import { useState } from 'react'
import { readStorageJson, writeStorageJson } from '../lib/storage'

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
  const [settings, setSettings] = useState(() =>
    ({ ...DEFAULTS, ...readStorageJson(STORAGE_KEY, {}) })
  )

  function updateSetting(key, value) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      writeStorageJson(STORAGE_KEY, next)
      return next
    })
  }

  return { settings, updateSetting }
}
