import { useEffect, useState, type ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setReady(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className={ready ? 'app-shell app-shell-ready' : 'app-shell app-shell-pending'}>
      {children}
    </div>
  )
}
