import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import NutUI from '@nutui/nutui'
import { Toast } from '@nutui/nutui'
import '@nutui/nutui/dist/style.css'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(NutUI)
app.use(Toast)
app.mount('#app')
