import { useEffect, useState } from 'react'
import {
  fetchBriefWeatherSummary,
  getCachedBriefWeatherSummary,
  type BriefWeatherSummary,
} from '../services/weatherService'

type BriefWeatherStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useBriefWeather() {
  const [weather, setWeather] = useState<BriefWeatherSummary | null>(() => getCachedBriefWeatherSummary())
  const [status, setStatus] = useState<BriefWeatherStatus>(() =>
    getCachedBriefWeatherSummary() ? 'ready' : 'idle',
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      const cached = getCachedBriefWeatherSummary()
      if (cached && !cancelled) {
        setWeather(cached)
        setStatus('ready')
      } else if (!cancelled) {
        setStatus('loading')
      }

      try {
        const next = await fetchBriefWeatherSummary()
        if (cancelled) return

        if (next) {
          setWeather(next)
          setStatus('ready')
          return
        }

        if (!cached) {
          setWeather(null)
          setStatus('error')
        }
      } catch {
        if (!cancelled && !cached) {
          setWeather(null)
          setStatus('error')
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { weather, status }
}
