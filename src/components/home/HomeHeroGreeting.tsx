type HomeHeroGreetingProps = {
  dateLabel: string
  greeting: string
  compact?: boolean
}

export default function HomeHeroGreeting({
  dateLabel,
  greeting,
  compact = false,
}: HomeHeroGreetingProps) {
  if (compact) {
    return (
      <div className="text-left">
        <p className="text-xs font-medium text-slate-400">{dateLabel}</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl">
          {greeting}
        </h1>
      </div>
    )
  }

  return (
    <>
      <p className="mb-0.5 text-xs font-medium text-slate-400">{dateLabel}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-[28px]">
        {greeting}
      </h1>
    </>
  )
}
