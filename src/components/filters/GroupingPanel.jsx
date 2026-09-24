import SidePanel from './SidePanel'
import OptionButton from './OptionButton'
import { GROUPING_OPTIONS } from '../../lib/filterUtils'

const SORT_OPTIONS = [
  { value: 'chronological', label: 'Chronological' },
  { value: 'filled-first', label: 'Filled first' },
]

export default function GroupingPanel({ activeGrouping, onGroupingChange, sortBy, onSortChange, onClose }) {
  return (
    <SidePanel title="Group by" onClose={onClose} bodyClassName="px-5 py-5 space-y-6">
      <div className="flex flex-col gap-2">
        {GROUPING_OPTIONS.map(({ value, label }) => (
          <OptionButton key={value} active={activeGrouping === value} onClick={() => onGroupingChange(value)}>
            {label}
          </OptionButton>
        ))}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Sort</p>
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map(({ value, label }) => (
            <OptionButton key={value} active={sortBy === value} onClick={() => onSortChange(value)}>
              {label}
            </OptionButton>
          ))}
        </div>
      </div>
    </SidePanel>
  )
}
