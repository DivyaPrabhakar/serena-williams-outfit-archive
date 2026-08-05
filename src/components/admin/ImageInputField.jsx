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
          className="w-full bg-dark border-2 border-white text-ink px-3 py-2 text-sm outline-none focus:border-brand placeholder-line-strong resize-y font-mono"
        />
        {gettyEmbed.trim() && isGettyEmbed(gettyEmbed) && (
          <p className="text-xs text-muted">
            Getty embed detected
            {(() => { const m = gettyEmbed.match(/items:'(\d+)'/) ; return m ? ` — asset #${m[1]}` : '' })()}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t-2 border-white" />
        <span className="text-[10px] text-line-strong uppercase tracking-wider">or</span>
        <div className="flex-1 border-t-2 border-white" />
      </div>

      {/* Direct image URL */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Image URL</FieldLabel>
        <input
          type="url"
          value={imageUrl}
          onChange={e => onImageUrl(e.target.value)}
          placeholder="https://… (from a news or sports site)"
          className="w-full bg-dark border-2 border-white text-ink px-3 py-2 text-sm outline-none focus:border-brand placeholder-line-strong"
        />
        <p className="text-[10px] text-line-strong">Facebook and Instagram links are not supported</p>
        <InlineError msg={errors?.imageUrl} />
        {imageUrl.trim() && !isBlockedUrl(imageUrl.trim()) && (
          <img
            src={imageUrl.trim()}
            alt="Preview"
            className="max-h-48 max-w-full object-contain border-2 border-white bg-well"
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
              className={`px-4 py-1.5 text-xs border-2 transition-colors capitalize ${
                i === 0 ? '' : '-ml-px'
              } ${
                focalPoint === fp
                  ? 'border-brand bg-brand/10 text-brand z-10 relative'
                  : 'border-white text-muted hover:border-brand hover:text-brand cursor-pointer'
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
