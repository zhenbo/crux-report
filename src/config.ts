import dotenv from 'dotenv'

//load environment variable from .env file
dotenv.config()

type Config = {
  port: number
  apiKey: string
}

const config: Config = {
  port: parseInt(process.env.PORT || '8080'),
  apiKey: process.env.API_KEY as string,
}

export default config
