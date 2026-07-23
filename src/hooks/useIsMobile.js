import { useEffect, useState } from 'react'

// Reports whether the viewport is below Tailwind's `md` breakpoint (768px),
// matching the app's mobile/desktop split. SSR-safe: the build (vite-react-ssg)
// pre-renders in Node where `window` is undefined, so we start `false` (desktop)
// on the server and first client paint — avoiding a hydration mismatch — then
// sync to the real viewport in an effect once mounted.
export function useIsMobile(maxWidth = 767) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [maxWidth])

  return isMobile
}
