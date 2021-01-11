import { createHappySecurity } from '../index'
import { HAPPYKIT_STORAGE, SECURITY_TOKEN, SECURITY_USER, StorageEngine } from '../../types'

test('createHappySecurity', () => {
  const instance = createHappySecurity()
  expect(instance.token).toBe('')
  expect(instance.getToken()).toBe('')
  expect(instance.user.value).toBe(null)
  expect(instance.getUser().value).toBe(null)
  expect(instance.options.storageEngine).toBe(StorageEngine.LOCAL_STORAGE)
  expect(instance.getStorage()).toBe(localStorage)
})

test('storage operate', () => {
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
  const instance = createHappySecurity()
  instance.refreshToken('token3')
  expect(instance.getToken()).toBe('token3')

  const keyToken = `${HAPPYKIT_STORAGE}/${SECURITY_TOKEN}`
  expect(localStorage.getItem(keyToken)).toBe('token3')
})

test('refreshUser', () => {
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
