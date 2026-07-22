// Bulk-action bar shown above the admin result lists when one or more rows are
// selected. Confirms once for the whole batch, then delegates to onDelete.
export default function SelectionBar({ count, onDelete, onClear }) {
  if (!count) return null

  const handleDelete = () => {
    if (!window.confirm(`Delete ${count} outfit${count !== 1 ? 's' : ''}?`)) return
    onDelete()
  }

  return (
    <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2a2a2a] px-3 py-2">
      <span className="text-xs text-[#8A877F] uppercase tracking-wide">
        {count} selected
      </span>
      <div className="flex-1" />
      <button
        onClick={onClear}
        className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors cursor-pointer"
      >
        Clear
      </button>
      <button
        onClick={handleDelete}
        className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
      >
        Delete selected
      </button>
    </div>
  )
}
