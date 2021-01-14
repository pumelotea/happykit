import {
  createDefaultMenuAdapter,
  createDefaultPageIdFactory,
  createDefaultTrackerIdFactory,
  createEmptyMenuItem,
} from '../index'
import { LinkTarget, MenuItem, MenuType } from '../../types'
import { createHappyFramework } from '../../index'
import { uuid } from '../../utils'
import { createApp, defineComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// remove menuId
const jsonReplacerForTest = (k: string, v: any) => {
  if (v instanceof Map) {
    const obj: any = {}
    v.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  } else {
    if (k === 'menuId') {
      return ''
    }
    return v
  }
}

test('createEmptyMenuItem', () => {
  const menuItem = createEmptyMenuItem()
  expect(menuItem).toEqual({
    menuId: '',
    name: '',
    icon: '',
    path: '',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: MenuType.MENU,
    externalLink: false,
    linkTarget: LinkTarget.TAB,
    externalLinkAddress: '',
    hide: false,
    isHome: false,
    permissionKey: '',
    children: [],
    routerPath: '',
    menuPath: [],
    breadcrumb: [],
    pointList: [],
    pointsMap: new Map<string, MenuItem>(),
  })
})

test('menuAdapter convert singleMenuNode', () => {
  const adapter = createDefaultMenuAdapter()

  // 单节点
  const singleMenuNode = [
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

  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(singleMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: 'name',
      icon: 'icon',
      path: '/path',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: MenuType.MENU,
      externalLink: false,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: '',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [],
      routerPath: '/path',
      menuPath: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]
  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('menuAdapter convert externalLinkAddress singleMenuNode', () => {
  const adapter = createDefaultMenuAdapter()

  // 单节点
  const singleMenuNode = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: true,
      linkTarget: '_tab',
      externalLink: true,
      externalLinkAddress: 'https://happykit.org',
      isKeepalive: true,
      type: 'menu',
      children: [],
    },
  ]

  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(singleMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: 'name',
      icon: 'icon',
      path: '/path',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: MenuType.MENU,
      externalLink: true,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: 'https://happykit.org',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [],
      routerPath: '/path',
      menuPath: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: true,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: 'https://happykit.org',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: true,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: 'https://happykit.org',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]
  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('menuAdapter convert singleMenuNode empty', () => {
  const adapter = createDefaultMenuAdapter()

  // 单节点
  const singleMenuNode = [
    {
      children: [],
    },
  ]
  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(singleMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: '',
      icon: '',
      path: '',
      view: '',
      isRouter: false,
      isKeepalive: false,
      type: MenuType.MENU,
      externalLink: false,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: '',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [],
      routerPath: '',
      menuPath: [
        {
          menuId: '',
          name: '',
          icon: '',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: '',
          icon: '',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]
  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('menuAdapter convert singleMenuNode width points', () => {
  const adapter = createDefaultMenuAdapter()

  // 单节点
  const singleMenuNode = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: 'menu',
      children: [
        {
          name: 'point1',
          permissionKey: 'point1',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: 'point',
          children: [],
        },
        {
          name: 'point2',
          permissionKey: 'point2',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: 'point',
          children: [],
        },
      ],
    },
  ]

  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(singleMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: 'name',
      icon: 'icon',
      path: '/path',
      view: '/demo',
      isRouter: true,
      isKeepalive: true,
      type: MenuType.MENU,
      externalLink: false,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: '',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [],
      routerPath: '/path',
      menuPath: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [
        {
          menuId: '',
          name: 'point1',
          icon: '',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.POINT,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: 'point1',
          children: [],
          routerPath: '',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
        {
          menuId: '',
          name: 'point2',
          icon: '',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.POINT,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: 'point2',
          children: [],
          routerPath: '',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]
  shouldConverted[0].pointsMap.set('point1', {
    menuId: '',
    name: 'point1',
    icon: '',
    path: '',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: MenuType.POINT,
    externalLink: false,
    linkTarget: LinkTarget.TAB,
    externalLinkAddress: '',
    hide: false,
    isHome: false,
    permissionKey: 'point1',
    children: [],
    routerPath: '',
    menuPath: [],
    breadcrumb: [],
    pointList: [],
    pointsMap: new Map<string, MenuItem>(),
  })
  shouldConverted[0].pointsMap.set('point2', {
    menuId: '',
    name: 'point2',
    icon: '',
    path: '',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: MenuType.POINT,
    externalLink: false,
    linkTarget: LinkTarget.TAB,
    externalLinkAddress: '',
    hide: false,
    isHome: false,
    permissionKey: 'point2',
    children: [],
    routerPath: '',
    menuPath: [],
    breadcrumb: [],
    pointList: [],
    pointsMap: new Map<string, MenuItem>(),
  })
  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('menuAdapter convert nestMenuNode', () => {
  const adapter = createDefaultMenuAdapter()

  // 嵌套节点
  const nestMenuNode = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: false,
      isKeepalive: false,
      type: 'menu',
      children: [
        {
          name: 'name1',
          path: '/path1',
          icon: 'icon1',
          view: '/demo1',
          isRouter: true,
          isKeepalive: true,
          type: 'menu',
          children: [],
        },
      ],
    },
  ]

  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(nestMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: 'name',
      icon: 'icon',
      path: '/path',
      view: '/demo',
      isRouter: false,
      isKeepalive: false,
      type: MenuType.MENU,
      externalLink: false,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: '',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [
        {
          menuId: '',
          name: 'name1',
          icon: 'icon1',
          path: '/path1',
          view: '/demo1',
          isRouter: true,
          isKeepalive: true,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path/path1',
          menuPath: [
            {
              menuId: '',
              name: 'name',
              icon: 'icon',
              path: '/path',
              view: '/demo',
              isRouter: false,
              isKeepalive: false,
              type: MenuType.MENU,
              externalLink: false,
              linkTarget: LinkTarget.TAB,
              externalLinkAddress: '',
              hide: false,
              isHome: false,
              permissionKey: '',
              children: [],
              routerPath: '/path',
              menuPath: [],
              breadcrumb: [],
              pointList: [],
              pointsMap: new Map<string, MenuItem>(),
            },
            {
              menuId: '',
              name: 'name1',
              icon: 'icon1',
              path: '/path1',
              view: '/demo1',
              isRouter: true,
              isKeepalive: true,
              type: MenuType.MENU,
              externalLink: false,
              linkTarget: LinkTarget.TAB,
              externalLinkAddress: '',
              hide: false,
              isHome: false,
              permissionKey: '',
              children: [],
              routerPath: '/path/path1',
              menuPath: [],
              breadcrumb: [],
              pointList: [],
              pointsMap: new Map<string, MenuItem>(),
            },
          ],
          breadcrumb: [
            {
              menuId: '',
              name: 'name',
              icon: 'icon',
              path: '/path',
              view: '/demo',
              isRouter: false,
              isKeepalive: false,
              type: MenuType.MENU,
              externalLink: false,
              linkTarget: LinkTarget.TAB,
              externalLinkAddress: '',
              hide: false,
              isHome: false,
              permissionKey: '',
              children: [],
              routerPath: '/path',
              menuPath: [],
              breadcrumb: [],
              pointList: [],
              pointsMap: new Map<string, MenuItem>(),
            },
            {
              menuId: '',
              name: 'name1',
              icon: 'icon1',
              path: '/path1',
              view: '/demo1',
              isRouter: true,
              isKeepalive: true,
              type: MenuType.MENU,
              externalLink: false,
              linkTarget: LinkTarget.TAB,
              externalLinkAddress: '',
              hide: false,
              isHome: false,
              permissionKey: '',
              children: [],
              routerPath: '/path/path1',
              menuPath: [],
              breadcrumb: [],
              pointList: [],
              pointsMap: new Map<string, MenuItem>(),
            },
          ],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      routerPath: '/path',
      menuPath: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]

  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('menuAdapter convert bad point nestMenuNode', () => {
  const adapter = createDefaultMenuAdapter()

  // 嵌套节点 包含不完整的坏节点
  const nestMenuNode = [
    {
      name: 'name',
      path: '/path',
      icon: 'icon',
      view: '/demo',
      isRouter: true,
      isKeepalive: false,
      type: 'menu',
      children: [
        {
          name: '',
          path: '',
          icon: '',
          view: '',
          children: [],
        },
      ],
    },
  ]

  const { routeMappingList, menuTreeConverted, menuIdMappingMap } = adapter.convert(nestMenuNode)

  const shouldConverted: MenuItem[] = [
    {
      menuId: '',
      name: 'name',
      icon: 'icon',
      path: '/path',
      view: '/demo',
      isRouter: true,
      isKeepalive: false,
      type: MenuType.MENU,
      externalLink: false,
      linkTarget: LinkTarget.TAB,
      externalLinkAddress: '',
      hide: false,
      isHome: false,
      permissionKey: '',
      children: [],
      routerPath: '/path',
      menuPath: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      breadcrumb: [
        {
          menuId: '',
          name: 'name',
          icon: 'icon',
          path: '/path',
          view: '/demo',
          isRouter: true,
          isKeepalive: false,
          type: MenuType.MENU,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '/path',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointList: [
        {
          menuId: '',
          name: '',
          icon: '',
          path: '',
          view: '',
          isRouter: false,
          isKeepalive: false,
          type: MenuType.POINT,
          externalLink: false,
          linkTarget: LinkTarget.TAB,
          externalLinkAddress: '',
          hide: false,
          isHome: false,
          permissionKey: '',
          children: [],
          routerPath: '',
          menuPath: [],
          breadcrumb: [],
          pointList: [],
          pointsMap: new Map<string, MenuItem>(),
        },
      ],
      pointsMap: new Map<string, MenuItem>(),
    },
  ]

  shouldConverted[0].pointsMap.set('', {
    menuId: '',
    name: '',
    icon: '',
    path: '',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: MenuType.POINT,
    externalLink: false,
    linkTarget: LinkTarget.TAB,
    externalLinkAddress: '',
    hide: false,
    isHome: false,
    permissionKey: '',
    children: [],
    routerPath: '',
    menuPath: [],
    breadcrumb: [],
    pointList: [],
    pointsMap: new Map<string, MenuItem>(),
  })

  expect(JSON.stringify(menuTreeConverted, jsonReplacerForTest)).toStrictEqual(
    JSON.stringify(shouldConverted, jsonReplacerForTest),
  )
})

test('defaultTrackerIdFactory', () => {
  const defaultTrackerIdFactory = createDefaultTrackerIdFactory(createHappyFramework())
  expect(defaultTrackerIdFactory.getId().length).toBe(uuid().replace(/-/g, '').length)
})

test('defaultPageIdFactory', () => {
  // 准备环境
  // tslint:disable-next-line:no-var-requires
  const md5: any = require('js-md5')
  const app = createApp({})
  const framework = createHappyFramework()
  const Foo = defineComponent({
    template: `<div>foo</div>`,
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: Foo,
      },
      {
        path: '/path',
        component: Foo,
      },
    ],
  })
  const defaultPageIdFactory = createDefaultPageIdFactory(framework)
  const to = { path: '/path', query: { id: 1 } }
  expect(defaultPageIdFactory.generate('/path')).toBe(md5('/path'))

  expect(() => {
    defaultPageIdFactory.getNextPageId(to)
  }).toThrow('getNextPageId:router instance is null')

  app.use(framework)

  expect(() => {
    defaultPageIdFactory.getNextPageId(to)
  }).toThrow('getNextPageId:router instance is null')

  // app.use(router)会触发history无法读取
  app.config.globalProperties.$router = router

  expect(md5(router.resolve(to).fullPath)).toBe(defaultPageIdFactory.getNextPageId(to))
})
