import OutfitThumbnail from './OutfitThumbnail'

export default function OutfitRow({ o, onEdit, onDelete, children, selectable, selected, onToggleSelect }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#111]">
      {selectable && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => onToggleSelect(o.id)}
          className="flex-shrink-0 w-4 h-4 accent-[#C9A84C] cursor-pointer"
        />
      )}
      <OutfitThumbnail o={o} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F0EDE6] truncate">
          {o.year} {o.tournament}
          {o.discipline && <span className="text-[#8A877F]"> · {o.discipline}</span>}
          {o.round      && <span className="text-[#8A877F]"> · {o.round}</span>}
        </p>
        {children}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(o)}
          className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => window.confirm('Delete this outfit?') && onDelete(o.id)}
          className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Del
        </button>
      </div>
    </div>
  )
}
