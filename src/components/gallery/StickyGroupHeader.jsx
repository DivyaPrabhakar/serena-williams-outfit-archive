import { useEffect, useRef, useState } from 'react'
import { useGroupNav } from './GroupNavContext'

// Top-level group header (Year / Color / Brand / Tournament) that pins below the
// nav while its section is scrolled. When pinned ("stuck") it collapses into a slim
// single line: smaller title with the count/subtitle pulled inline beside it.
//
// When an `id` is provided it also registers itself with the GroupNav registry so
// the left jump-nav can list and scroll to this section. The sentinel/anchor div
// is the scroll target (with scroll-mt to clear the sticky top nav).
export default function StickyGroupHeader({ id, label, swatches, title, subtitle, className = '' }) {
  const sentinelRef = useRef(null)
  const stickyRef = useRef(null)
  const [stuck, setStuck] = useState(false)
  const { register } = useGroupNav()

  useEffect(() => {
    const sentinel = sentinelRef.current
    const sticky = stickyRef.current
    if (!sentinel || !sticky) return

    let observer
    function setup() {
      if (observer) observer.disconnect()
      // Match the JS pin line to whatever CSS `top` the active breakpoint resolved to.
      const top = parseFloat(getComputedStyle(sticky).top) || 0
      observer = new IntersectionObserver(
        ([entry]) => setStuck(!entry.isIntersecting),
        { rootMargin: `-${top + 1}px 0px 0px 0px`, threshold: 0 },
      )
      observer.observe(sentinel)
    }

    setup()
    window.addEventListener('resize', setup)
    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', setup)
    }
  }, [])

  useEffect(() => {
    if (!id || !sentinelRef.current) return
    return register({ id, label: label ?? title, el: sentinelRef.current })
  }, [id, label, title, register])

  return (
    <>
      <div ref={sentinelRef} id={id} aria-hidden className="h-px -mb-px scroll-mt-28" />
      <div
        ref={stickyRef}
        data-stuck={stuck}
        className={`group/sticky sticky top-44 md:top-28 z-20 bg-dark -mx-3 px-3 py-3 transition-all duration-200 data-[stuck=true]:py-2 data-[stuck=true]:border-b data-[stuck=true]:border-dark3 ${className}`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {swatches}
          <h2 className="font-playfair text-5xl text-ink leading-none transition-all duration-200 group-data-[stuck=true]/sticky:text-2xl">
            {title}
          </h2>
          <p className="w-full text-sm leading-none text-muted transition-all duration-200 group-data-[stuck=true]/sticky:w-auto group-data-[stuck=true]/sticky:text-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </>
  )
}
