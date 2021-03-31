import { createHappyFramework } from '../index'
import { createApp, defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { injectRoutes, MenuItem, NavItem } from '../../index'

test('createHappyFramework instance', () => {
  const framework = createHappyFramework()
  expect(framework).not.toBe(null)
  expect(framework.getMenuTree()).toEqual(framework.menuTree)
  expect(framework.getRouteMappingList()).toEqual(framework.routeMappingList)
  expect(framework.getCurrentMenuRoute()).toEqual(framework.currentMenuRoute)
  expect(framework.getTracker()).toEqual(framework.tracker)
  expect(framework.getNavList()).toEqual(framework.navigatorList)
})

test('happyFramework not autoRegisterDirective ', () => {
  const app = createApp({})
  const framework = createHappyFramework({
    autoRegisterDirective: false,
  })
  app.use(framework)
  expect(app.directive('point')).toBe(undefined)

  const app2 = createApp({})
  const framework2 = createHappyFramework({
    permissionDirectiveName: '',
  })
  app2.use(framework2)
  expect(app2.directive('point')).not.toBe(null)
})

test('menuAdapter not found', () => {
  const framework = createHappyFramework()
  const raw = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: 'menu',
      children: [],
    },
  ]
  const menuAdapter = framework.options.menuAdapter
  delete framework.options.menuAdapter
  expect(() => {
    framework.setMenuTree(raw)
  }).toThrow('MenuAdapter not found')

  expect(() => {
    framework.setMenuTree(raw, menuAdapter)
  }).not.toThrow()
})

test('refreshClientId', () => {
  const framework = createHappyFramework()
  const clientId = localStorage.getItem('clientId')
  framework.refreshClientId()
  const clientIdChanged = localStorage.getItem('clientId')
  expect(clientId).toBe(clientIdChanged)
})

test('refreshClientId:TrackerIdFactory is undefined', () => {
  const framework = createHappyFramework()
  delete framework.options.trackerIdFactory
  expect(() => {
    framework.refreshClientId()
  }).toThrow('TrackerIdFactory is undefined')
})

test('happyFramework member methods', async () => {
  const app = createApp({})
  const framework = createHappyFramework()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: defineComponent({
          template: `<div><router-view/></div>`,
        }),
      },
    ],
  })
  const raw = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: 'menu',
      children: [],
    },
  ]
  app.use(router)
  app.use(framework)
  framework.setMenuTree(raw)
  injectRoutes({
    router,
    routes: framework.getRouteMappingList().value,
    parentRoute: {
      path: '/home',
      name: 'home',
      component: defineComponent({
        template: `<div><router-view/></div>`,
      }),
    },
    viewLoader() {
      return defineComponent({
        template: `<div></div>`,
      })
    },
  })

  await router.isReady()

  // getBreadcrumb
  expect(framework.getBreadcrumb()).toEqual([])

  // openNav
  const navItem = framework.openNav('/path', framework.getMenuTree().value[0], 'name')

  expect(navItem).toStrictEqual({
    pageId: framework.options.pageIdFactory?.generate(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: {},
        params: {},
      }),
    ),
    title: 'name',
    to: '/path',
    menuItem: framework.getMenuTree().value[0],
  })

  const navItem2 = framework.openNav('/path', framework.getMenuTree().value[0], 'name')
  expect(navItem2).toStrictEqual(navItem)

  const pageIder = framework.options.pageIdFactory
  delete framework.options.pageIdFactory
  const navItem3 = framework.openNav('/path', framework.getMenuTree().value[0], 'name')
  expect(navItem3).toStrictEqual(null)

  framework.options.pageIdFactory = pageIder

  // setCurrentMenuRoute
  framework.setCurrentMenuRoute(navItem)
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem)

  // getBreadcrumb
  expect(framework.getBreadcrumb()).toEqual(framework.getMenuTree().value[0].breadcrumb)
  expect(framework.getBreadcrumb('1')).toEqual([])
  expect(
    framework.getBreadcrumb(
      framework.options.pageIdFactory?.generate(
        JSON.stringify({
          name: 'name',
          path: '/path',
          query: {},
          params: {},
        }),
      ),
    ),
  ).toEqual(framework.getMenuTree().value[0].breadcrumb)

  // getNav
  expect(framework.getNav('1')).toEqual(null)
  expect(
    framework.getNav(
      framework.options.pageIdFactory!.generate(
        JSON.stringify({
          name: 'name',
          path: '/path',
          query: {},
          params: {},
        }),
      ),
    ),
  ).toEqual(framework.getNavList().value[0])

  // isExistNav
  expect(framework.isExistNav('1')).toEqual(false)
  expect(
    framework.isExistNav(
      framework.options.pageIdFactory!.generate(
        JSON.stringify({
          name: 'name',
          path: '/path',
          query: {},
          params: {},
        }),
      ),
    ),
  ).toEqual(true)

  // clickMenuItem
  framework.clickMenuItem(framework.getMenuTree().value[0].menuId)
  expect(framework.currentMenuRoute.value).toStrictEqual(framework.getNavList().value[0])

  // 清空数据
  framework.navigatorList.value = []
  framework.currentMenuRoute.value = null
  framework.clickMenuItem('0')
  expect(framework.currentMenuRoute.value).toStrictEqual(null)

  const done = jest.fn((menuItems: MenuItem[]) => {
    expect(menuItems[0]).toBe(framework.getMenuTree().value[0])
  })

  framework.clickMenuItem(framework.getMenuTree().value[0].menuId, done)
  expect(framework.currentMenuRoute.value).toStrictEqual(framework.getNavList().value[0])
  expect(done).toHaveBeenCalledTimes(1)

  // 临时保存一下菜单打开的导航项
  const navItemFromMenu: NavItem = framework.currentMenuRoute.value!

  // 准备数据
  const navItem4 = framework.openNav('/path?id=4', framework.getMenuTree().value[0], 'name4')!
  const navItem5 = framework.openNav('/path?id=5', framework.getMenuTree().value[0], 'name5')!
  const navItem6 = framework.openNav('/path?id=6', framework.getMenuTree().value[0], 'name6')!
  framework.setCurrentMenuRoute(null)
  const ider = framework.options.pageIdFactory?.generate!

  // clickNavItem
  expect(framework.currentMenuRoute.value).toBe(null)
  framework.clickNavItem(
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '7' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toBe(null)
  framework.clickNavItem(
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '5' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem5)
  framework.clickNavItem(
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '6' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem6)

  const done2 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([navItem4])
    expect(removedNavs).toStrictEqual([])
  })
  framework.clickNavItem(
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done2,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(done2).toHaveBeenCalledTimes(1)

  // closeNav
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4  nav => /path
  const done3 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([navItemFromMenu])
    expect(removedNavs).toStrictEqual([navItem4])
  })
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done3,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItemFromMenu)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  const done31 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([])
    expect(removedNavs).toStrictEqual([navItem5])
  })
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=5
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '5' },
        params: {},
      }),
    ),
    done31,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4, navItem6])
  expect(done31).toHaveBeenCalledTimes(1)

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  const done4 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([])
    expect(removedNavs).toStrictEqual([navItemFromMenu])
  })
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4 left
  framework.closeNav(
    'left',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done4,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItem4, navItem5, navItem6])
  expect(done4).toHaveBeenCalledTimes(1)

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  const done5 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([])
    expect(removedNavs).toStrictEqual([navItem5, navItem6])
  })
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4 right
  framework.closeNav(
    'right',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done5,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4])
  expect(done5).toHaveBeenCalledTimes(1)

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  const done6 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([])
    expect(removedNavs).toStrictEqual([navItemFromMenu, navItem5, navItem6])
  })
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4 other
  framework.closeNav(
    'other',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done6,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItem4])
  expect(done6).toHaveBeenCalledTimes(1)

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  const done7 = jest.fn((removedNavs: NavItem[], needNavs: NavItem[]) => {
    expect(needNavs).toStrictEqual([])
    expect(removedNavs).toStrictEqual([navItemFromMenu, navItem4, navItem5, navItem6])
  })
  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4 all
  framework.closeNav(
    'all',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
    done7,
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([])
  expect(done7).toHaveBeenCalledTimes(1)

  // recover data
  framework.currentMenuRoute.value = navItem4
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]

  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=7 self not found
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '7' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = null
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]

  // current => /path?id=4
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=4  not nav
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '4' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = navItemFromMenu
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  // current => /path
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: {},
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(navItem4)
  expect(framework.navigatorList.value).toStrictEqual([navItem4, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = navItemFromMenu
  framework.navigatorList.value = [navItemFromMenu]
  // current => /path
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: {},
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([])

  // recover data
  framework.currentMenuRoute.value = null
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  // current => /path
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=7
  framework.closeNav(
    'self',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '7' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = null
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  // current => /path
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=7
  framework.closeNav(
    'right',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '7' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4, navItem5, navItem6])

  // recover data
  framework.currentMenuRoute.value = null
  framework.navigatorList.value = [navItemFromMenu, navItem4, navItem5, navItem6]
  // current => /path
  // navList => /path /path?id=4  /path?id=5  /path?id=6
  // close => /path?id=7
  framework.closeNav(
    'other',
    ider(
      JSON.stringify({
        name: 'name',
        path: '/path',
        query: { id: '7' },
        params: {},
      }),
    ),
  )
  expect(framework.currentMenuRoute.value).toStrictEqual(null)
  expect(framework.navigatorList.value).toStrictEqual([navItemFromMenu, navItem4, navItem5, navItem6])
})
