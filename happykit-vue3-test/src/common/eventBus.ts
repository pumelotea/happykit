import mitt from 'mitt';
import { App } from 'vue'
const emitter = mitt();
export default {
  install(app: App, options: any) {
    app.config.globalProperties.$bus = emitter
  }
}
