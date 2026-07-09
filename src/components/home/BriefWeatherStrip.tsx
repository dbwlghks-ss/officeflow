import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import type { BriefWeatherDay, BriefWeatherIcon, BriefWeatherSummary } from '../../services/weatherService'

const ICON_BY_CONDITION: Record<BriefWeatherIcon, LucideIcon> = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  fog: CloudFog,
  unknown: Cloud,
}

type BriefWeatherStripProps = {
  weather: BriefWeatherSummary | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  className?: string
}

function formatTempRange(day: BriefWeatherDay): string {
  const min = day.minTemp
  const max = day.maxTemp

  if (min !== undefined && max !== undefined) return `${min}°/${max}°`
  if (day.currentTemp !== undefined) return `${day.currentTemp}°`
  return ''
}

function WeatherDayLine({
  prefix,
  day,
}: {
  prefix: string
  day: BriefWeatherDay
}) {
  const Icon = ICON_BY_CONDITION[day.icon]
  const tempLabel = formatTempRange(day)

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon size={13} strokeWidth={1.75} className="shrink-0 text-white/75" aria-hidden="true" />
      <span className="truncate">
        {prefix} {day.condition}
        {tempLabel ? ` ${tempLabel}` : ''}
      </span>
    </span>
  )
}

export default function BriefWeatherStrip({
  weather,
  status,
  className = '',
}: BriefWeatherStripProps) {
  if (status === 'error') {
    return (
      <p
        className={`text-[11px] text-white/55${className ? ` ${className}` : ''}`}
        aria-live="polite"
      >
        날씨 정보를 불러올 수 없습니다
      </p>
    )
  }

  if (!weather?.today) return null

  const hasTomorrow = Boolean(weather.tomorrow)

  return (
    <div
      className={
        `flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-relaxed text-white/75` +
        (className ? ` ${className}` : '')
      }
      aria-label={`${weather.locationName} 날씨 요약`}
    >
      <WeatherDayLine prefix="오늘" day={weather.today} />
      {hasTomorrow && weather.tomorrow ? (
        <>
          <span className="text-white/45" aria-hidden="true">
            ·
          </span>
          <WeatherDayLine prefix="내일" day={weather.tomorrow} />
        </>
      ) : null}
    </div>
  )
}
