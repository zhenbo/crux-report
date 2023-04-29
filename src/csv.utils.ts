import fs from 'fs'
import csv from 'csv-parser'

interface CsvRow {
  url: string
}

function readCsv(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CsvRow) => {
        results.push(data.url)
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error: Error) => {
        reject(error)
      })
  })
}

export default readCsv
