import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import http from '@/apis'
import {errorHandler,warnHandler} from '@/common/handlers.ts'
import eventBus from '@/common/eventBus'
//导入框架实例
import happyFramework from '@/framework'


const app = createApp(App)
app.config.errorHandler = errorHandler
app.config.warnHandler = warnHandler
app.use(router)
app.use(http)
app.use(store)
app.use(eventBus)
//作为插件安装
//实际引用情况不需要进行as any转换
app.use(happyFramework as any)
app.mount('#app')

