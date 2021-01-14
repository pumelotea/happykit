/**
 * directive test
 */
import { createEmptyMenuItem, createHappyFramework } from '../../index'
import { createApp } from 'vue'

test('v-point directive', () => {
  const root = document.createElement('div')
  const framework = createHappyFramework()
  const node = createEmptyMenuItem()
  const point = createEmptyMenuItem()
  point.permissionKey = 'test_key'
  node.pointsMap.set('test_key', point)
  framework.currentMenuRoute.value = {
    pageId: '',
    title: '',
    to: '',
    menuItem: node,
  }

  const app = createApp({
    template: `
      <div v-point="'test_key'">content</div>
    `,
  })
  app.use(framework)
  app.mount(root)
  expect(root.outerHTML).toBe('<div data-v-app=""><div>content</div></div>')

  // 清空权限点
  node.pointsMap.clear()
  const app2 = createApp({
    template: `
      <div v-point="'test_key'">content</div>
    `,
  })
  app2.use(framework)
  app2.mount(root)
  expect(root.outerHTML).toBe('<div data-v-app=""></div>')

  const app3 = createApp({
    template: `
      <div v-point="'test_key'">content</div>
    `,
  })
  framework.currentMenuRoute.value = null
  app3.use(framework)
  app3.mount(root)
  expect(root.outerHTML).toBe('<div data-v-app=""></div>')
})

test('v-point directive custom name', () => {
  const framework = createHappyFramework({
    permissionDirectiveName: 'point_custom_name',
  })
  const app = createApp({})
  app.use(framework)
  const point = app.directive('point_custom_name')
  expect(point).not.toBe(null)
})

test('framework is not install', () => {
  const root = document.createElement('div')
  const framework = createHappyFramework()
  const app = createApp({
    template: `
      <div v-point="'test_key'">content</div>
    `,
  })
  app.use(framework)
  delete app.config.globalProperties.$happykit
  app.mount(root)
  expect('HappyKitFramework not register permission directive').toHaveBeenWarnedLast()
})
