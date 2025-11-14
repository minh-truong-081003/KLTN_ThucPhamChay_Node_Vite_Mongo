import axios, { AxiosInstance } from 'axios'

class Http {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include auth token
    this.instance.interceptors.request.use(
      (config) => {
        // Get token from localStorage (Redux persist)
        const persistRoot = localStorage.getItem('persist:root')
        console.log('🔍 persistRoot:', persistRoot ? 'exists' : 'not found')
        if (persistRoot) {
          try {
            const persistData = JSON.parse(persistRoot)
            console.log('🔍 persistData keys:', Object.keys(persistData))
            // persistData.auth is a JSON string, need to parse again
            if (persistData.auth && persistData.auth !== 'undefined') {
              const authData = JSON.parse(persistData.auth)
              console.log('🔍 authData:', authData)
              const accessToken = authData?.user?.accessToken

              if (accessToken) {
                console.log('✅ Adding token to request:', accessToken.substring(0, 20) + '...')
                config.headers.Authorization = `Bearer ${accessToken}`
              } else {
                console.warn('⚠️ No accessToken found in authData')
              }
            } else {
              console.warn('⚠️ No auth data in persistData')
            }
          } catch (error) {
            console.error('❌ Error parsing auth token:', error)
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.error('Unauthorized access - token may be invalid')
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
