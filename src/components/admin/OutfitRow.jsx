import { isGettyEmbed } from '../../lib/imageUtils'

export default function OutfitRow({ o, onEdit, onDelete, children }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#111]">
      {isGettyEmbed(o.imageUrl) ? (
        <iframe
          srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#111}body{display:flex;align-items:center;justify-content:center}</style></head><body>${o.imageUrl}</body></html>`}
          className="w-10 h-14 flex-shrink-0 border-0 pointer-events-none"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      ) : (
        <img
          src={o.imageUrl}
          alt=""
          className="w-10 h-14 object-cover flex-shrink-0 bg-[#222]"
          onError={e => { e.target.style.opacity = '0.2' }}
        />
      )}
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
