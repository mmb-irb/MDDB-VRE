// modify baseURL depending on the server where the app is running
const baseURL = process.env.APP_TYPE == 'development' ? process.env.BASE_URL_DEVELOPMENT : process.env.APP_TYPE == 'staging' ? process.env.BASE_URL_STAGING : process.env.BASE_URL_PRODUCTION

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  router: { 
    options: { strict: true } 
  },

  devtools: { enabled: true },
  modules: ['@invictus.codes/nuxt-vuetify'],

  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
      theme: {
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#ff0000'
            }
          },
        },
      },
    },
    moduleOptions: {
      /* nuxt-vuetify module options */
      // treeshaking: true | false,
      // useIconCDN: true | false,

      /* vite-plugin-vuetify options */
      // styles: true | 'none' | 'expose' | 'sass' | { configFile: string },
      // autoImport: true | false,
      // useVuetifyLabs: true | false,
    }
  },

  nitro: {
    //plugins: ['~/server/index.js'],
  },

  app: {  
    baseURL: baseURL,
    head: {
      titleTemplate: '%s - MDDB VRE',
      meta: [ 
        { name: 'description', content: 'This is the MDDB VRE, used for uploading data to an MDDB node' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Open+Sans' },
        { 
          rel: 'icon', 
          type: 'image/x-icon', 
          href: `${baseURL}favicon.ico` 
        },
      ]
    },
  },

  css: [
    '~/assets/css/main.css'
  ],

  components: [
    { path: '~/components/common', extensions: ['vue'] },
    { path: '~/components/metadata', extensions: ['vue'] },
    { path: '~/components/data', extensions: ['vue'] },
    { path: '~/components/end', extensions: ['vue'] }
  ],

  plugins: [
    // define here all plugins in nested folders
  ],

  runtimeConfig: {
    logPath: process.env.LOG_PATH,
    public: {
      baseURL: baseURL,
      nodeName: process.env.NODE_NAME,
      maxUploadTrjSize: process.env.MAX_FILE_SIZE,
      timeDiff: process.env.TIME_DIFF,
      logoUrl: `${baseURL}img/logo.png`,
      apiBase: `${baseURL}api`,
      minioURL: `${process.env.MINIO_PROTOCOL}://${process.env.MINIO_URL}:${process.env.MINIO_PORT}`,
      apiEndPoints: [
        '/api', 
        '/api/upload',
        '/^\/api/mc(\\?.*)?$/'
      ]
    }
  },

  compatibilityDate: '2024-09-09',
})