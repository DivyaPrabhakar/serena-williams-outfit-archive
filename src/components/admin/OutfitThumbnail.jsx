import { isGettyEmbed, gettyEmbedForIframe } from '../../lib/imageUtils'
import LazyIframe from '../gallery/LazyIframe'

// The small outfit thumbnail used across the admin list rows. Getty embeds
// render in a sandboxed iframe; everything else is a plain <img>. Sizing is
// fixed (w-10 h-14) to match the row layouts.
export default function OutfitThumbnail({ o }) {
  if (isGettyEmbed(o.imageUrl)) {
    return (
      <LazyIframe
        srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#111}body{display:flex;align-items:center;justify-content:center}</style></head><body>${gettyEmbedForIframe(o.imageUrl)}</body></html>`}
        wrapperClassName="w-10 h-14 flex-shrink-0 bg-[#111]"
        iframeClassName="w-full h-full border-0 pointer-events-none"
        sandbox="allow-scripts allow-same-origin"
      />
    )
  }
  return (
    <img
      src={o.imageUrl}
      alt=""
      className="w-10 h-14 object-cover flex-shrink-0 bg-[#222]"
      onError={e => { e.target.style.opacity = '0.2' }}
    />
  )
}
