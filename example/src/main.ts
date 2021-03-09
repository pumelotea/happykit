import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import http from '@/apis'
import {errorHandler,warnHandler} from '@/common/handlers'
import eventBus from '@/common/eventBus'
// 导入框架实例
import happyFramework from '@/framework'
import { createHappySecurity } from '@/lib'

const happySecurity = createHappySecurity()

const app = createApp(App)
app.config.errorHandler = errorHandler
app.config.warnHandler = warnHandler
app.use(router)
app.use(http)
app.use(store)
app.use(eventBus)
// 作为插件安装
app.use(happyFramework)
app.use(happySecurity)
app.mount('#app')

