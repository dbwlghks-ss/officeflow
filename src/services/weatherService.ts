export type BriefWeatherIcon =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'fog'
  | 'unknown'

export type BriefWeatherDay = {
  date: string
  label: 'today' | 'tomorrow'
  condition: string
  icon: BriefWeatherIcon
  minTemp?: number
  maxTemp?: number
  currentTemp?: number
}

export type BriefWeatherSummary = {
  locationName: string
  today: BriefWeatherDay | null
  tomorrow: BriefWeatherDay | null
  updatedAt: string
}

/** Company HQ coordinates — set real values when available. */
export const DEFAULT_WEATHER_LOCATION = {
  name: '회사 기준',
  // TODO: Replace with actual HWASHIN headquarters latitude/longitude.
  latitude: 0,
  longitude: 0,
} as const

const WEATHER_CACHE_KEY = 'officeflow_weather_summary'
const WEATHER_CACHE_TTL_MS = 45 * 60 * 1000
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

type WeatherCacheEntry = {
  data: BriefWeatherSummary
  expiresAt: number
}

type OpenMeteoForecastResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

function hasValidWeatherLocation(): boolean {
  const { latitude, longitude } = DEFAULT_WEATHER_LOCATION
  return latitude !== 0 || longitude !== 0
}

function roundTemp(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined
  return Math.round(value)
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function mapWeatherCode(code: number | undefined): { icon: BriefWeatherIcon; condition: string } {
  if (code === undefined || Number.isNaN(code)) {
    return { icon: 'unknown', condition: '정보 없음' }
  }

  if (code === 0) return { icon: 'sunny', condition: '맑음' }
  if (code === 1) return { icon: 'sunny', condition: '대체로 맑음' }
  if (code === 2) return { icon: 'cloudy', condition: '구름 조금' }
  if (code === 3) return { icon: 'cloudy', condition: '흐림' }
  if (code === 45 || code === 48) return { icon: 'fog', condition: '안개' }
  if (code >= 51 && code <= 57) return { icon: 'rain', condition: '이슬비' }
  if (code >= 61 && code <= 67) return { icon: 'rain', condition: '비' }
  if (code >= 71 && code <= 77) return { icon: 'snow', condition: '눈' }
  if (code >= 80 && code <= 82) return { icon: 'rain', condition: '소나기' }
  if (code >= 85 && code <= 86) return { icon: 'snow', condition: '눈' }
  if (code >= 95 && code <= 99) return { icon: 'storm', condition: '천둥번개' }

  return { icon: 'unknown', condition: '정보 없음' }
}

function readWeatherCache(): BriefWeatherSummary | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as WeatherCacheEntry
    if (!parsed?.data || typeof parsed.expiresAt !== 'number') return null
    if (Date.now() > parsed.expiresAt) return null

    return parsed.data
  } catch {
    return null
  }
}

function writeWeatherCache(data: BriefWeatherSummary): void {
  try {
    const entry: WeatherCacheEntry = {
      data,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
    }
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Ignore storage failures — weather is non-critical.
  }
}

function readStaleWeatherCache(): BriefWeatherSummary | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WeatherCacheEntry
    return parsed?.data ?? null
  } catch {
    return null
  }
}

function buildMockWeatherSummary(): BriefWeatherSummary {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    locationName: DEFAULT_WEATHER_LOCATION.name,
    today: {
      date: formatDateKey(now),
      label: 'today',
      condition: '흐림',
      icon: 'cloudy',
      minTemp: 24,
      maxTemp: 29,
      currentTemp: 26,
    },
    tomorrow: {
      date: formatDateKey(tomorrow),
      label: 'tomorrow',
      condition: '맑음',
      icon: 'sunny',
      minTemp: 23,
      maxTemp: 31,
    },
    updatedAt: new Date().toISOString(),
  }
}

function buildDayFromDaily(
  label: 'today' | 'tomorrow',
  date: string,
  weatherCode: number | undefined,
  minTemp: number | undefined,
  maxTemp: number | undefined,
  currentTemp?: number,
): BriefWeatherDay {
  const mapped = mapWeatherCode(weatherCode)

  return {
    date,
    label,
    condition: mapped.condition,
    icon: mapped.icon,
    minTemp: roundTemp(minTemp),
    maxTemp: roundTemp(maxTemp),
    currentTemp: label === 'today' ? roundTemp(currentTemp) : undefined,
  }
}

async function fetchOpenMeteoForecast(): Promise<BriefWeatherSummary | null> {
  const { latitude, longitude, name } = DEFAULT_WEATHER_LOCATION

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'Asia/Seoul',
    forecast_days: '2',
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
  })

  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`)
  if (!response.ok) return null

  const payload = (await response.json()) as OpenMeteoForecastResponse
  const dates = payload.daily?.time ?? []
  if (dates.length < 2) return null

  const today = buildDayFromDaily(
    'today',
    dates[0],
    payload.daily?.weather_code?.[0],
    payload.daily?.temperature_2m_min?.[0],
    payload.daily?.temperature_2m_max?.[0],
    payload.current?.temperature_2m,
  )

  const tomorrow = buildDayFromDaily(
    'tomorrow',
    dates[1],
    payload.daily?.weather_code?.[1],
    payload.daily?.temperature_2m_min?.[1],
    payload.daily?.temperature_2m_max?.[1],
  )

  return {
    locationName: name,
    today,
    tomorrow,
    updatedAt: new Date().toISOString(),
  }
}

/** Returns cached summary immediately when valid. */
export function getCachedBriefWeatherSummary(): BriefWeatherSummary | null {
  return readWeatherCache()
}

/**
 * Loads brief weather summary with cache + graceful fallback.
 * Never throws — returns null only when no data is available.
 */
export async function fetchBriefWeatherSummary(): Promise<BriefWeatherSummary | null> {
  try {
    if (!hasValidWeatherLocation()) {
      const mock = buildMockWeatherSummary()
      writeWeatherCache(mock)
      return mock
    }

    const fresh = await fetchOpenMeteoForecast()
    if (fresh) {
      writeWeatherCache(fresh)
      return fresh
    }

    return readStaleWeatherCache()
  } catch {
    return readStaleWeatherCache()
  }
}
