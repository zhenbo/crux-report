import axios, { AxiosRequestConfig } from 'axios'
import { createObjectCsvWriter } from 'csv-writer'

const API_KEY = 'AIzaSyC_WmfG1tPj-2AjAY3rqYIx7S4d6KR5Zf0'
const API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'
const CSV_FILE_NAME = './dist/crux-data.csv'
const FORM_FACTOR = 'DESKTOP'

// Set the URLs you want to fetch CrUX data for
const urls: string[] = [
  'https://www.eventbrite.com',
  'https://www.eventbrite.com/signin/signup',
  'https://www.eventbrite.com/d/ca--san-francisco/events/',
  'https://www.eventbrite.com/contact/',
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
const csvHeaders = [{ id: 'url', title: 'URL' }]
cruxMetrics.forEach(metric => {
  csvHeaders.push({ id: metric, title: metric })
})

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

      // Write the data to the CSV file
      const data = [{ url: urls[i] }]
      await csvWriterInstance.writeRecords(data)
      console.log(`Data fetched and written to CSV for URL: ${urls[i]} ${response.data}`)
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
