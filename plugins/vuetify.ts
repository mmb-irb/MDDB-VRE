import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Import MDI CSS

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi', // Set MDI as default icon library
    },
    theme: {
      defaultTheme: 'light'
    }
  })

  nuxtApp.vueApp.use(vuetify)
})