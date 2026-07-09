import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type PageTransitionProps = {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const isInitialMount = useRef(true)

  useEffect(() => {
    isInitialMount.current = false
  }, [])

  return (
    <div
      key={isInitialMount.current ? 'initial' : location.key}
      className={isInitialMount.current ? 'min-h-screen' : 'animate-page-in min-h-screen'}
    >
      {children}
    </div>
  )
}
