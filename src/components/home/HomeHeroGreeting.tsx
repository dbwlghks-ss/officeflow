type HomeHeroGreetingProps = {
  dateLabel: string
  greeting: string
}

export default function HomeHeroGreeting({ dateLabel, greeting }: HomeHeroGreetingProps) {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-slate-400">{dateLabel}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 lg:text-[2rem]">
        {greeting}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        궁금한 업무를 물어보거나, 필요한 일을 바로 요청하세요.
      </p>
    </div>
  )
}
