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
          { start: 0, end: 2500, densities: [0.661468505859375, 0.65692138671875, 0.6688232421875, 0.645263671875] },
          {
            start: 2500,
            end: 4000,
            densities: [0.13287353515625, 0.136505126953125, 0.13336181640625, 0.148345947265625],
          },
          { start: 4000, densities: [0.205657958984375, 0.206573486328125, 0.19781494140625, 0.206390380859375] },
        ],
        percentilesTimeseries: { p75s: [3638, 3600, 3505, 3654] },
      },
      first_input_delay: {
        histogramTimeseries: [
          { start: 0, end: 100, densities: [0.82470703125, 0.834320068359375, 0.836761474609375, 0.835052490234375] },
          {
            start: 100,
            end: 300,
            densities: [0.090240478515625, 0.089752197265625, 0.092864990234375, 0.10198974609375],
          },
          { start: 300, densities: [0.085052490234375, 0.075927734375, 0.07037353515625, 0.062957763671875] },
        ],
        percentilesTimeseries: { p75s: [32, 31, 31, 30] },
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
        p75: 32,
        good: 0.82470703125,
        needs_improvement: 0.090240478515625,
        poor: 0.085052490234375,
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
