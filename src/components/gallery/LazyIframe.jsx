import { useEffect, useRef, useState } from 'react'

// Getty embeds are heavy live iframes, so besides lazily mounting them as they
// approach the viewport we also unmount them once they're well outside it —
// otherwise every iframe ever scrolled past stays alive and the tab degrades.
// The unmount margin is larger than the mount margin (hysteresis) so an element
// resting near the boundary doesn't thrash between mounted and unmounted.
export default function LazyIframe({
  srcDoc, title, sandbox, wrapperClassName = '', iframeClassName = '',
  rootMargin = '600px', unmountMargin = '2000px',
}) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mountIo = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShow(true)
    }, { rootMargin })
    const unmountIo = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) setShow(false)
    }, { rootMargin: unmountMargin })
    mountIo.observe(el)
    unmountIo.observe(el)
    return () => { mountIo.disconnect(); unmountIo.disconnect() }
  }, [rootMargin, unmountMargin])
  return (
    <div ref={ref} className={wrapperClassName}>
      {show && (
        <iframe srcDoc={srcDoc} title={title} sandbox={sandbox}
                className={iframeClassName} loading="lazy" />
      )}
    </div>
  )
}
