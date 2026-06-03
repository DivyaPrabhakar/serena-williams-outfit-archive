import { useEffect, useRef, useState } from 'react'

export default function LazyIframe({
  srcDoc, title, sandbox, wrapperClassName = '', iframeClassName = '', rootMargin = '600px',
}) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect() }
    }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [show, rootMargin])
  return (
    <div ref={ref} className={wrapperClassName}>
      {show && (
        <iframe srcDoc={srcDoc} title={title} sandbox={sandbox}
                className={iframeClassName} loading="lazy" />
      )}
    </div>
  )
}
