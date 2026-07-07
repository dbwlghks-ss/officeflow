type HomeHeroBriefHeaderProps = {
  emoji: string
  title: string
  intro: string
}

export default function HomeHeroBriefHeader({ emoji, title, intro }: HomeHeroBriefHeaderProps) {
  return (
    <div className="mt-3 max-w-xl">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-slate-400">
        <span className="text-[15px] leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span>{title}</span>
      </p>
      <p className="mt-1.5 text-base leading-relaxed text-slate-500">{intro}</p>
    </div>
  )
}
