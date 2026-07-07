type HomeHeroGreetingProps = {
  dateLabel: string
  greeting: string
}

export default function HomeHeroGreeting({ dateLabel, greeting }: HomeHeroGreetingProps) {
  return (
    <>
      <p className="mb-1 text-sm font-medium text-slate-400">{dateLabel}</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {greeting}.
      </h1>
    </>
  )
}
