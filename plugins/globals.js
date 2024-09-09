export default defineNuxtPlugin(() => {
    return {
        provide: {
          globals: {
            shortName: 'MDDB VRE'
        }
      }
    }
})