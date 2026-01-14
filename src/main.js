import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/style.css'

console.log('🔥 main using router', router)


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(NutUI)
app.mount('#app')
