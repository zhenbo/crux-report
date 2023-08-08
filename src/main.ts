import { createObjectCsvWriter } from 'csv-writer'
import { CrUXApiRequestParam } from './main.types'
import { fetchCrUXData } from './main.function'
import config from './config'
import readCsv from './csv.utils'
import yargs from 'yargs'
import moment from 'moment'

// Get the range for first date
const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ'
const parser = yargs(process.argv.slice(2)).options({
  lowFirstDate: {
    alias: 'low',
    type: 'string',
    description:
      'this is lower end of first date where the data point is collected, it starts at Sunday, example: 2023-04-30T00:00:00.000-04:00',
    required: true,
    coerce: (arg: string) => {
      if (!moment(arg, dateFormat, true).isValid()) {
        throw new Error('Invalid lower end first date. Correct format is ' + dateFormat)
      }
      return arg
    },
  },
  highFirstDate: {
    alias: 'high',
    type: 'string',
    description:
      'this is higher end first date where the data point is collected, it starts at Sunday example: 2023-04-30T00:00:00.000-04:00',
    required: true,
    coerce: (arg: string) => {
      if (!moment(arg, dateFormat, true).isValid()) {
        throw new Error('Invalid higher end first date. Correct format is ' + dateFormat)
      }
      return arg
    },
  },
})
const argv = await parser.argv
const API_KEY = config.apiKey
const API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'
const OUTPUT_CSV_FILE_PATH = './data/crux-data.csv'
const INPUT_CSV_FILE_PATH = './data/input.csv'
const FORM_FACTOR = ['PHONE', 'DESKTOP', 'ALL']
const RATE_LIMIT = 100

// Set the SAMPLE_URLS you want to fetch CrUX data for
const SAMPLE_URLS: string[] = await readCsv(INPUT_CSV_FILE_PATH)

// Set the CrUX metrics you want to retrieve
const CRUX_METRICS: string[] = [
  // 'largest_contentful_paint',
  // 'first_input_delay',
  // 'cumulative_layout_shift',
  // 'first_contentful_paint',
  'interaction_to_next_paint',
  // 'experimental_time_to_first_byte',
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
  path: OUTPUT_CSV_FILE_PATH,
  header: csvHeaders,
})

// Start fetching CrUX data
const requestParam: CrUXApiRequestParam = {
  api_key: API_KEY,
  api_url: API_URL,
  metrics: CRUX_METRICS,
  form_factor: FORM_FACTOR,
  urls: SAMPLE_URLS,
  rate_limit: RATE_LIMIT, // 100 requests/min
}

const thresholdLow = new Date(argv.lowFirstDate)
const thresholdHigh = new Date(argv.highFirstDate)
fetchCrUXData(requestParam, csvWriterInstance, thresholdLow, thresholdHigh)
