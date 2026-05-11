import { useSearchParams } from 'react-router-dom'

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTournament = searchParams.get('tournament')
  const activeYear       = searchParams.get('year') ? Number(searchParams.get('year')) : null
  const activeBrand      = searchParams.get('brand')
  const activeColor      = searchParams.get('color')

  function setFilter(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value != null) next.set(key, String(value))
      else next.delete(key)
      return next
    }, { replace: true })
  }

  function clearAllFilters() {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('tournament')
      next.delete('year')
      next.delete('brand')
      next.delete('color')
      return next
    }, { replace: true })
  }

  return { activeTournament, activeYear, activeBrand, activeColor, setFilter, clearAllFilters }
}
