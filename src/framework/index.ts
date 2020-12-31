import { reactive, App } from 'vue'
import { deepClone, uuid } from '../utils'
import {
  HAPPYKIT_LOCAL_STORAGE,
  HappyKitFramework,
  HappyKitFrameworkOption,
  HappyKitMenuEvent,
  HappyKitNavEvent,
  MenuAdapter,
  MenuItem,
  NAV_TITLE,
  NavCloseType,
  NavItem
} from '../types'
import {
  createDefaultMenuAdapter,
  createDefaultPageIdFactory
} from '../factory'

/**
 * 清除缓存中的导航项名称
 * @param list
 */
const clearNavTitleLocalStorage = (list: Array<NavItem>) => {
  list.forEach(e => {
    localStorage.removeItem(`${HAPPYKIT_LOCAL_STORAGE}/${NAV_TITLE}/${e.pageId}`)
  })
}

/**
 * 创建核心框架
 * @param options
 */
export function createHappyFramework(options?: any): HappyKitFramework {
  const frameworkInstance: HappyKitFramework = {
    options: {},
    menuTree: reactive({ value: [] }),
    navigatorList: reactive({ value: [] }),
    routeMappingList: reactive({ value: [] }),
    menuIdMappingMap: reactive({ value: new Map<string, MenuItem>() }),
    currentMenuRoute: reactive({ value: null }),
    routerInitiated: false,
    tracker: {
      clientId: ''
    },
    install(app: App) {
      this.options.app = app
      app.config.globalProperties.$happykit = this
    },
    init(options?: HappyKitFrameworkOption) {
      this.options = options || {
        menuAdapter: createDefaultMenuAdapter(),
        pageIdFactory: createDefaultPageIdFactory(this)
      }
      this.initTracker()
    },
    setMenuTree(rawData: any, dataAdapter?: MenuAdapter<MenuItem>) {
      if (!dataAdapter) {
        dataAdapter = this.options.menuAdapter
      }

      if (!dataAdapter) {
        throw Error('MenuAdapter not found')
      }

      const {
        routeMappingList,
        menuTreeConverted,
        menuIdMappingMap
      } = dataAdapter.convert(rawData)
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
      const menuItems = this.navigatorList.value.filter(e => e.pageId == pageId)
      if (menuItems.length === 0) {
        return []
      }
      return menuItems[0].menuItem.breadcrumb
    },
    getTracker() {
      return this.tracker
    },
    initTracker() {
      const id = localStorage.getItem('clientId')
      this.tracker.clientId = id || this.refreshClientId()
    },
    refreshClientId() {
      const id = uuid()
      this.tracker.clientId = id
      // 持久化
      localStorage.setItem('clientId', id)
      return id
    },
    getNavList() {
      return this.navigatorList
    },
    getNav(pageId: string) {
      const res = this.navigatorList.value.filter(e => e.pageId === pageId)
      return res.length > 0 ? res[0] : null
    },
    isExistNav(pageId: string) {
      return (
        this.navigatorList.value.filter(e => e.pageId === pageId).length > 0
      )
    },
    openNav(to: any, menuItem: MenuItem, title?: string) {
      const nextPageId = this.options.pageIdFactory?.getNextPageId(to)
      if (!nextPageId) {
        return null
      }
      if (this.isExistNav(nextPageId)) {
        return this.getNav(nextPageId)
      }

      //读取缓存中的对应标题
      const cacheTitle = localStorage.getItem(
        `${HAPPYKIT_LOCAL_STORAGE}/${NAV_TITLE}/${nextPageId}`
      )

      const newNav = {
        pageId: nextPageId,
        title: title || cacheTitle || menuItem.name,
        to: to,
        menuItem: menuItem
      }
      this.navigatorList.value.push(newNav)

      //持久化页面对应的标题
      localStorage.setItem(
        `${HAPPYKIT_LOCAL_STORAGE}/${NAV_TITLE}/${newNav.pageId}`,
        newNav.title
      )

      return newNav
    },
    closeNav(type: NavCloseType, pageId?: string, event?: HappyKitNavEvent) {
      switch (type) {
        case NavCloseType.SELF: {
          const pos = this.navigatorList.value.findIndex(
            e => e.pageId === pageId
          )
          if (pos === -1) {
            return
          }
          const res = this.navigatorList.value.splice(pos, 1)
          console.log(res)
          // 如果关闭的是正在激活的路由，需要倒退一个路由
          const needNavs: Array<NavItem> = []
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
          event && event(res, needNavs)
          break
        }
        case NavCloseType.LEFT: {
          const pos = this.navigatorList.value.findIndex(
            e => e.pageId === this.currentMenuRoute.value?.pageId
          )
          if (pos === -1) {
            return
          }
          const res = this.navigatorList.value.splice(0, pos)
          clearNavTitleLocalStorage(res)
          event && event(res, [])
          break
        }
        case NavCloseType.RIGHT: {
          const pos = this.navigatorList.value.findIndex(
            e => e.pageId === this.currentMenuRoute.value?.pageId
          )
          if (pos === -1) {
            return
          }
          const res = this.navigatorList.value.splice(
            pos + 1,
            this.navigatorList.value.length - pos
          )
          clearNavTitleLocalStorage(res)
          event && event(res, [])
          break
        }
        case NavCloseType.ALL: {
          const res = [...this.navigatorList.value]
          this.navigatorList.value = []
          clearNavTitleLocalStorage(res)
          event && event(res, [])
          break
        }
        case NavCloseType.OTHER: {
          const res: Array<NavItem> = []
          let tmp = null
          this.navigatorList.value.forEach(e => {
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
          event && event(res, [])
          break
        }
      }
      if (this.navigatorList.value.length === 0) {
        this.setCurrentMenuRoute(null)
      }
    },
    clickNavItem(pageId: string, event?: HappyKitNavEvent) {
      const res = this.navigatorList.value.filter(e => e.pageId === pageId)
      if (res.length === 0) {
        return
      }
      this.setCurrentMenuRoute(this.getNav(pageId))
      event && event([], res)
    },
    clickMenuItem(menuId: string, event?: HappyKitMenuEvent) {
      const res = this.routeMappingList.value.filter(e => e.menuId === menuId)
      if (res.length === 0) {
        return
      }
      const navItem = this.openNav({ path: res[0].routerPath }, res[0])
      this.setCurrentMenuRoute(navItem)
      event && event(res)
    }
  }
  frameworkInstance.init(options)
  return frameworkInstance
}
