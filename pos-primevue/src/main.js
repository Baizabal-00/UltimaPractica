import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue + tema
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Íconos (pi pi-pencil, pi pi-trash, pi pi-plus...)
import 'primeicons/primeicons.css'
import './style.css'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: false }
  },
  locale: {
    accept: 'Sí',
    reject: 'No'
  }
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
