import { Directive,watch } from 'vue'
import { HappyKitFramework } from '../types'
/**
 * dom级别权限控制指令
 * 默认注册为v-point
 */
const permission: Directive = {
  // beforeMount() {
  //
  // },
  mounted(el,binding) {
    const instance =(binding.instance as any).$happykit as HappyKitFramework
    if (!instance){
      throw Error('HappyKitFramework not register permission directive')
    }
    const current = instance.getCurrentMenuRoute()
    const has = current.value?.menuItem.pointList.some(item=>item.permissionKey === binding.value)
    if (!has){
      el.parentNode.removeChild(el)
    }
  },
  // beforeUpdate() {
  //
  // },
  // updated() {
  //
  // },
  // beforeUnmount() {
  //
  // },
  // unmounted() {
  //
  // },
}
export default permission

