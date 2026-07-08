import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { AssistantWorkspaceProvider } from '../components/home/assistant/AssistantWorkspaceProvider'
import HomeMainContent from '../components/home/HomeMainContent'

/** Matches Header sticky height (`h-[68px]`). */
const HEADER_HEIGHT_PX = 68

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-slate-800">
      <Header />

      <AssistantWorkspaceProvider>
        <main
          className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-6 py-4 lg:max-h-[calc(100dvh-var(--header-h))] lg:min-h-0 lg:px-8 lg:py-5"
          style={{ ['--header-h' as string]: `${HEADER_HEIGHT_PX}px` }}
        >
          <HomeMainContent onNavigate={navigate} />
        </main>
      </AssistantWorkspaceProvider>
    </div>
  )
}
