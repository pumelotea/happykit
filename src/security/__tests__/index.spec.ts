/**
 * security test
 */
import { createHappySecurity } from '../index'
import { createApp } from 'vue'
import { HAPPYKIT_STORAGE, SECURITY_TOKEN, SECURITY_USER, StorageEngine } from '../../types'

test('vue install', () => {
  const instance = createHappySecurity()
  const app = createApp({})
  app.use(instance)
  expect(app.config.globalProperties.$security).toEqual(instance)
})

test('default storage engine', () => {
  const instance = createHappySecurity()
  instance.options.storageEngine = undefined
  expect(instance.options.storageEngine).not.toBe(StorageEngine.LOCAL_STORAGE)
  expect(instance.options.storageEngine).toBe(undefined)
  expect(instance.getStorage()).toBe(localStorage)
})

test('json parse error from storage', () => {
  const instance = createHappySecurity()
  const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
  localStorage.setItem(keyUser, 'error')

  expect(() => {
    instance.loadFromStorage()
  }).toThrowError(`Unexpected token e in JSON at position 0`)
})

describe('base on localStorage engine', () => {
  test('createHappySecurity', () => {
    localStorage.clear()
    const instance = createHappySecurity()
    expect(instance.token).toBe('')
    expect(instance.getToken()).toBe('')
    expect(instance.user.value).toBe(null)
    expect(instance.getUser().value).toBe(null)
    expect(instance.options.storageEngine).toBe(StorageEngine.LOCAL_STORAGE)
    expect(instance.getStorage()).toBe(localStorage)
  })

  test('storage operate', () => {
    localStorage.clear()
    const instance = createHappySecurity()
    // 准备数据
    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    localStorage.setItem(keyToken, 'token')
    const user = {
      username: 'username',
      email: 'test@test.com',
    }
    localStorage.setItem(keyUser, JSON.stringify(user))

    // 加载数据
    instance.loadFromStorage()
    expect(instance.token).toBe('token')
    expect(instance.user.value).toStrictEqual(user)

    // 清空数据
    instance.flushStorage()
    expect(localStorage.getItem(keyToken)).toBe(null)
    expect(localStorage.getItem(keyUser)).toBe(null)

    // 持久化数据
    instance.saveIntoStorage()
    expect(localStorage.getItem(keyToken)).toBe('token')
    expect(localStorage.getItem(keyUser)).toBe('{"username":"username","email":"test@test.com"}')
  })

  test('signIn&signOut', () => {
    localStorage.clear()
    const instance = createHappySecurity()
    const user2 = {
      username: 'username2',
      email: 'test@test.com2',
    }
    instance.signIn('token2', user2)
    expect(instance.getToken()).toBe('token2')
    expect(instance.getUser().value).toStrictEqual(user2)

    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    expect(localStorage.getItem(keyToken)).toBe('token2')
    expect(localStorage.getItem(keyUser)).toBe('{"username":"username2","email":"test@test.com2"}')

    instance.signOut()
    expect(instance.getToken()).toBe('')
    expect(instance.getUser().value).toBe(null)
    expect(localStorage.getItem(keyToken)).toBe(null)
    expect(localStorage.getItem(keyUser)).toBe(null)
  })

  test('refreshToken', () => {
    localStorage.clear()
    const instance = createHappySecurity()
    instance.refreshToken('token3')
    expect(instance.getToken()).toBe('token3')

    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    expect(localStorage.getItem(keyToken)).toBe('token3')
  })

  test('refreshUser', () => {
    localStorage.clear()
    const instance = createHappySecurity()
    const user3 = {
      username: 'username3',
      email: 'test@test.com3',
    }
    instance.refreshUser(user3)
    expect(instance.getUser().value).toStrictEqual(user3)

    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    expect(localStorage.getItem(keyUser)).toBe('{"username":"username3","email":"test@test.com3"}')
  })
})

describe('base on sessionStorage engine', () => {
  sessionStorage.clear()
  test('createHappySecurity', () => {
    const instance = createHappySecurity({
      storageEngine: StorageEngine.SESSION_STORAGE,
    })
    expect(instance.token).toBe('')
    expect(instance.getToken()).toBe('')
    expect(instance.user.value).toBe(null)
    expect(instance.getUser().value).toBe(null)
    expect(instance.options.storageEngine).toBe(StorageEngine.SESSION_STORAGE)
    expect(instance.getStorage()).toBe(sessionStorage)
  })

  test('storage operate', () => {
    sessionStorage.clear()
    const instance = createHappySecurity({
      storageEngine: StorageEngine.SESSION_STORAGE,
    })
    // 准备数据
    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    sessionStorage.setItem(keyToken, 'token')
    const user = {
      username: 'username',
      email: 'test@test.com',
    }
    sessionStorage.setItem(keyUser, JSON.stringify(user))

    // 加载数据
    instance.loadFromStorage()
    expect(instance.token).toBe('token')
    expect(instance.user.value).toStrictEqual(user)

    // 清空数据
    instance.flushStorage()
    expect(sessionStorage.getItem(keyToken)).toBe(null)
    expect(sessionStorage.getItem(keyUser)).toBe(null)

    // 持久化数据
    instance.saveIntoStorage()
    expect(sessionStorage.getItem(keyToken)).toBe('token')
    expect(sessionStorage.getItem(keyUser)).toBe('{"username":"username","email":"test@test.com"}')
  })

  test('signIn&signOut', () => {
    sessionStorage.clear()
    const instance = createHappySecurity({
      storageEngine: StorageEngine.SESSION_STORAGE,
    })
    const user2 = {
      username: 'username2',
      email: 'test@test.com2',
    }
    instance.signIn('token2', user2)
    expect(instance.getToken()).toBe('token2')
    expect(instance.getUser().value).toStrictEqual(user2)

    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    expect(sessionStorage.getItem(keyToken)).toBe('token2')
    expect(sessionStorage.getItem(keyUser)).toBe('{"username":"username2","email":"test@test.com2"}')

    instance.signOut()
    expect(instance.getToken()).toBe('')
    expect(instance.getUser().value).toBe(null)
    expect(sessionStorage.getItem(keyToken)).toBe(null)
    expect(sessionStorage.getItem(keyUser)).toBe(null)
  })

  test('refreshToken', () => {
    sessionStorage.clear()
    const instance = createHappySecurity({
      storageEngine: StorageEngine.SESSION_STORAGE,
    })
    instance.refreshToken('token3')
    expect(instance.getToken()).toBe('token3')

    const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
    expect(sessionStorage.getItem(keyToken)).toBe('token3')
  })

  test('refreshUser', () => {
    sessionStorage.clear()
    const instance = createHappySecurity({
      storageEngine: StorageEngine.SESSION_STORAGE,
    })
    const user3 = {
      username: 'username3',
      email: 'test@test.com3',
    }
    instance.refreshUser(user3)
    expect(instance.getUser().value).toStrictEqual(user3)

    const keyUser = `${HAPPYKIT_STORAGE}/${SECURITY_USER}`
    expect(sessionStorage.getItem(keyUser)).toBe('{"username":"username3","email":"test@test.com3"}')
  })
})
