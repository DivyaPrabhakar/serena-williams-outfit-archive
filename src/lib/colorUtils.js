import { COLOR_MAP } from './constants'

export function getSortedColors(colors) {
  const colorOrder = Object.keys(COLOR_MAP)
  return [...new Set(colors)]
    .filter(c => c in COLOR_MAP)
    .sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b))
}
