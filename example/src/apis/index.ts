import axios from 'axios'
import axiosConfig from '@/apis/config'
import apiDefinition from '@/apis/definition'
import { App } from 'vue'
import {
  requestInterceptor,
  responseInterceptor,
  requestErrorHandler,
  responseErrorHandler
} from '@/apis/config'

//创建http请求客户端
export const httpClient = axios.create(axiosConfig)
httpClient.interceptors.request.use(requestInterceptor, requestErrorHandler)
httpClient.interceptors.response.use(responseInterceptor, responseErrorHandler)


export function $post(url: string, params: any) {
  return new Promise((resolve, reject) => {
    httpClient
      .post(url, params)
      .then(
        res => {
          console.log(res)
          resolve(res.data)
        },
        err => {
          reject(err)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

export function $get(url: string, params: any) {
  return new Promise((resolve, reject) => {
    httpClient
      .get(url, {
        params: params
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function $delete(url: string, params: any) {
  return new Promise((resolve, reject) => {
    httpClient
      .delete(url, { params: params })
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

export function $put(url: string, params: any) {
  return new Promise((resolve, reject) => {
    httpClient
      .put(url, params)
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

const http = {
  // eslint-disable-next-line no-unused-vars
  install(app: App, options: any) {
    app.config.globalProperties.$http = httpClient
    app.config.globalProperties.$api = this
  },
  ...apiDefinition
}

export default http
