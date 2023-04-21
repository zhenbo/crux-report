import axios, { AxiosRequestConfig } from 'axios'
import { createObjectCsvWriter } from 'csv-writer'

type ReportDate = {
  year: number
  month: number
  day: number
}

type CrUXApiResponse = {
  record: {
    key: {
      url: string
      formFactor: string
    }
    metrics: {
      [key: string]: {
        histogramTimeseries: Array<{
          start: string
          end: string
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

type Thresholds = {
  [key: string]: [number, number]
}

type CrUXDataFrame = {
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

type CrUXDataItemFrame = {
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

function metricsIn(response: CrUXApiResponse): string[] {
  const metrics = Object.keys(response.record.metrics)
  metrics.sort()
  return metrics
}

function thresholdsByMetric(response: CrUXApiResponse): Thresholds {
  const result: Thresholds = {}
  const metrics = response.record.metrics

  for (const metric in metrics) {
    const data = metrics[metric]
    result[metric] = [parseFloat(data.histogramTimeseries[1].start), parseFloat(data.histogramTimeseries[1].end)]
  }
  return result
}

function timestamp(dateObj: { year: number; month: number; day: number }): Date {
  return new Date(dateObj.year, dateObj.month - 1, dateObj.day)
}

function shortName(metric: string): string {
  const short = metric
    .split('_')
    .filter(s => s !== 'experimental')
    .map(s => s[0].toUpperCase())
    .join('')

  return short !== 'ITNP' ? short : 'INP'
}

function dataframeFor(
  metric: string,
  response: CrUXApiResponse,
  high_threshold: number,
  low_threshold: number,
): CrUXDataFrame {
  const collectionPeriods = response.record.collectionPeriods
  const data = response.record.metrics[metric]
  const cols = {
    first_date: collectionPeriods.map(e => timestamp(e.firstDate)),
    last_date: collectionPeriods.map(e => timestamp(e.lastDate)),
    p75: data.percentilesTimeseries.p75s,
    good: data.histogramTimeseries[0].densities,
    needs_improvement: data.histogramTimeseries[1].densities,
    poor: data.histogramTimeseries[2].densities,
    url: response.record.key.url,
    metric_short_name: shortName(metric),
    form_factor: response.record.key.formFactor,
    high_threshold: high_threshold,
    low_threshold: low_threshold,
  }
  return cols
}

function convertToCsvDataRecord(cruxDataFrame: CrUXDataFrame): CrUXDataItemFrame[] {
  const result = []
  const numberOfRecords = cruxDataFrame.first_date.length
  for (let i = 0; i < numberOfRecords; i++) {
    const cruxDataItem = {
      first_date: formatDate(cruxDataFrame.first_date[i]),
      last_date: formatDate(cruxDataFrame.last_date[i]),
      p75: cruxDataFrame.p75[i],
      good: cruxDataFrame.good[i],
      needs_improvement: cruxDataFrame.needs_improvement[i],
      poor: cruxDataFrame.poor[i],
      url: cruxDataFrame.url,
      metric_short_name: cruxDataFrame.metric_short_name,
      form_factor: cruxDataFrame.form_factor,
      high_threshold: cruxDataFrame.high_threshold,
      low_threshold: cruxDataFrame.low_threshold,
    }
    result.push(cruxDataItem)
  }
  return result
}

function generateCsvRecord(cruxApiResponse: CrUXApiResponse): CrUXDataItemFrame[] {
  const result = []
  const thresholds = thresholdsByMetric(cruxApiResponse)
  for (const metric of metricsIn(cruxApiResponse)) {
    const [loThreshold, hiThreshold] = thresholds[metric]
    const dataFrame = dataframeFor(metric, cruxApiResponse, hiThreshold, loThreshold)
    const csvDataRecords = convertToCsvDataRecord(dataFrame)
    for (const csvDataRecordItem of csvDataRecords) {
      result.push(csvDataRecordItem)
    }
  }
  return result
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

const API_KEY = 'AIzaSyC_WmfG1tPj-2AjAY3rqYIx7S4d6KR5Zf0'
const API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'
const CSV_FILE_NAME = './dist/crux-data.csv'
const FORM_FACTOR = 'PHONE'

// Set the URLs you want to fetch CrUX data for
const urls: string[] = [
  'https://www.eventbrite.com',
  'https://www.eventbrite.com/signin/signup',
  'https://www.eventbrite.com/d/ca--san-francisco/events/',
  'https://www.eventbrite.com/contact/',
  'https://www.eventbrite.com/c/eater-nyc-food-events-cgrkyrw/',
]

// Set the CrUX metrics you want to retrieve
const cruxMetrics: string[] = [
  'largest_contentful_paint',
  'first_input_delay',
  'cumulative_layout_shift',
  'first_contentful_paint',
  'experimental_interaction_to_next_paint',
  'experimental_time_to_first_byte',
]

// Set the headers for the CSV file
const csvHeaders = [
  { id: 'first_date', title: 'first_date' },
  { id: 'last_date', title: 'last_date' },
  { id: 'p75', title: 'p75' },
  { id: 'good', title: 'good' },
  { id: 'needs_improvement', title: 'needs_improvement' },
  { id: 'poor', title: 'poor' },
  { id: 'url', title: 'url' },
  { id: 'metric_short_name', title: 'metric_short_name' },
  { id: 'form_factor', title: 'form_factor' },
  { id: 'high_threshold', title: 'high_threshold' },
  { id: 'low_threshold', title: 'low_threshold' },
]

// Create a CSV writer to write the data to a file
const csvWriterInstance = createObjectCsvWriter({
  path: CSV_FILE_NAME,
  header: csvHeaders,
})

// Function to fetch CrUX data and write to CSV
async function fetchCrUXData(): Promise<void> {
  // Loop through each URL and fetch CrUX data
  for (let i = 0; i < urls.length; i++) {
    try {
      // Construct the API request
      const requestBody = {
        formFactor: FORM_FACTOR,
        url: urls[i],
        metrics: cruxMetrics,
      }

      // Construct headers and plug in API key
      const requestConfig: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        params: {
          key: API_KEY,
        },
      }

      // Make the API request
      const response = await axios.post(API_URL, requestBody, requestConfig)
      const cruxApiResponse: CrUXApiResponse = response.data
      const csvRecords = generateCsvRecord(cruxApiResponse)
      // Write the data to the CSV file
      await csvWriterInstance.writeRecords(csvRecords)
      console.log(`Data fetched and written to CSV for URL: ${urls[i]}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error fetching data for URL: ${urls[i]} - ${error.message}`)
      }
    }
    // Delay for the rate limit before fetching data for the next URL
    await new Promise(resolve => setTimeout(resolve, 60000 / 100)) // 60000 ms = 1 minute
  }
}

// Start fetching CrUX data
fetchCrUXData()
