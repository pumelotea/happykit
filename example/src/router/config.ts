import { RouteRecordRaw } from 'vue-router'
import { createDefaultRouterInterceptor,RouterInterceptorType } from '@/lib'

// 导入框架实例
import happyFramework from '@/framework'
// @ts-ignore
import routerData from '@/routerData'

// 创建默认的拦截器
const beforeInterceptor = createDefaultRouterInterceptor({
  interceptorType:RouterInterceptorType.BEFORE,
  framework:happyFramework,
  dataLoader(){
    // 实际开发环境应该从服务端拉取数据
    // 同时应该根据实际的数据结构进行编写对应的适配器
    // 同时应该自行处理好请求失败等情况
    return routerData
  },
  dataLoadFailureHandler(){
    console.log('数据加载失败')
  },
  routerInjectOption:{
    parentRoute: {
      name: 'home',
      path: '/home',
      component: () => import('@/views/home'!)
    },
    routes: [],
    viewLoader(view){
      return ()=>import(`@/views${view}`)
    }
  }
})
const afterInterceptor = createDefaultRouterInterceptor({
  interceptorType:RouterInterceptorType.AFTER,
  framework:happyFramework
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/App.vue'),
    redirect: '/home',
    children: []
  }
]

export const beforeEachHandler = (to: any, from: any, next: any) => {
  // 使用拦截器
  beforeInterceptor.filter(to,from,next)
}

// eslint-disable-next-line no-unused-vars
export const afterEachHandler = (to: any, from: any) => {
  // 使用拦截器
  // afterInterceptor.filter(to,from)
}


export default routes
