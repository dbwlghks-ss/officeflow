import { formatHomeHeroDate, getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'

type HomeHeroBriefProps = {
  /** Defaults to current time; pass for tests or future server-driven content. */
  date?: Date
  /** Optional override for Supabase or CMS-driven brief copy. */
  content?: Partial<HomeBriefContent>
}

export default function HomeHeroBrief({ date = new Date(), content }: HomeHeroBriefProps) {
  const resolved = { ...getHomeBriefContent(date), ...content }
  const formattedDate = formatHomeHeroDate(date)

  return (
    <section className="mb-8">
      <p className="mb-1 text-sm font-medium text-slate-400">{formattedDate}</p>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {resolved.greeting}.
      </h1>

      <div className="mt-3 max-w-xl">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-slate-400">
          <span className="text-[15px] leading-none" aria-hidden="true">
            {resolved.emoji}
          </span>
          <span>{resolved.title}</span>
        </p>
        <p className="mt-1.5 text-base leading-relaxed text-slate-500">{resolved.intro}</p>
      </div>
    </section>
  )
}
