/**
 * 框架接口
 */
import { App, Ref } from 'vue'
import {
  NavigationFailure,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
  RouteRecordRaw,
} from 'vue-router'

export const HAPPYKIT_INJECT = 'HAPPYKIT_INJECT'
export const HAPPYKIT_LOCAL_STORAGE = 'HAPPYKIT_LOCAL_STORAGE'
export const NAV_TITLE = 'NAV_TITLE'

/**
 * 菜单类型
 */
export enum MenuType {
  MENU,
  BUTTON,
}

/**
 * 链接跳转类型
 */
export enum LinkTarget {
  SELF,
  TAB,
  BLANK,
}

/**
 * 导航项关闭类型
 */
export enum NavCloseType {
  SELF,
  LEFT,
  RIGHT,
  OTHER,
  ALL,
}

/**
 * 路由拦截类型
 */
export enum RouterInterceptorType {
  BEFORE,
  AFTER,
}

/**
 * HTTP请求拦截类型
 */
export enum HTTPInterceptorType {
  BEFORE,
  AFTER,
}

/**
 * 菜单数据结构
 */
export declare interface MenuItem {
  /**
   * 必须要有的数据
   */
  // 菜单id-动态生成
  menuId: string
  // 菜单名称
  name: string
  // 菜单图标
  icon: string
  // 菜单相对路径
  path: string
  // 视图组件的路径
  view: string
  // 是否为路由；决定了能不能被点击跳转
  isRouter: boolean
  // 是否页面开启缓存
  isKeepalive: boolean
  // 菜单类型
  type: MenuType
  // 是否为外部链接
  externalLink: boolean
  // 外部链接的跳转方式
  linkTarget: LinkTarget
  // 外部链接的地址
  externalLinkAddress: string
  // 是否为隐藏菜单
  hide: boolean
  // 是否为主页
  isHome: boolean
  // 权限key
  permissionKey: string
  // 子级菜单
  children: MenuItem[]

  /**
   * 预处理后的数据
   * 使用上面的数据经过预处理后的数据
   */
  // 真实的路由路径；会拼接上下层级的相对路径
  routerPath: string
  // 展平后的菜单节点路径
  menuPath: MenuItem[]
  // 面包屑节点数组
  breadcrumb: MenuItem[]
  // 当前节点下可控按钮列表
  buttonList: MenuItem[]
  // 当前节点下可控按钮映射表 按钮标识-按钮节点
  buttonsMap: Map<string, MenuItem>

  // 其他可扩展属性
  [propName: string]: any
}

/**
 * 追踪器数据结构
 */
export declare interface Tracker {
  // 客户端id
  clientId: string
}

/**
 * 导航项数据结构
 */
export declare interface NavItem {
  // 页面id；一定会独立生成，不和菜单id等同
  pageId: string
  // 页面名称；不一定会使用菜单名称，可以是自定义的名称
  title: string
  // 跳转目标
  to: any
  // 对应的菜单节点
  menuItem: MenuItem
}

/**
 * 通用适配器
 */
export declare interface Adapter<T> {
  convert(rawData: any): T[]
}

/**
 * 菜单数据适配器
 */
export declare interface MenuAdapter<T> {
  convert(
    rawData: any,
  ): {
    routeMappingList: T[]
    menuTreeConverted: T[]
    menuIdMappingMap: Map<string, T>
  }
}

/**
 * 导航项相关事件
 */
export declare type HappyKitNavEvent = (removedNavs: NavItem[], needNavs: NavItem[]) => void

/**
 * 菜单项相关事件
 */
export declare type HappyKitMenuEvent = (menuItems: MenuItem[]) => void

/**
 * 当前菜单路由
 */
export declare type CurrentMenuRoute = Ref<NavItem | null>

/**
 * 页面id工厂结构
 */
export declare interface PageIdFactory {
  framework: HappyKitFramework

  generate(uniqueString: string): string

  getNextPageId(to: any): string
}

/**
 * 追踪id工厂结构
 */
export declare interface TrackerIdFactory {
  framework: HappyKitFramework
  getId(): string
}

/**
 * 核心框架选项数据结构
 */
export declare interface HappyKitFrameworkOption {
  app?: App
  menuAdapter?: MenuAdapter<MenuItem>
  pageIdFactory?: PageIdFactory
  trackerIdFactory?:TrackerIdFactory

  [propName: string]: any
}

/**
 * 框架
 */
export declare interface HappyKitFramework {
  /**
   * 初始化属性
   */
  options: HappyKitFrameworkOption
  /**
   * 菜单树
   */
  menuTree: Ref<MenuItem[]>
  /**
   * 导航列表
   */
  navigatorList: Ref<NavItem[]>
  /**
   * 路由列表
   */
  routeMappingList: Ref<MenuItem[]>
  /**
   * 菜单id映射表
   * 提高查找速度
   */
  menuIdMappingMap: Ref<Map<string, MenuItem>>
  /**
   * 当前路由
   */
  currentMenuRoute: CurrentMenuRoute
  /**
   * 路由初始化完成标记
   */
  routerInitiated: boolean
  /**
   * 客户端追踪器
   */
  tracker: Tracker

  /**
   * 初始化器
   * @param options
   */
  init(options?: any): void

  /**
   * 设置菜单树
   * @param rawData 原始数据
   * @param dataAdapter 数据适配器，提供默认的数据适配器
   */
  setMenuTree(rawData: any, dataAdapter?: MenuAdapter<MenuItem>): void

  /**
   * 设置当前的菜单路由
   * @param currentMenuRoute
   */
  setCurrentMenuRoute(currentMenuRoute: NavItem | null): void

  /**
   * 获取菜单树
   */
  getMenuTree(): Ref<MenuItem[]>

  /**
   * 获取路由列表
   */
  getRouteMappingList(): Ref<MenuItem[]>

  /**
   * 获取当前菜单路由
   */
  getCurrentMenuRoute(): CurrentMenuRoute

  /**
   * 获取面包屑
   * @param pageId 如果不传，默认获取当前激活的
   */
  getBreadcrumb(pageId?: string): MenuItem[]

  /**
   * 获取追踪器实例
   */
  getTracker(): Tracker

  /**
   * 初始化追踪器
   */
  initTracker(): void

  /**
   * 刷新客户端id
   */
  refreshClientId(): string

  /**
   * 获取导航列表
   */
  getNavList(): Ref<NavItem[]>

  getNav(pageId: string): NavItem | null

  /**
   * 是否存在该导航项
   * @param pageId
   */
  isExistNav(pageId: string): boolean

  /**
   * 打开新的导航项
   *
   * #case1:
   * 同一个路由，只能打开一个页面
   * #case2:
   * 同一个路由，打开多个页面，不同参数
   *
   * @param to 前往目标
   * @param menuItem
   * @param title 可选的标题
   */
  openNav(to: any, menuItem: MenuItem, title?: string): NavItem | null

  /**
   * 关闭导航项
   * @param type
   * @param pageId
   * @param event
   */
  closeNav(type: NavCloseType, pageId?: string, event?: HappyKitNavEvent): void

  /**
   * 点击导航项
   * @param pageId
   * @param event
   */
  clickNavItem(pageId: string, event?: HappyKitNavEvent): void

  /**
   * 点击菜单项
   * @param menuId
   * @param event
   */
  clickMenuItem(menuId: string, event?: HappyKitMenuEvent): void

  /**
   * vue插件方法
   * @param app
   */
  install(app: App): void
}

/**
 * 路由注入选项
 */
export declare interface RouterInjectOption {
  /**
   * 父级路由
   * 子路由全部注入在该路由下
   */
  parentRoute: RouteRecordRaw
  /**
   * 待注入的路由实例
   */
  router?: Router
  /**
   * 待注入的路由数组
   */
  routes: MenuItem[]

  /**
   * 视图组件加载器
   * @param view
   */
  viewLoader(view: string): any
}

/**
 * 路由拦截器选项
 */
export declare interface RouterInterceptorOption {
  /**
   * 框架实例
   * 作为上下文
   */
  framework: HappyKitFramework
  /**
   * 路由拦截类型
   */
  interceptorType: RouterInterceptorType

  /**
   * 数据加载器
   */
  dataLoader?(): any

  /**
   * 数据加载失败回调
   */
  dataLoadFailureHandler?(): void

  /**
   * 路由注入参数
   * 用于拦截时需要注入的情况
   */
  routerInjectOption?: RouterInjectOption
}

/**
 * 路由拦截器
 */
export declare interface RouterInterceptor {
  /**
   * 路由拦截参数
   */
  options: RouterInterceptorOption

  /**
   * 拦截方法
   * @param to
   * @param from
   * @param next
   */
  filter(to: RouteLocationNormalized, from: RouteLocationNormalized, next?: NavigationGuardNext): void
}

/**
 * vue-router路由子类
 * 扩展一个重载方法
 */
export declare interface HappyKitRouter extends Router {
  framework: HappyKitFramework
  push(to: RouteLocationRaw, title?: string): Promise<NavigationFailure | void | undefined>
}
