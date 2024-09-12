export default defineNuxtPlugin(() => {
    return {
        provide: {
          globals: {
            shortName: 'MDDB VRE',
            fullName: 'Molecular Dynamics Database Virtual Reality Environment',

            maxUploadTrjSize: 957000000, // 957MB
            maxUploadTrjSizeHumanReadable: '957MB',
        }
      }
    }
})