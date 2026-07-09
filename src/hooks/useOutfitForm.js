import { useState, useMemo, useEffect } from 'react'
import { GRAND_SLAMS, OLYMPICS_YEARS, ROUND_SEQUENCE } from '../lib/constants'
import { getValidRounds, getRoundsForSlot, getSlotStatus, getRoundNumber } from '../lib/rounds'
import { isBlockedUrl } from '../lib/imageUtils'

// Mixed doubles is contested at all four Grand Slams.
export const MIXED_SLAMS = GRAND_SLAMS

export function useOutfitForm(initialValues) {
  const [f, setF]           = useState(initialValues)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setF(prev => ({ ...prev, [key]: val }))

  const yearNum             = parseInt(f.year) || 0
  const effectiveTournament = f.tournament === 'Other' ? f.otherTournament.trim() : f.tournament

  // A slot is "known" (we can validate participation against metadata) when the
  // tournament is a Grand Slam / Olympics, or when any discipline has recorded
  // rounds for this year. Free-form "Other" / sparse non-slam years stay permissive.
  const slotIsKnown = useMemo(() => {
    if (!effectiveTournament || !yearNum) return false
    if (GRAND_SLAMS.includes(effectiveTournament) || effectiveTournament === 'Olympics') return true
    return ['Singles', 'Doubles', 'Mixed'].some(
      d => getRoundsForSlot(effectiveTournament, yearNum, d) > 0,
    )
  }, [effectiveTournament, yearNum])

  const availableDisciplines = useMemo(() => {
    if (!f.tournament) return []
    const base = f.tournament === 'Olympics'
      ? ['Singles', 'Doubles']
      : MIXED_SLAMS.includes(f.tournament)
      ? ['Singles', 'Doubles', 'Mixed']
      : ['Singles', 'Doubles']

    // Without a year we can't validate participation — show the full base list.
    if (!yearNum || !slotIsKnown) return base
    return base.filter(d => getSlotStatus(effectiveTournament, yearNum, d) === 'played')
  }, [f.tournament, effectiveTournament, yearNum, slotIsKnown])

  const validRounds = useMemo(() => {
    if (!effectiveTournament || !yearNum) return []
    if (f.discipline) {
      const rounds = getValidRounds(effectiveTournament, yearNum, f.discipline)
      if (rounds.length > 0) return rounds
      // No recorded rounds: known slot ⇒ she didn't play ⇒ no rounds (round is
      // optional). Unknown/free-form slot ⇒ fall back to the full sequence.
      return slotIsKnown ? [] : ROUND_SEQUENCE
    }
    const max = Math.max(
      getRoundsForSlot(effectiveTournament, yearNum, 'Singles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Doubles'),
      getRoundsForSlot(effectiveTournament, yearNum, 'Mixed'),
      0,
    )
    if (max > 0) return ROUND_SEQUENCE.slice(0, max)
    return slotIsKnown ? [] : ROUND_SEQUENCE
  }, [f.discipline, effectiveTournament, yearNum, slotIsKnown])

  // Clear a discipline that's no longer valid for the current tournament + year
  // (e.g. Mixed selected, then 2018 Roland Garros entered — even if year is last).
  useEffect(() => {
    if (f.discipline && !availableDisciplines.includes(f.discipline)) set('discipline', '')
  }, [availableDisciplines])

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
    else if (f.discipline && !availableDisciplines.includes(f.discipline))
                                e.discipline = 'Serena did not compete in this discipline that year'
    if (f.round && validRounds.length > 0 && !validRounds.includes(f.round))
                                e.round      = 'That round does not exist for this event'
    return e
  }

  const resetForm = () => {
    setF(initialValues)
    setErrors({})
  }

  // The shared outfit payload both the add and edit forms submit.
  const buildOutfit = () => ({
    imageUrl:    f.gettyEmbed.trim() || f.imageUrl.trim(),
    year:        yearNum,
    tournament:  effectiveTournament,
    discipline:  f.discipline,
    round:       f.round || null,
    roundNumber: getRoundNumber(f.round),
    colors:      f.colors,
    notes:       f.notes,
    focal_point: f.focal_point,
    brand:       f.brand,
  })

  return {
    f, set, errors, setErrors,
    yearNum, effectiveTournament,
    availableDisciplines, validRounds,
    handleGettyEmbed, handleImageUrl,
    toggleColor, validate, resetForm, buildOutfit,
  }
}
