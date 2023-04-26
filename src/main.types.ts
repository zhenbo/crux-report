export type ReportDate = {
  year: number
  month: number
  day: number
}

export type CrUXApiResponse = {
  record: {
    key: {
      url: string
      formFactor: string
    }
    metrics: {
      [key: string]: {
        histogramTimeseries: Array<{
          start: number
          end?: number
          densities: number[]
        }>
        percentilesTimeseries: {
          p75s: number[]
        }
      }
    }
    collectionPeriods: Array<{
      firstDate: ReportDate
      lastDate: ReportDate
    }>
  }
  urlNormalizationDetails: {
    originalUrl: string
    normalizedUrl: string
  }
}

export type Thresholds = {
  [key: string]: [number, number]
}

export type CrUXDataFrame = {
  first_date: Date[]
  last_date: Date[]
  p75: number[]
  good: number[]
  needs_improvement: number[]
  poor: number[]
  url: string
  metric_short_name: string
  form_factor: string
  high_threshold: number
  low_threshold: number
}

export type CrUXDataItemFrame = {
  first_date: string
  last_date: string
  p75: number
  good: number
  needs_improvement: number
  poor: number
  url: string
  metric_short_name: string
  form_factor: string
  high_threshold: number
  low_threshold: number
}

export type CrUXApiRequestParam = {
  urls: string[]
  metrics: string[]
  form_factor: string[]
  rate_limit: number
}
