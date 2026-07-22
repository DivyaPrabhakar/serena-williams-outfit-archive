import { useState, useEffect, useCallback } from 'react'
import { fetchOutfits, insertOutfit, updateOutfit, deleteOutfit } from '../lib/api'

export function useOutfits(adminToken) {
  const [outfits, setOutfits]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOutfits()
      setOutfits(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const insert = async (outfit) => {
    await insertOutfit(outfit, adminToken)
    await reload()
  }

  const update = async (outfit) => {
    await updateOutfit(outfit, adminToken)
    await reload()
  }

  const remove = async (id) => {
    await deleteOutfit(id, adminToken)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  const removeMany = async (ids) => {
    await Promise.all(ids.map(id => deleteOutfit(id, adminToken)))
    const gone = new Set(ids)
    setOutfits(prev => prev.filter(o => !gone.has(o.id)))
  }

  return { outfits, loading, error, insert, update, remove, removeMany, reload }
}
