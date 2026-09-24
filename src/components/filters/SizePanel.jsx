import SidePanel from './SidePanel'
import OptionButton from './OptionButton'
import { SIZE_OPTIONS } from '../../lib/galleryUtils'

export default function SizePanel({ gridDensity, onDensityChange, onClose }) {
  return (
    <SidePanel title="Image size" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {SIZE_OPTIONS.map(({ value, label }) => (
          <OptionButton key={value} active={gridDensity === value} onClick={() => onDensityChange(value)}>
            {label}
          </OptionButton>
        ))}
      </div>
    </SidePanel>
  )
}
