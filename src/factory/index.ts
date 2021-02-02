import {
  HAPPYKIT_INJECT,
  HAPPYKIT_STORAGE,
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
    pointList: [],
    pointsMap: new Map<string, MenuItem>(),
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
        point: MenuType.POINT,
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
          treeNode.externalLink = tree[i].externalLink || false
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
              // 收集权限点
              tree[i].children.forEach((e: any) => {
                const pointNode = createEmptyMenuItem()
                pointNode.menuId = uuid()
                pointNode.name = e.name || ''
                pointNode.path = e.path || ''
                pointNode.view = e.view || ''
                pointNode.isRouter = e.isRouter || false
                pointNode.isKeepalive = e.isKeepalive || false
                pointNode.type = menuTypeMap[e.type] || MenuType.POINT
                pointNode.externalLink = e.externalLink || false
                pointNode.linkTarget = linkTargetMap[e.externalLink] || LinkTarget.TAB
                pointNode.externalLinkAddress = e.externalLinkAddress || ''
                pointNode.hide = e.hide || false
                pointNode.isHome = e.isHome || false
                pointNode.permissionKey = e.permissionKey || ''
                treeNode.pointList.push(pointNode)
                treeNode.pointsMap.set(pointNode.permissionKey, pointNode)
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
        menuTreeConverted: menuTreeConverted[0]?.children || [],
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
      return md5(decodeURI(fullPath))
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
      return uuid().replace(/-/g, '')
    },
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
 * 移除路由
 * @param router
 */
export function removeRoutes(router: Router) {
  router.getRoutes().forEach((e) => {
    if (e.name && e.meta._source === HAPPYKIT_INJECT) {
      router.removeRoute(e.name)
    }
  })
}

/**
 * 默认的重置框架方法
 * 并不是销毁框架
 * @param framework
 */
export function resetFramework(framework: HappyKitFramework) {
  framework.navigatorList.value = []
  framework.currentMenuRoute.value = null
  framework.menuTree.value = []
  framework.menuIdMappingMap.value.clear()
  framework.routerInitiated = false
  framework.routeMappingList.value = []
  // 尝试移除路由
  if (framework.options.app?.config.globalProperties.$router) {
    removeRoutes(framework.options.app?.config.globalProperties.$router)
  }
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
        if (!nextPageId) {
          throw Error('pageIdFactory is undefined')
        }
        localStorage.setItem(`${HAPPYKIT_STORAGE}/${NAV_TITLE}/${nextPageId}`, title)
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
          throw new Error('RouterInterceptor:next is undefined')
        }

        // 首次初始化
        if (!framework.routerInitiated) {
          if (!this.options.dataLoader) {
            throw Error('RouterInterceptor:dataLoader is undefined')
          }

          // 请求数据
          const result = await this.options.dataLoader(to, from, next)
          // 初始化失败
          if (!result.rawData) {
            this.options.dataLoadFailureHandler?.(result, to, from, next)
            return
          }
          // 初始化核心数据
          framework.setMenuTree(result.rawData)
          // 注入路由
          if (this.options.routerInjectOption) {
            this.options.routerInjectOption.router =
              this.options.routerInjectOption.router || framework.options.app?.config.globalProperties.$router
            this.options.routerInjectOption.routes.push(...framework.getRouteMappingList().value)
            injectRoutes(this.options.routerInjectOption)
          }
          // 初始化完成
          framework.routerInitiated = true
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
          console.warn('RouterInterceptor:MenuItem is not found, nav failed')
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
        console.warn('RouterInterceptor After: ', `${from.path} ---> ${to.path}`)
      },
    }
  }
}
