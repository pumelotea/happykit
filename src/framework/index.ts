import { App, ref } from 'vue'

const raw: number[] = []
export const list = ref(raw)

import {
  HAPPYKIT_STORAGE,
  HappyKitFramework,
  HappyKitFrameworkOption,
  HappyKitMenuEvent,
  HappyKitNavEvent,
  MenuAdapter,
  MenuItem,
  NAV_TITLE,
  NavCloseType,
  NavItem,
} from '../types'
import { createDefaultMenuAdapter, createDefaultPageIdFactory, createDefaultTrackerIdFactory } from '../factory'
import permission from '../directive/permission'

/**
 * 清除缓存中的导航项名称
 * @param navList
 */
const clearNavTitleLocalStorage = (navList: NavItem[]) => {
  navList.forEach((e) => {
    localStorage.removeItem(`${HAPPYKIT_STORAGE}/${NAV_TITLE}/${e.pageId}`)
  })
}

/**
 * 创建核心框架
 * @param options
 */
export function createHappyFramework(options?: HappyKitFrameworkOption): HappyKitFramework {
  const frameworkInstance: HappyKitFramework = {
    options: {},
    menuTree: ref([]),
    navigatorList: ref([]),
    routeMappingList: ref([]),
    menuIdMappingMap: ref(new Map<string, MenuItem>()),
    currentMenuRoute: ref(null),
    routerInitiated: false,
    tracker: {
      clientId: '',
    },
    install(app: App) {
      this.options.app = app
      app.config.globalProperties.$happykit = this
      if (this.options.autoRegisterDirective) {
        this.options.app.directive(this.options.permissionDirectiveName || 'point', permission)
      }
    },
    init(opts?: HappyKitFrameworkOption) {
      this.options.menuAdapter = createDefaultMenuAdapter()
      this.options.pageIdFactory = createDefaultPageIdFactory(this)
      this.options.trackerIdFactory = createDefaultTrackerIdFactory(this)
      this.options.autoRegisterDirective = true
      this.options.permissionDirectiveName = 'point'
      // 自定义属性覆盖
      Object.keys(opts || {}).forEach((key) => {
        this.options[key] = opts![key]
      })
      this.initTracker()
    },
    setMenuTree(rawData: any, dataAdapter?: MenuAdapter<MenuItem>) {
      if (!dataAdapter) {
        dataAdapter = this.options.menuAdapter
      }

      if (!dataAdapter) {
        throw Error('MenuAdapter not found')
      }

      const { routeMappingList, menuTreeConverted, menuIdMappingMap } = dataAdapter.convert(rawData)
      this.menuTree.value = menuTreeConverted
      this.routeMappingList.value = routeMappingList
      this.menuIdMappingMap.value = menuIdMappingMap
    },
    setCurrentMenuRoute(currentMenuRoute: NavItem | null) {
      this.currentMenuRoute.value = currentMenuRoute
    },
    getMenuTree() {
      return this.menuTree
    },
    getRouteMappingList() {
      return this.routeMappingList
    },
    getCurrentMenuRoute() {
      return this.currentMenuRoute
    },
    getBreadcrumb(pageId?: string) {
      // 不传pageId的情况会获取激活的路由所对应的面包屑
      if (!pageId) {
        if (!this.currentMenuRoute.value) {
          return []
        }
        return this.currentMenuRoute.value.menuItem.breadcrumb
      }
      // 正常传递pageId的情况会根据pageId查找对应的菜单的面包屑
      const navItems = this.navigatorList.value.filter((e) => e.pageId === pageId)
      if (navItems.length === 0) {
        return []
      }
      return navItems[0].menuItem.breadcrumb
    },
    getTracker() {
      return this.tracker
    },
    initTracker() {
      const id = localStorage.getItem('clientId')
      this.tracker.clientId = id || this.refreshClientId()
    },
    refreshClientId() {
      if (!this.options.trackerIdFactory) {
        throw Error('TrackerIdFactory is undefined')
      }
      const id = this.options.trackerIdFactory.getId()
      this.tracker.clientId = id
      // 持久化
      localStorage.setItem('clientId', id)
      return id
    },
    getNavList() {
      return this.navigatorList
    },
    getNav(pageId: string) {
      const res = this.navigatorList.value.filter((e) => e.pageId === pageId)
      return res.length > 0 ? res[0] : null
    },
    isExistNav(pageId: string) {
      return this.navigatorList.value.filter((e) => e.pageId === pageId).length > 0
    },
    openNav(to: any, menuItem: MenuItem, title?: string) {
      const nextPageId = this.options.pageIdFactory?.getNextPageId(to)
      if (!nextPageId) {
        return null
      }
      if (this.isExistNav(nextPageId)) {
        return this.getNav(nextPageId)
      }

      // 读取缓存中的对应标题
      const cacheTitle = localStorage.getItem(`${HAPPYKIT_STORAGE}/${NAV_TITLE}/${nextPageId}`)

      const newNav = {
        pageId: nextPageId,
        title: title || cacheTitle || menuItem.name,
        to,
        menuItem,
      }

      this.navigatorList.value.push(newNav)

      // 持久化页面对应的标题
      localStorage.setItem(`${HAPPYKIT_STORAGE}/${NAV_TITLE}/${newNav.pageId}`, newNav.title)

      return newNav
    },
    closeNav(type: NavCloseType, pageId?: string, event?: HappyKitNavEvent) {
      switch (type) {
        case NavCloseType.SELF: {
          // 搜索待关闭的导航项
          const pos = this.navigatorList.value.findIndex((e) => e.pageId === pageId)
          if (pos === -1) {
            return
          }
          // 删除待关闭的导航项
          const res = this.navigatorList.value.splice(pos, 1)
          // 如果关闭的是正在激活的路由，需要倒退一个路由
          const needNavs: NavItem[] = []
          if (pageId === this.currentMenuRoute.value?.pageId) {
            let preIndex = 0
            if (pos > 0) {
              preIndex = pos - 1
            }
            const preNav = this.navigatorList.value[preIndex]
            if (preNav) {
              needNavs.push(preNav)
              this.setCurrentMenuRoute(preNav)
            }
          }
          clearNavTitleLocalStorage(res)
          event?.(res, needNavs)
          break
        }
        case NavCloseType.LEFT: {
          const pos = this.navigatorList.value.findIndex((e) => e.pageId === this.currentMenuRoute.value?.pageId)
          if (pos === -1) {
            return
          }
          const res = this.navigatorList.value.splice(0, pos)
          clearNavTitleLocalStorage(res)
          event?.(res, [])
          break
        }
        case NavCloseType.RIGHT: {
          const pos = this.navigatorList.value.findIndex((e) => e.pageId === this.currentMenuRoute.value?.pageId)
          if (pos === -1) {
            return
          }
          const res = this.navigatorList.value.splice(pos + 1, this.navigatorList.value.length - pos)
          clearNavTitleLocalStorage(res)
          event?.(res, [])
          break
        }
        case NavCloseType.OTHER: {
          const res: NavItem[] = []
          let tmp = null
          this.navigatorList.value.forEach((e) => {
            if (e.pageId !== this.currentMenuRoute.value?.pageId) {
              res.push(e)
            } else {
              tmp = e
            }
          })
          if (tmp) {
            this.navigatorList.value = [tmp as NavItem]
          }
          clearNavTitleLocalStorage(res)
          event?.(res, [])
          break
        }
        case NavCloseType.ALL: {
          const res = [...this.navigatorList.value]
          this.navigatorList.value = []
          clearNavTitleLocalStorage(res)
          event?.(res, [])
          break
        }
      }
      if (this.navigatorList.value.length === 0) {
        this.setCurrentMenuRoute(null)
      }
    },
    clickNavItem(pageId: string, event?: HappyKitNavEvent) {
      const res = this.navigatorList.value.filter((e) => e.pageId === pageId)
      if (res.length === 0) {
        return
      }
      this.setCurrentMenuRoute(this.getNav(pageId))
      event?.([], res)
    },
    clickMenuItem(menuId: string, event?: HappyKitMenuEvent) {
      const res = this.routeMappingList.value.filter((e) => e.menuId === menuId)
      if (res.length === 0) {
        return
      }
      const navItem = this.openNav({ path: res[0].routerPath }, res[0])
      this.setCurrentMenuRoute(navItem)
      event?.(res)
    },
  }
  frameworkInstance.init(options)
  return frameworkInstance
}
