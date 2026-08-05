import OutfitThumbnail from './OutfitThumbnail'

export default function OutfitRow({ o, onEdit, onDelete, children, selectable, selected, onToggleSelect }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-well">
      {selectable && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => onToggleSelect(o.id)}
          className="flex-shrink-0 w-4 h-4 accent-brand cursor-pointer"
        />
      )}
      <OutfitThumbnail o={o} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">
          {o.year} {o.tournament}
          {o.discipline && <span className="text-muted"> · {o.discipline}</span>}
          {o.round      && <span className="text-muted"> · {o.round}</span>}
        </p>
        {children}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(o)}
          className="text-xs border-2 border-white text-muted px-2.5 py-1 hover:border-brand hover:text-brand transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => window.confirm('Delete this outfit?') && onDelete(o.id)}
          className="text-xs border-2 border-white text-muted px-2.5 py-1 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Del
        </button>
      </div>
    </div>
  )
}
