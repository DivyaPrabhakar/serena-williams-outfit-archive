import { useState, useMemo, useEffect } from 'react'
import { GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE } from '../lib/constants'
import { getValidRounds, getRoundsForSlot } from '../lib/rounds'
import { isBlockedUrl } from '../lib/imageUtils'

export const MIXED_SLAMS = ['Australian Open', 'Roland Garros', 'Wimbledon', 'US Open']

export function useOutfitForm(initialValues) {
  const [f, setF]           = useState(initialValues)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setF(prev => ({ ...prev, [key]: val }))

  const yearNum             = parseInt(f.year) || 0
  const effectiveTournament = f.tournament === 'Other' ? f.otherTournament.trim() : f.tournament

  const availableDisciplines = useMemo(() => {
    if (!f.tournament) return []
    if (f.tournament === 'Olympics') return ['Singles', 'Doubles']
    if (MIXED_SLAMS.includes(f.tournament)) return ['Singles', 'Doubles', 'Mixed']
    return ['Singles', 'Doubles']
  }, [f.tournament])

  const validRounds = useMemo(() => {
    if (!effectiveTournament || !yearNum) return []
    if (f.discipline) {
      const rounds = getValidRounds(effectiveTournament, yearNum, f.discipline)
      return rounds.length > 0 ? rounds : ROUND_SEQUENCE
    }
    const max = Math.max(
      getRoundsForSlot(effectiveTournament, yearNum, 'Singles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Doubles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Mixed'),
      0,
    )
    return max > 0 ? ROUND_SEQUENCE.slice(0, max) : ROUND_SEQUENCE
  }, [f.discipline, effectiveTournament, yearNum])

  useEffect(() => {
    if (f.discipline === 'Mixed' && f.tournament === 'Olympics') set('discipline', '')
  }, [f.tournament])

  useEffect(() => {
    if (f.round && validRounds.length > 0 && !validRounds.includes(f.round)) set('round', '')
  }, [validRounds])

  const handleGettyEmbed = (val) => {
    setF(prev => ({ ...prev, gettyEmbed: val, imageUrl: val.trim() ? '' : prev.imageUrl }))
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  const handleImageUrl = (url) => {
    setF(prev => ({ ...prev, imageUrl: url, gettyEmbed: url.trim() ? '' : prev.gettyEmbed }))
    setErrors(prev => ({ ...prev, image: undefined, imageUrl: undefined }))
  }

  const toggleColor = (color) =>
    set('colors', f.colors.includes(color)
      ? f.colors.filter(c => c !== color)
      : [...f.colors, color])

  const validate = () => {
    const e = {}
    const hasGetty = !!f.gettyEmbed.trim()
    const hasUrl   = !!f.imageUrl.trim()
    if (!hasGetty && !hasUrl)
      e.image    = 'Image is required — paste a Getty embed code or an image URL'
    else if (hasUrl && isBlockedUrl(f.imageUrl.trim()))
      e.imageUrl = 'Facebook and Instagram links are not supported (images time out)'
    if (!f.year || !yearNum)    e.year       = 'Year is required'
    if (!f.tournament)          e.tournament = 'Tournament is required'
    if (f.tournament === 'Other' && !f.otherTournament.trim())
                                e.tournament = 'Tournament name is required'
    if (!f.discipline)          e.discipline = 'Discipline is required'
    return e
  }

  const resetForm = () => {
    setF(initialValues)
    setErrors({})
  }

  return {
    f, set, errors, setErrors,
    yearNum, effectiveTournament,
    availableDisciplines, validRounds,
    handleGettyEmbed, handleImageUrl,
    toggleColor, validate, resetForm,
  }
}
