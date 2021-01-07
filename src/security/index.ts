import { ref } from 'vue'
import { HappyKitSecurity, User } from '../types'

/**
 * 创建安全框架
 */
export function createHappySecurity(): HappyKitSecurity {
  return {
    user: ref(null),
    token: '',
    getToken() {
      return this.token
    },
    getUser() {
      return this.user
    },
    refreshToken(token: string) {
      this.token = token
    },
    refreshUser(user: User) {
      this.user = user
    },
    signIn(token: string, user: User) {
      this.user.value = user
      this.token = token
    },
    signOut() {
      this.user.value = null
      this.token = ''
    },
  }
}
