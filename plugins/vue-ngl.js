import * as NGL from 'ngl'
 
export default defineNuxtPlugin((/*nuxtApp*/) => {
    //console.log(nuxtApp.vueApp)
    //nuxtApp.vueApp.use(NGL)
    //nuxtApp.provide('$NGL', NGL)

    return {
      provide: {
        NGL
      }
    }
  })


