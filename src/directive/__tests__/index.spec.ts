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
  expect(root.outerHTML).toBe(`<div data-v-app=''><div>content</div></div>`)

  // 清空权限点
  node.pointsMap.clear()
  const app2 = createApp({
    template: `
      <div v-point="'test_key'">content</div>
    `,
  })
  app2.use(framework)
  app2.mount(root)
  expect(root.outerHTML).toBe(`<div data-v-app=''></div>`)

  let a = []
  console.log(a)
})
