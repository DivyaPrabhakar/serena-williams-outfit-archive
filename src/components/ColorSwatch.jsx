import { COLOR_MAP } from '../lib/constants'

// A single color swatch. `color` may be a known color name (looked up in
// COLOR_MAP) or a raw CSS color value; `className` controls size/shape per
// use site. Renders a span so it drops into flex rows without layout changes.
export default function ColorSwatch({ color, className, title, style }) {
  return (
    <span
      className={className}
      title={title}
      style={{ background: COLOR_MAP[color] ?? color, ...style }}
    />
  )
}
