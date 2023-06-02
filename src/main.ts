import axios, { AxiosRequestConfig } from 'axios'
import { createObjectCsvWriter } from 'csv-writer'
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'
import { CrUXApiResponse, CrUXApiRequestParam, CrUXDataItemFrame } from './main.types'
import { generateCsvRecord, getClosetSundayInPast, filterRecordsByDateRange } from './main.function'
import config from './config'
import readCsv from './csv.utils'

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
  path: OUTPUT_CSV_FILE_PATH,
  header: csvHeaders,
})

// Function to fetch CrUX data and write to CSV
export async function fetchCrUXData(
  requestParam: CrUXApiRequestParam,
  csvWriterInstance: CsvWriter<CrUXDataItemFrame>,
  startDate?: Date,
  endDate?: Date,
): Promise<void> {
  // Loop through each URL and fetch CrUX data
  for (let i = 0; i < requestParam.urls.length; i++) {
    for (const form_factor in FORM_FACTOR) {
      try {
        // Construct the API request
        const requestBody = {
          form_factor: form_factor,
          url: requestParam.urls[i],
          metrics: requestParam.metrics,
        }
        // Pulling data combined across desktop, tablet and phone
        if (form_factor == 'ALL') {
          requestBody.form_factor = ''
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
        let csvRecords = generateCsvRecord(cruxApiResponse)
        let lastDate = new Date()
        if (startDate) {
          const firstDate = getClosetSundayInPast(startDate)
          if (endDate === undefined) {
            // When last date is not set, set it to current date
            lastDate = getClosetSundayInPast(new Date())
          } else {
            // Otherwise get the closet Sunday of the end date
            lastDate = getClosetSundayInPast(endDate)
          }
          csvRecords = filterRecordsByDateRange(csvRecords, firstDate, lastDate)
        }

        // Write the data to the CSV file
        await csvWriterInstance.writeRecords(csvRecords)
        console.log(`Data fetched and written to CSV for URL: ${requestParam.urls[i]}`)
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`Error fetching data for URL: ${requestParam.urls[i]} - ${error.message}`)
        }
      }
      // Delay for the rate limit before fetching data for the next URL
      await new Promise(resolve => setTimeout(resolve, 60000 / requestParam.rate_limit)) // 60000 ms = 1 minute
    }
  }
}

// Start fetching CrUX data
const requestParam: CrUXApiRequestParam = {
  metrics: CRUX_METRICS,
  form_factor: FORM_FACTOR,
  urls: SAMPLE_URLS,
  rate_limit: RATE_LIMIT, // 100 requests/min
}
//fetchCrUXData(requestParam, csvWriterInstance)
const startDate = new Date('2023-04-23T00:00:00.000-04:00')
const endDate = new Date('2023-06-02T00:00:00.000-04:00')
fetchCrUXData(requestParam, csvWriterInstance, startDate, endDate)
