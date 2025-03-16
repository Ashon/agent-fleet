import { Connector } from './Connector'

interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  description: string
}

const MOCK_WEATHER_DATA: { [key: string]: WeatherData } = {
  current: {
    temperature: 18,
    humidity: 60,
    precipitation: 0,
    windSpeed: 3,
    description: '맑음',
  },
  today: {
    temperature: 20,
    humidity: 55,
    precipitation: 10,
    windSpeed: 4,
    description: '구름 조금',
  },
  tomorrow: {
    temperature: 22,
    humidity: 65,
    precipitation: 30,
    windSpeed: 5,
    description: '비 소식',
  },
  dayAfterTomorrow: {
    temperature: 19,
    humidity: 70,
    precipitation: 60,
    windSpeed: 6,
    description: '비',
  },
}

export class WeatherConnector implements Connector {
  canHandle(connectorId: string): boolean {
    return connectorId.startsWith('weather-')
  }

  async fetchData(connectorId: string, config: any): Promise<any> {
    const type = config.type || 'current'
    const location = config.location || '서울'

    // 더미 데이터 반환
    const weatherData = MOCK_WEATHER_DATA[type] || MOCK_WEATHER_DATA.current

    return {
      location,
      type,
      data: {
        ...weatherData,
        timestamp: new Date().toISOString(),
        location,
      },
    }
  }
}
