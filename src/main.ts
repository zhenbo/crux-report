import axios, { AxiosRequestConfig } from 'axios'
import { createObjectCsvWriter } from 'csv-writer'
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'
import { CrUXApiResponse, CrUXApiRequestParam, CrUXDataItemFrame } from './main.types'
import { generateCsvRecord } from './main.function'
import config from './config'

const API_KEY = config.apiKey
const API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'
const CSV_FILE_NAME = './dist/crux-data.csv'
const FORM_FACTOR = ['PHONE', 'DESKTOP', 'ALL']
const RATE_LIMIT = 100

// Set the URLs you want to fetch CrUX data for
const URLs: string[] = [
  'https://www.eventbrite.com',
  // 'https://www.eventbrite.com/signin/signup',
  // 'https://www.eventbrite.com/d/online/all-events/',
  // 'https://www.eventbrite.com/l/sell-tickets/',
  // 'https://www.eventbrite.com/o/lava-cantina-the-colony-18690227135',
  // 'https://www.eventbrite.com/c/music-festival-calendar-cwwhpcd/',
  // 'https://www.eventbrite.com/cc/opm-presents-thriving-in-a-hybrid-environment-1849319',
  // 'https://www.eventbrite.com/b/ny--new-york/music/',
]

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
  path: CSV_FILE_NAME,
  header: csvHeaders,
})

// Function to fetch CrUX data and write to CSV
export async function fetchCrUXData(
  requestParam: CrUXApiRequestParam,
  csvWriterInstance: CsvWriter<CrUXDataItemFrame>,
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
        const csvRecords = generateCsvRecord(cruxApiResponse)
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
  urls: URLs,
  rate_limit: RATE_LIMIT, // 100 requests/min
}
fetchCrUXData(requestParam, csvWriterInstance)
