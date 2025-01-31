import {
  CrUXApiRequestParam,
  CrUXApiResponse,
  CrUXDataFrame,
  CrUXDataItemFrame,
  ReportDate,
  Thresholds,
} from './main.types'
import axios, { AxiosRequestConfig } from 'axios'
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'

export function metricsIn(response: CrUXApiResponse): string[] {
  const metrics = Object.keys(response.record.metrics)
  metrics.sort()
  return metrics
}

export function thresholdsByMetric(response: CrUXApiResponse): Thresholds {
  const result: Thresholds = {}
  const metrics = response.record.metrics

  for (const metric in metrics) {
    const data = metrics[metric]
    result[metric] = [data.histogramTimeseries[1].start, data.histogramTimeseries[1].end ?? 0]
  }
  return result
}

export function timestamp(dateObj: ReportDate): Date {
  return new Date(dateObj.year, dateObj.month - 1, dateObj.day)
}

export function shortName(metric: string): string {
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
  const result = new Array<CrUXDataItemFrame>()
  const numberOfRecords = cruxDataFrame.first_date.length
  for (let i = 0; i < numberOfRecords; i++) {
    const cruxDataItem: CrUXDataItemFrame = {
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

export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export function generateCsvRecord(cruxApiResponse: CrUXApiResponse): CrUXDataItemFrame[] {
  const result = new Array<CrUXDataItemFrame>()
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

export function getClosetSundayInPast(d: Date): Date {
  const currentDay = d.getDay() // 0 for Sunday, 1 for Monday, and so on...
  // Calculate the number of days to subtract from the current day to get to the closest Monday
  const daysToSubtract = currentDay % 7
  // Subtract the number of days to get to the closest Sunday
  d.setDate(d.getDate() - daysToSubtract)
  return d
}

export function filterRecordsByDateRange(records: CrUXDataItemFrame[], startDate: Date, endDate: Date) {
  const cutOffFirstDate = startDate.toISOString().slice(0, 10)
  const cutOffLastDate = endDate.toISOString().slice(0, 10)
  const filteredRecords = records.filter(
    record => record.first_date >= cutOffFirstDate && record.first_date <= cutOffLastDate,
  )
  return filteredRecords
}

// Function to fetch CrUX data and write to CSV
export async function fetchCrUXData(
  requestParam: CrUXApiRequestParam,
  csvWriterInstance: CsvWriter<CrUXDataItemFrame>,
  startDate?: Date,
  endDate?: Date,
): Promise<void> {
  // Loop through each URL and fetch CrUX data
  for (let i = 0; i < requestParam.urls.length; i++) {
    for (const form_factor in requestParam.form_factor) {
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
            key: requestParam.api_key,
          },
        }

        // Make the API request
        const response = await axios.post(requestParam.api_url, requestBody, requestConfig)
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
