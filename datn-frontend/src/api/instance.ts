import axios, { AxiosInstance } from 'axios'
import Enviroment from '../utils/checkEnviroment'

class Http {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: Enviroment('api'),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include token
    this.instance.interceptors.request.use(
      (config) => {
        try {
          const persistData = localStorage.getItem('persist:root')
          if (persistData) {
            const parsedData = JSON.parse(persistData)
            if (parsedData.auth && parsedData.auth !== 'undefined') {
              const auth = JSON.parse(parsedData.auth)
              if (auth?.user?.accessToken) {
                config.headers.Authorization = `Bearer ${auth.user.accessToken}`
              }
            }
          }
        } catch (error) {
          console.error('Error adding token to request:', error)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
