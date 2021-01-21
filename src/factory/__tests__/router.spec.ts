import { createApp, defineComponent } from 'vue'
import { createHappyFramework } from '../../framework'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createDefaultRouterInterceptor, injectRoutes, upgradeRouter } from '../index'
import { DataLoadResult, HAPPYKIT_INJECT, RouterInterceptorType } from '../../types'

describe('happykit router', () => {
  test('injectRoutes normal', async () => {
    const app = createApp({
      template: '<div></div>',
    })
    const framework = createHappyFramework()

    const singleMenuNode = [
      {
        name: 'child',
        path: '/path',
        icon: 'icon',
        view: '/demo',
        isRouter: true,
        isKeepalive: true,
        type: 'menu',
        children: [],
      },
    ]

    framework.setMenuTree(singleMenuNode)

    const HomeCom = defineComponent({
      template: `<div>HomeCom</div>`,
    })
    const ChildCom = defineComponent({
      template: `<div>ChildCom</div>`,
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: HomeCom,
        },
      ],
    })
    app.use(framework)
    app.use(router)
    await router.isReady()

    const routes = framework.getRouteMappingList().value

    injectRoutes({
      parentRoute: {
        name: 'home',
        path: '/home',
        component: HomeCom,
      },
      router,
      routes,
      viewLoader(view) {
        return ChildCom
      },
    })
    expect(router.getRoutes().length).toBe(3)
    expect(router.getRoutes().some((e) => e.path === '/')).toBeTruthy()
    expect(router.getRoutes().some((e) => e.path === '/path')).toBeTruthy()
    expect(router.getRoutes().some((e) => e.path === '/home')).toBeTruthy()
    expect(
      router.getRoutes().filter((e) => {
        return e.meta._source === HAPPYKIT_INJECT
      }).length,
    ).toBe(2)
  })

  test('injectRoutes error', async () => {
    const app = createApp({
      template: '<div></div>',
    })
    const framework = createHappyFramework()

    const singleMenuNode = [
      {
        name: 'child',
        path: '/path',
        icon: 'icon',
        view: '/demo',
        isRouter: true,
        isKeepalive: true,
        type: 'menu',
        children: [],
      },
    ]

    framework.setMenuTree(singleMenuNode)

    const HomeCom = defineComponent({
      template: `<div>HomeCom</div>`,
    })
    const ChildCom = defineComponent({
      template: `<div>ChildCom</div>`,
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: HomeCom,
        },
      ],
    })
    app.use(framework)
    app.use(router)
    await router.isReady()

    const routes = framework.getRouteMappingList().value
    expect(() => {
      injectRoutes({
        parentRoute: {
          // name: 'home', // name must
          path: '/home',
          component: HomeCom,
        },
        router,
        routes,
        viewLoader() {
          return ChildCom
        },
      })
    }).toThrow('RouterInjectOption:parentRoute name is undefined')

    expect(() => {
      injectRoutes({
        parentRoute: {
          name: 'home',
          path: '/home',
          component: HomeCom,
        },
        // router,
        routes,
        viewLoader() {
          return ChildCom
        },
      })
    }).toThrow('RouterInjectOption:router is undefined')

    injectRoutes({
      parentRoute: {
        name: 'home',
        path: '/home',
        component: HomeCom,
        meta: {
          testKey: 'testValue',
        },
      },
      router,
      routes,
      viewLoader() {
        return ChildCom
      },
    })
    expect(router.getRoutes().length).toBe(3)
    expect(router.getRoutes().some((e) => e.path === '/')).toBeTruthy()
    expect(router.getRoutes().some((e) => e.path === '/path')).toBeTruthy()
    expect(router.getRoutes().some((e) => e.path === '/home')).toBeTruthy()
    expect(
      router.getRoutes().filter((e) => {
        return e.meta._source === HAPPYKIT_INJECT
      }).length,
    ).toBe(2)
  })

  test('upgradeRouter', async () => {
    const root = document.createElement('div')
    const app = createApp({
      template: `<router-view/>`,
    })
    const framework = createHappyFramework()

    const singleMenuNode = [
      {
        name: 'child',
        path: '/path',
        icon: 'icon',
        view: '/demo',
        isRouter: true,
        isKeepalive: true,
        type: 'menu',
        children: [],
      },
    ]

    framework.setMenuTree(singleMenuNode)

    const HomeCom = defineComponent({
      template: `<div>HomeCom</div>`,
    })
    const ChildCom = defineComponent({
      template: `<div>ChildCom</div>`,
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: HomeCom,
        },
      ],
    })

    const hkRouter = upgradeRouter(framework, router)

    app.use(framework)
    app.use(hkRouter)
    await hkRouter.isReady()
    app.mount(root)

    const routes = framework.getRouteMappingList().value

    injectRoutes({
      parentRoute: {
        name: 'home',
        path: '/home',
        component: HomeCom,
      },
      router,
      routes,
      viewLoader() {
        return ChildCom
      },
    })

    localStorage.clear()
    await hkRouter.push('/home', 'CustomTitle')
    expect(localStorage.getItem(localStorage.key(0)!)).toBe('CustomTitle')
    expect(root.outerHTML).toBe('<div data-v-app=""><div>HomeCom</div></div>')

    await router.push('/')
    delete framework.options.pageIdFactory

    localStorage.clear()
    expect(() => {
      hkRouter.push('/home?id=2', 'CustomTitle2')
    }).toThrow('pageIdFactory is undefined')
  })

  test('defaultRouterInterceptor', async () => {
    const HomeCom = defineComponent({
      template: `<div><router-view/></div>`,
    })
    const ChildCom = defineComponent({
      template: `<div>ChildCom</div>`,
    })
    const root = document.createElement('div')

    const app = createApp({
      template: `<router-view/>`,
    })
    const framework = createHappyFramework()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: HomeCom,
        },
      ],
    })
    const beforeEach = createDefaultRouterInterceptor({
      framework,
      interceptorType: RouterInterceptorType.BEFORE,
      dataLoader() {
        return {
          rawData: [
            {
              name: 'child',
              path: '/path',
              icon: 'icon',
              view: '/demo',
              isRouter: true,
              isKeepalive: true,
              type: 'menu',
              children: [],
            },
          ],
        }
      },
      routerInjectOption: {
        parentRoute: {
          name: 'home',
          path: '/home',
          component: HomeCom,
        },
        router,
        routes: [],
        viewLoader() {
          return ChildCom
        },
      },
    })

    router.beforeEach((to: any, from: any, next: any) => {
      beforeEach.filter(to, from, next)
    })
    app.use(framework)
    app.use(router)
    app.mount(root)
    await router.isReady()

    await router.push('/path')
    expect(root.innerHTML).toBe('<div><div>ChildCom</div></div>')

    await router.push('/home')
    expect(root.innerHTML).toBe('<div><!----></div>')
  })

  test('createDefaultRouterInterceptor dataLoader result promise ', async () => {
    const beforeEach = createDefaultRouterInterceptor({
      framework: createHappyFramework(),
      interceptorType: RouterInterceptorType.BEFORE,
      async dataLoader() {
        const res = new Promise((resolve, reject) => {
          resolve([])
        })
        return {
          rawData: await res,
        }
      },
    })
    expect(await beforeEach.options.dataLoader!()).toStrictEqual({
      rawData: [],
    })
  })

  // test('defaultRouterInterceptor next is undefined', async () => {
  //   const HomeCom = defineComponent({
  //     template: `<div><router-view/></div>`,
  //   })
  //   const ChildCom = defineComponent({
  //     template: `<div>ChildCom</div>`,
  //   })
  //   const root = document.createElement('div')
  //
  //   const app = createApp({
  //     template: `<router-view/>`,
  //   })
  //   const framework = createHappyFramework()
  //
  //   const router = createRouter({
  //     history: createMemoryHistory(),
  //     routes: [
  //       {
  //         path: '/',
  //         component: HomeCom,
  //       },
  //     ],
  //   })
  //   const beforeEach = createDefaultRouterInterceptor({
  //     framework,
  //     interceptorType: RouterInterceptorType.BEFORE,
  //     dataLoader() {
  //       return [
  //         {
  //           name: 'child',
  //           path: '/path',
  //           icon: 'icon',
  //           view: '/demo',
  //           isRouter: true,
  //           isKeepalive: true,
  //           type: 'menu',
  //           children: [],
  //         },
  //       ]
  //     },
  //     routerInjectOption: {
  //       parentRoute: {
  //         name: 'home',
  //         path: '/home',
  //         component: HomeCom,
  //       },
  //       router,
  //       routes: [],
  //       viewLoader() {
  //         return ChildCom
  //       },
  //     },
  //   })
  //   router.onError(e=>{
  //     console.log(e)
  //     // expect(e.message).toBe('RouterInterceptor:next is undefined')
  //   })
  //
  //   router.beforeEach(  (to: any, from: any, next: any) => {
  //      // beforeEach.filter(to, from)
  //     return  new Error('asdasdasdasd')
  //   })
  //
  //   app.use(framework)
  //   app.use(router)
  //   app.mount(root)
  //   await router.isReady()
  //
  //   await router.push('/home')
  //
  // })
  //
  // test('defaultRouterInterceptor dataLoader is undefined', async () => {
  //   const HomeCom = defineComponent({
  //     template: `<div><router-view/></div>`,
  //   })
  //   const ChildCom = defineComponent({
  //     template: `<div>ChildCom</div>`,
  //   })
  //   const root = document.createElement('div')
  //
  //   const app = createApp({
  //     template: `<router-view/>`,
  //   })
  //   const framework = createHappyFramework()
  //
  //   const router = createRouter({
  //     history: createMemoryHistory(),
  //     routes: [
  //       {
  //         path: '/',
  //         component: HomeCom,
  //       },
  //     ],
  //   })
  //   const beforeEach = createDefaultRouterInterceptor({
  //     framework,
  //     interceptorType: RouterInterceptorType.BEFORE,
  //     dataLoader() {
  //       return [
  //         {
  //           name: 'child',
  //           path: '/path',
  //           icon: 'icon',
  //           view: '/demo',
  //           isRouter: true,
  //           isKeepalive: true,
  //           type: 'menu',
  //           children: [],
  //         },
  //       ]
  //     },
  //     routerInjectOption: {
  //       parentRoute: {
  //         name: 'home',
  //         path: '/home',
  //         component: HomeCom,
  //       },
  //       router,
  //       routes: [],
  //       viewLoader() {
  //         return ChildCom
  //       },
  //     },
  //   })
  //
  //   router.beforeEach((to: any, from: any, next: any) => {
  //     beforeEach.filter(to, from, next)
  //   })
  //   app.use(framework)
  //   app.use(router)
  //   app.mount(root)
  //   await router.isReady()
  //
  //   await router.push('/path')
  //   expect(root.innerHTML).toBe('<div><div>ChildCom</div></div>')
  //
  //   await router.push('/home')
  //   expect(root.innerHTML).toBe('<div><!----></div>')
  //
  //   // 重置拦截器
  //   // router.beforeEach((to: any, from: any, next: any) => {
  //   //   beforeEach.filter(to, from)
  //   // })
  //   // try {
  //   //   router.push('/path')
  //   // }catch (e){
  //   //   console.warn(e)
  //   // }
  //
  //
  //   // expect(()=>{
  //   //   throw Error('RouterInterceptor:next is undefined1')
  //   // }).toThrow('RouterInterceptor:next is undefined')
  //   // try {
  //   //   await router.push('/path')
  //   // }catch (e) {
  //   //
  //   // }
  //
  //   // router.beforeEach((to: any, from: any, next: any) => {
  //   //    beforeEach.filter(to, from,next)
  //   // })
  //   //
  //   // // 重置初始化标记
  //   // framework.routerInitiated = false
  //   //
  //   // // 强制移除数据加载器
  //   // delete beforeEach.options.dataLoader
  //   // // 再次跳转
  //   // try {
  //   //   await router.push('/path')
  //   // }catch (e) {
  //   //   expect(()=>{
  //   //     throw e
  //   //   }).toThrow('RouterInterceptor:dataLoader is undefined')
  //   // }
  //   //
  //   // // 重置初始化标记
  //   // framework.routerInitiated = false
  //   // // 覆盖数据加载器
  //   // beforeEach.options.dataLoader = () => {
  //   //   return []
  //   // }
  //   // // 再次跳转
  //   // await router.push('/path')
  // })
  //
  // test('defaultRouterInterceptor MenuItem is not found, nav failed', async () => {
  //   const HomeCom = defineComponent({
  //     template: `<div><router-view/></div>`,
  //   })
  //   const ChildCom = defineComponent({
  //     template: `<div>ChildCom</div>`,
  //   })
  //   const root = document.createElement('div')
  //
  //   const app = createApp({
  //     template: `<router-view/>`,
  //   })
  //   const framework = createHappyFramework()
  //
  //   const router = createRouter({
  //     history: createMemoryHistory(),
  //     routes: [
  //       {
  //         path: '/',
  //         component: HomeCom,
  //       },
  //     ],
  //   })
  //   const beforeEach = createDefaultRouterInterceptor({
  //     framework,
  //     interceptorType: RouterInterceptorType.BEFORE,
  //     dataLoader() {
  //       return [
  //         {
  //           name: 'child',
  //           path: '/path',
  //           icon: 'icon',
  //           view: '/demo',
  //           isRouter: true,
  //           isKeepalive: true,
  //           type: 'menu',
  //           children: [],
  //         },
  //       ]
  //     },
  //     routerInjectOption: {
  //       parentRoute: {
  //         name: 'home',
  //         path: '/home',
  //         component: HomeCom,
  //       },
  //       router,
  //       routes: [],
  //       viewLoader() {
  //         return ChildCom
  //       },
  //     },
  //   })
  //
  //   router.beforeEach((to: any, from: any, next: any) => {
  //     beforeEach.filter(to, from, next)
  //   })
  //   app.use(framework)
  //   app.use(router)
  //   app.mount(root)
  //   await router.isReady()
  //
  //   await router.push('/path')
  //   expect(root.innerHTML).toBe('<div><div>ChildCom</div></div>')
  //
  //   await router.push('/home')
  //   expect(root.innerHTML).toBe('<div><!----></div>')
  //
  //   // 重置拦截器
  //   // router.beforeEach((to: any, from: any, next: any) => {
  //   //   beforeEach.filter(to, from)
  //   // })
  //   // try {
  //   //   router.push('/path')
  //   // }catch (e){
  //   //   console.warn(e)
  //   // }
  //
  //
  //   // expect(()=>{
  //   //   throw Error('RouterInterceptor:next is undefined1')
  //   // }).toThrow('RouterInterceptor:next is undefined')
  //   // try {
  //   //   await router.push('/path')
  //   // }catch (e) {
  //   //
  //   // }
  //
  //   // router.beforeEach((to: any, from: any, next: any) => {
  //   //    beforeEach.filter(to, from,next)
  //   // })
  //   //
  //   // // 重置初始化标记
  //   // framework.routerInitiated = false
  //   //
  //   // // 强制移除数据加载器
  //   // delete beforeEach.options.dataLoader
  //   // // 再次跳转
  //   // try {
  //   //   await router.push('/path')
  //   // }catch (e) {
  //   //   expect(()=>{
  //   //     throw e
  //   //   }).toThrow('RouterInterceptor:dataLoader is undefined')
  //   // }
  //   //
  //   // // 重置初始化标记
  //   // framework.routerInitiated = false
  //   // // 覆盖数据加载器
  //   // beforeEach.options.dataLoader = () => {
  //   //   return []
  //   // }
  //   // // 再次跳转
  //   // await router.push('/path')
  // })
})
