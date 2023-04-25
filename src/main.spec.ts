import { generateCsvRecord, thresholdsByMetric } from './main.function'
import { CrUXApiResponse } from './main.types'

const response: CrUXApiResponse = {
  record: {
    key: {
      url: 'https://developer.chrome.com/docs/',
      formFactor: 'PHONE',
    },
    metrics: {
      largest_contentful_paint: {
        histogramTimeseries: [
          { start: 0, end: 2500, densities: [0, 0.5, 0.25, 0.25] },
          { start: 2500, end: 4000, densities: [0, 0.5, 0.25, 0.25] },
          { start: 4000, densities: [0, 0.5, 0.25, 0.25] },
        ],
        percentilesTimeseries: { p75s: [1000, 1500, 1750, 1800] },
      },
      first_input_delay: {
        histogramTimeseries: [
          { start: 0, end: 100, densities: [0.1, 0.4, 0.4, 0.1] },
          { start: 100, end: 300, densities: [0.1, 0.4, 0.4, 0.1] },
          { start: 300, densities: [0.1, 0.4, 0.4, 0.1] },
        ],
        percentilesTimeseries: { p75s: [50, 80, 90, 95] },
      },
    },
    collectionPeriods: [
      {
        firstDate: {
          year: 2022,
          month: 12,
          day: 18,
        },
        lastDate: {
          year: 2023,
          month: 1,
          day: 14,
        },
      },
      {
        firstDate: {
          year: 2022,
          month: 12,
          day: 25,
        },
        lastDate: {
          year: 2023,
          month: 1,
          day: 21,
        },
      },
      {
        firstDate: {
          year: 2023,
          month: 1,
          day: 1,
        },
        lastDate: {
          year: 2023,
          month: 1,
          day: 28,
        },
      },
    ],
  },
  urlNormalizationDetails: {
    originalUrl: 'https://developer.chrome.com/docs/',
    normalizedUrl: 'https://developer.chrome.com/docs/cle',
  },
}

describe('thresholdsByMetric', () => {
  it('returns the correct thresholds for each metric', () => {
    const expected = {
      largest_contentful_paint: [2500, 4000],
      first_input_delay: [100, 300],
    }
    expect(thresholdsByMetric(response)).toEqual(expected)
  })
})

describe('generateCsvRecord', () => {
  it('returns the expected data frame for a single metric', () => {
    const expected = [
      {
        first_date: '2022-12-18',
        last_date: '2023-01-14',
        p75: 50,
        good: 0.1,
        needs_improvement: 0.1,
        poor: 0.1,
        url: 'https://developer.chrome.com/docs/',
        metric_short_name: 'FID',
        form_factor: 'PHONE',
        high_threshold: 300,
        low_threshold: 100,
      },
    ]
    expect(generateCsvRecord(response)[0]).toEqual(expected[0])
  })
})
