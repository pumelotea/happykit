<template>
  <div>
    <p v-for='e in routeMappingList' :key='e.menuId'>
      <a @click='goto(e.menuId)'>{{ e.menuId }} - {{ e.name }} - {{ e.routerPath }}</a>
    </p>
    <p>面包屑</p>
    <span>{{ breadcrumb }}</span>
    <p>当前路由</p>
    <div v-if='currentRouteMenu'>
      【{{ currentRouteMenu.title }}】
    </div>
    <div>
      <button @click="openNav('dash-1111')">open1</button>
      <button @click="openNav('dash-2222')">open2</button>
      <button @click="openNav('dash-3333')">open3</button>
    </div>
    <button @click='closeNav(0)'>关闭全部</button>
    <button @click='closeNav(1)'>关闭左侧</button>
    <button @click='closeNav(2)'>关闭右侧</button>
    <button @click='closeNav(3)'>关闭其他</button>
    <div v-for='e in navList' :key='e.pageId'>
      <button @click='closeNav(4,e.pageId)'>CLOSE</button>
      <a :style="currentRouteMenu?.pageId===e.pageId?'color:red':''" @click='navClick(e.pageId)'>{{ e.title }}</a>
    </div>
    <div>
      user：{{ user }}
    </div>
    <div style='height: 500px;width: 400px;background: antiquewhite'>
      <router-view />
    </div>
  </div>
</template>

<script lang='ts'>

import { computed, getCurrentInstance, watchEffect, watch, reactive, isReactive, isRef, ref, onMounted } from 'vue'
import { HappyKitFramework, NavCloseType, HappyKitRouter, HappyKitSecurity } from '@/lib'
import { Router } from 'vue-router'

export default {
  setup() {
    const self = getCurrentInstance()
    const ctx = (self as any).ctx
    const instance = ctx.$happykit as HappyKitFramework
    const security = ctx.$security as HappyKitSecurity
    security.signIn('token', {
      username: 'username',
      image: 'image',
    })
    const user = security.getUser()

    const menuTree = instance.getMenuTree()
    const routeMappingList = instance.getRouteMappingList()
    const currentRouteMenu = instance.getCurrentMenuRoute()
    const navList = instance.getNavList()

    const breadcrumb = computed(() => {
      return currentRouteMenu.value?.menuItem.breadcrumb.map((e: any) => e.name).join('/')
    })

    const router = ctx.$router as Router

    const goto = (menuId: string) => {
      instance.clickMenuItem(menuId, (menuItems: any) => {
        // console.log('需要跳转1', menuItems)
        router.push(menuItems[0].routerPath)
      })
    }

    const tp: any = ['all', 'left', 'right', 'other', 'self']
    const closeNav = (type: number, pageId?: string) => {
      instance.closeNav(tp[type], pageId, (removedNavs: any, needNavs: any) => {
        console.log('已经移除1', removedNavs)
        console.log('需要跳转3', needNavs)
        // console.log('更新后的NavList', navList.value)
        if (needNavs.length > 0) {
          router.push(needNavs[0].to)
        } else {
          if (navList.value.length === 0) {
            router.push('/')
          }
        }
      })
    }

    const navClick = (pageId: string) => {
      instance.clickNavItem(pageId, (a: any, needNavs: any) => {
        // console.log('需要跳转2', needNavs)
        if (needNavs.length > 0) {
          router.push(needNavs[0].to)
        }
      })
    }

    const openNav = (title: string) => {
      (router as HappyKitRouter).push('/dashboard?id=1&title=' + title, title)
    }

    onMounted(() => {
      setInterval(() => {
        user.value.time = new Date().getTime()
      }, 1000)
    })

    return {
      menuTree,
      navList,
      routeMappingList,
      currentRouteMenu,
      breadcrumb,
      user,
      goto,
      closeNav,
      navClick,
      openNav,
    }
  },
}
</script>
<style>
p {
  margin: 0;
}

a {
  cursor: pointer;
}

a:hover {
  color: blue;
}
</style>
