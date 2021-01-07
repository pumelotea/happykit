import {
  HAPPYKIT_INJECT,
  HAPPYKIT_LOCAL_STORAGE,
  NAV_TITLE,
  HappyKitFramework,
  HappyKitRouter,
  LinkTarget,
  MenuAdapter,
  MenuItem,
  MenuType,
  PageIdFactory,
  RouterInjectOption,
  RouterInterceptor,
  RouterInterceptorOption,
  RouterInterceptorType,
  TrackerIdFactory,
} from '../types'
import { deepClone, uuid } from '../utils'
import { NavigationFailure, RouteLocationRaw, Router } from 'vue-router'

// tslint:disable-next-line:no-var-requires
const md5: any = require('js-md5')

/**
 * 工厂
 * 提供通用方法
 */

/**
 * 创建空的菜单项
 */
export function createEmptyMenuItem(): MenuItem {
  return {
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
    buttonList: [],
    buttonsMap: new Map<string, MenuItem>(),
  }
}

/**
 * 创建默认的菜单数据适配器
 */
export function createDefaultMenuAdapter(): MenuAdapter<MenuItem> {
  return {
    convert(menuTree: any) {
      const routeMappingList: MenuItem[] = []
      const menuIdMappingMap = new Map<string, MenuItem>()
      const menuTreeConverted: MenuItem[] = []

      const menuTypeMap: any = {
        menu: MenuType.MENU,
        button: MenuType.BUTTON,
      }

      const linkTargetMap: any = {
        _tab: LinkTarget.TAB,
        _self: LinkTarget.SELF,
        _blank: LinkTarget.BLANK,
      }

      const forEachTree = (tree: any[], pNode?: MenuItem) => {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tree.length; i++) {
          // 创建新的节点
          const treeNode = createEmptyMenuItem()
          treeNode.menuId = uuid()
          treeNode.name = tree[i].name || ''
          treeNode.path = tree[i].path || ''
          treeNode.icon = tree[i].icon || ''
          treeNode.view = tree[i].view || ''
          treeNode.isRouter = tree[i].isRouter || false
          treeNode.isKeepalive = tree[i].isKeepalive || false
          treeNode.type = menuTypeMap[tree[i].type] || MenuType.MENU
          treeNode.externalLink = tree[i].externalLink || ''
          treeNode.linkTarget = linkTargetMap[tree[i].externalLink] || LinkTarget.TAB
          treeNode.externalLinkAddress = tree[i].externalLinkAddress || ''
          treeNode.hide = tree[i].hide || false
          treeNode.isHome = tree[i].isHome || false
          treeNode.permissionKey = tree[i].permissionKey || ''

          if (!pNode) {
            pNode = createEmptyMenuItem()
            menuTreeConverted.push(pNode)
          }
          pNode.children.push(treeNode)
          // 拼接路由
          treeNode.routerPath = pNode.routerPath + treeNode.path
          // 预先生成菜单节点路径
          const tmpNode = deepClone(treeNode) as MenuItem
          tmpNode.children = []
          tmpNode.menuPath = []
          tmpNode.breadcrumb = []
          treeNode.menuPath = [...pNode.menuPath, tmpNode]
          // breadcrumb
          treeNode.breadcrumb = [...pNode.breadcrumb, tmpNode]

          // 记录id映射表
          menuIdMappingMap.set(treeNode.menuId, treeNode)

          if (treeNode.type === MenuType.MENU) {
            if (!treeNode.isRouter) {
              forEachTree(tree[i].children, treeNode)
            } else {
              // 收集按钮
              tree[i].children.forEach((e: any) => {
                const btnNode = createEmptyMenuItem()
                btnNode.menuId = uuid()
                btnNode.name = e.name || ''
                btnNode.path = e.path || ''
                btnNode.view = e.view || ''
                btnNode.isRouter = e.isRouter || false
                btnNode.isKeepalive = e.isKeepalive || false
                btnNode.type = menuTypeMap[e.type] || MenuType.MENU
                btnNode.externalLink = e.externalLink || ''
                btnNode.linkTarget = linkTargetMap[e.externalLink] || LinkTarget.TAB
                btnNode.externalLinkAddress = e.externalLinkAddress || ''
                btnNode.hide = e.hide || false
                btnNode.isHome = e.isHome || false
                btnNode.permissionKey = e.permissionKey || ''
                treeNode.buttonList.push(btnNode)
                treeNode.buttonsMap.set(btnNode.permissionKey, btnNode)
              })
              if (!treeNode.externalLink || (treeNode.externalLink && treeNode.linkTarget === LinkTarget.TAB)) {
                routeMappingList.push(treeNode)
              }
            }
          }
        }
      }
      forEachTree(menuTree as any[])
      return {
        routeMappingList,
        menuTreeConverted: menuTreeConverted[0].children,
        menuIdMappingMap,
      }
    },
  }
}

/**
 * 创建默认的页面ID生成工厂
 * @param framework 框架上下文
 */
export function createDefaultPageIdFactory(framework: HappyKitFramework): PageIdFactory {
  return {
    framework,
    generate(fullPath: string) {
      return md5(fullPath)
    },
    getNextPageId(to: RouteLocationRaw) {
      const router: Router = this.framework.options.app?.config.globalProperties.$router
      if (!router) {
        throw Error('getNextPageId:router instance is null')
      }
      const route = router.resolve(to)
      return this.generate(route.fullPath)
    },
  }
}

/**
 * 创建默认的追踪Id生成工厂
 * @param framework
 */
export function createDefaultTrackerIdFactory(framework: HappyKitFramework): TrackerIdFactory {
  return {
    framework,
    getId(): string {
      return uuid().replaceAll('-','')
    }
  }
}

/**
 * 动态路由注入
 * @param options
 */
export function injectRoutes(options: RouterInjectOption) {
  const parentName = options.parentRoute.name
  if (!parentName) {
    throw Error('RouterInjectOption:parentRoute name is undefined')
  }

  if (options.parentRoute.meta) {
    options.parentRoute.meta._source = HAPPYKIT_INJECT
  } else {
    options.parentRoute.meta = {
      _source: HAPPYKIT_INJECT,
    }
  }

  if (!options.router) {
    throw Error('RouterInjectOption:router is undefined')
  }

  // 注入父级路由
  options.router!.addRoute(options.parentRoute)

  // 注入子级路由
  options.routes.forEach((e) => {
    const route = {
      path: e.routerPath,
      name: e.name,
      component: options.viewLoader(e.view),
      meta: {
        _source: HAPPYKIT_INJECT,
        isKeepalive: e.isKeepalive,
        menuId: e.menuId,
        externalLinkAddress: e.externalLinkAddress,
      },
    }
    options.router!.addRoute(parentName, route)
  })
}

/**
 * 路由升级
 * vue-router升级为HappyKitRouter
 * @param router
 * @param framework
 */
export function upgradeRouter(framework: HappyKitFramework, router: Router): HappyKitRouter {
  return {
    ...router,
    framework,
    push(to: RouteLocationRaw, title?: string): Promise<NavigationFailure | void | undefined> {
      if (title) {
        const nextPageId = this.framework.options.pageIdFactory?.getNextPageId(to)
        localStorage.setItem(`${HAPPYKIT_LOCAL_STORAGE}/${NAV_TITLE}/${nextPageId}`, title)
      }
      return router.push(to)
    },
  }
}

/**
 * 创建默认的路由拦截器
 * @param options
 */
export function createDefaultRouterInterceptor(options: RouterInterceptorOption): RouterInterceptor {
  if (options.interceptorType === RouterInterceptorType.BEFORE) {
    return {
      options,
      async filter(to, from, next) {
        const framework = this.options.framework
        // console.log(
        //   'RouterInterceptor Before: ',
        //   `${from.path} ---> ${to.path}`
        // )

        if (!next) {
          throw Error('RouterInterceptor:next is undefined')
        }

        // 首次初始化
        if (!framework.routerInitiated) {
          if (!this.options.dataLoader) {
            throw Error('RouterInterceptor:dataLoader is undefined')
          }

          // 请求数据
          const rawData = this.options.dataLoader()
          // 初始化失败
          if (!rawData) {
            this.options.dataLoadFailureHandler?.()
            return
          }
          // 初始化核心数据
          framework.setMenuTree(rawData)
          // 注入路由
          if (this.options.routerInjectOption) {
            this.options.routerInjectOption.router =
              this.options.routerInjectOption.router || framework.options.app?.config.globalProperties.$router
            this.options.routerInjectOption.routes.push(...framework.getRouteMappingList().value)
            injectRoutes(this.options.routerInjectOption)
          }
          // 初始化完成
          framework.routerInitiated = true
          console.log(
            `%c HappyKit %c Core Data Loaded %c`,
            'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
            'background:#20a0ff ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
            'background:transparent',
          )
          // 跳转到目标路由
          // console.log(
          //   framework.options.app?.config.globalProperties.$router.getRoutes()
          // )
          // console.log(await framework.options.app?.config.globalProperties.$router.isReady())

          next(to)
          return
        }

        const menuId = to.meta.menuId

        // 非菜单项直接跳转
        if (!menuId) {
          next()
          return
        }
        const res = framework.getRouteMappingList().value.filter((e) => e.menuId === menuId)
        if (res.length === 0) {
          console.log('RouterInterceptor:MenuItem is not found, nav failed')
          return
        }
        const menuItem = res[0]
        // 菜单项需要
        const navItem = framework.openNav(to, menuItem)
        framework.setCurrentMenuRoute(navItem)
        next()
      },
    }
  } else {
    return {
      options,
      filter(to, from) {
        console.log('RouterInterceptor After: ', `${from.path} ---> ${to.path}`)
      },
    }
  }
}
