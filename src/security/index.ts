import { App, ref } from 'vue'
import {
  HAPPYKIT_STORAGE,
  HappyKitSecurity,
  HappyKitSecurityOption,
  SECURITY_TOKEN,
  SECURITY_USER,
  User,
} from '../types'

/**
 * 创建安全框架
 */
export function createHappySecurity(options?: HappyKitSecurityOption): HappyKitSecurity {
  const security: HappyKitSecurity = {
    options: {},
    user: ref(null),
    token: '',
    install(app: App) {
      app.config.globalProperties.$security = this
    },
    init(opts?: HappyKitSecurityOption) {
      this.options = opts || {
        storageEngine: 'local_storage',
      }
      this.loadFromStorage()
    },
    getToken() {
      return this.token
    },
    getUser() {
      return this.user
    },
    refreshToken(token: string) {
      this.token = token
      this.saveIntoStorage()
    },
    refreshUser(user: User) {
      this.user.value = user
      this.saveIntoStorage()
    },
    signIn(token: string, user: User) {
      this.user.value = user
      this.token = token
      this.saveIntoStorage()
    },
    signOut() {
      this.user.value = null
      this.token = ''
      this.flushStorage()
    },
    getStorage() {
      switch (this.options.storageEngine) {
        case 'local_storage':
          return localStorage
        case 'session_storage':
          return sessionStorage
        default:
          return localStorage
      }
    },
    loadFromStorage() {
      this.token = this.getStorage().getItem(`${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`) || ''
      const userJSONString = this.getStorage().getItem(`${HAPPYKIT_STORAGE}/${SECURITY_USER}`)
      if (userJSONString) {
        const JSONObject = JSON.parse(userJSONString)
        this.user.value = JSONObject as User
      }
    },
    saveIntoStorage() {
      if (this.token) {
        this.getStorage().setItem(`${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`, this.token)
      }
      if (this.user.value) {
        this.getStorage().setItem(`${HAPPYKIT_STORAGE}/${SECURITY_USER}`, JSON.stringify(this.user.value))
      }
    },
    flushStorage() {
      this.getStorage().removeItem(`${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`)
      this.getStorage().removeItem(`${HAPPYKIT_STORAGE}/${SECURITY_USER}`)
    },
  }
  security.init(options)
  return security
}
