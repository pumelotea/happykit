import { AxiosRequestConfig } from 'axios'

const axiosConfig: AxiosRequestConfig = {
  // @ts-ignore
  baseURL: window.appAPI[process.env.VUE_APP_BUILT_MODE].server,
  timeout: 30 * 1000
}

// eslint-disable-next-line no-unused-vars
export const requestInterceptor = (config: any) => {
  config.headers.Authorization = 'token string from local'
  return config
}

// eslint-disable-next-line no-unused-vars
export const requestErrorHandler = (error: any) => {
  return Promise.reject(error)
}

// eslint-disable-next-line no-unused-vars
export const responseInterceptor = (response: any) => {
  return response
}

// eslint-disable-next-line no-unused-vars
export const responseErrorHandler = (error: any) => {
  return Promise.reject(error)
}


export default axiosConfig
