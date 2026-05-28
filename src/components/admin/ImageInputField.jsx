import { FieldLabel, InlineError } from './adminFormPrimitives'
import { isBlockedUrl, isGettyEmbed } from '../../lib/imageUtils'

export default function ImageInputField({ gettyEmbed, imageUrl, focalPoint, errors, onGettyEmbed, onImageUrl, onFocalPoint }) {
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel>Image</FieldLabel>

      {/* Getty embed */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Getty Embed Code</FieldLabel>
        <textarea
          value={gettyEmbed}
          onChange={e => onGettyEmbed(e.target.value)}
          placeholder="Paste the embed code from Getty Images…"
          rows={4}
          className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a] resize-y font-mono"
        />
        {gettyEmbed.trim() && isGettyEmbed(gettyEmbed) && (
          <p className="text-xs text-[#8A877F]">
            Getty embed detected
            {(() => { const m = gettyEmbed.match(/items:'(\d+)'/) ; return m ? ` — asset #${m[1]}` : '' })()}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-[#2a2a2a]" />
        <span className="text-[10px] text-[#3a3a3a] uppercase tracking-wider">or</span>
        <div className="flex-1 border-t border-[#2a2a2a]" />
      </div>

      {/* Direct image URL */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Image URL</FieldLabel>
        <input
          type="url"
          value={imageUrl}
          onChange={e => onImageUrl(e.target.value)}
          placeholder="https://… (from a news or sports site)"
          className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
        />
        <p className="text-[10px] text-[#3a3a3a]">Facebook and Instagram links are not supported</p>
        <InlineError msg={errors?.imageUrl} />
        {imageUrl.trim() && !isBlockedUrl(imageUrl.trim()) && (
          <img
            src={imageUrl.trim()}
            alt="Preview"
            className="max-h-48 max-w-full object-contain border border-[#2a2a2a] bg-[#111]"
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
      </div>

      <InlineError msg={errors?.image} />

      {/* Focal point */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Focal Point</FieldLabel>
        <div className="flex gap-0">
          {['left', 'center', 'right'].map((fp, i) => (
            <button
              key={fp}
              type="button"
              onClick={() => onFocalPoint(fp)}
              className={`px-4 py-1.5 text-xs border transition-colors capitalize ${
                i === 0 ? '' : '-ml-px'
              } ${
                focalPoint === fp
                  ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] z-10 relative'
                  : 'border-[#2a2a2a] text-[#8A877F] hover:border-[#C9A84C] hover:text-[#C9A84C] cursor-pointer'
              }`}
            >
              {fp}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
