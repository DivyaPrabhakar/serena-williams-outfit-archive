// The count line ("N / M …") plus the optional "Select all" toggle shown above
// each admin result list. `selectable` hides the toggle when there's nothing to
// select; `onToggleAll` receives the desired checked state.
export default function ListHeader({ shown, total, suffix = 'entries', selectable, allSelected, onToggleAll }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-[#8A877F] uppercase tracking-wide">
        {shown} / {total} {suffix}
      </p>
      {selectable && (
        <label className="flex items-center gap-1.5 text-xs text-[#8A877F] cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={e => onToggleAll(e.target.checked)}
            className="w-4 h-4 accent-[#C9A84C] cursor-pointer"
          />
          Select all
        </label>
      )}
    </div>
  )
}
