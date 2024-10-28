import { VNumberInput } from 'vuetify/labs/VNumberInput'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VNumberInput', VNumberInput)
});