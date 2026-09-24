import SidePanel from './SidePanel'
import OptionButton from './OptionButton'
import { LAYOUT_OPTIONS } from '../../lib/galleryUtils'

export default function LayoutPanel({ layout, onLayoutChange, onClose }) {
  return (
    <SidePanel title="Layout" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {LAYOUT_OPTIONS.map(({ value, label }) => (
          <OptionButton key={value} active={layout === value} onClick={() => onLayoutChange(value)}>
            {label}
          </OptionButton>
        ))}
      </div>
    </SidePanel>
  )
}
