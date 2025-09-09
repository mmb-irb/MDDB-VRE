// import colors from 'vuetify/util/colors'

// modify baseURL depending on the server where the app is running
const baseURL = process.env.APP_TYPE == 'development' ? process.env.BASE_URL_DEVELOPMENT : process.env.APP_TYPE == 'staging' ? process.env.BASE_URL_STAGING : process.env.BASE_URL_PRODUCTION

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  router: { 
    options: { strict: true } 
  },

  devtools: { enabled: true },
  //modules: ['@invictus.codes/nuxt-vuetify'],

  build: {
    transpile: ['vuetify']
  },
  vite: {
    define: {
      'process.env.DEBUG': false
    }
  },

  /*vuetify: {
    // vuetify options
    vuetifyOptions: {
      // @TODO: list all vuetify options
      theme: {
        // @ts-ignore
        options: { customProperties: true },
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#ff0000',
              // import colors from vuetify/util/colors in order to use them in css as variables
              'purple-accent-1': colors.purple.accent1,
            }
          },
        },
      },
    },
    moduleOptions: {
      // nuxt-vuetify module options
      // treeshaking: true | false,
      // useIconCDN: true | false,

      // vite-plugin-vuetify options
      // styles: true | 'none' | 'expose' | 'sass' | { configFile: string },
      // autoImport: true | false,
      // useVuetifyLabs: true | false,
    }
  },*/

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
    '~/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.min.css', // Only for webfont option
    'vuetify/lib/styles/main.css'
  ],

  components: [
    { path: '~/components/common', extensions: ['vue'] },
    { path: '~/components/metadata', extensions: ['vue'] },
    { path: '~/components/data', extensions: ['vue'] },
    { path: '~/components/end', extensions: ['vue'] },
    { path: '~/components/services', extensions: ['vue'] }
  ],

  plugins: [
    // define here all plugins in nested folders
  ],

  runtimeConfig: {
    logPath: process.env.LOG_PATH,
    mongodbUri: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=${process.env.DB_NAME}`,
    githubToken: process.env.PAT,
    public: {
      baseURL: baseURL,
      nodeName: process.env.NODE_NAME,
      maxUploadTrjSize: process.env.MAX_FILE_SIZE,
      timeDiff: process.env.TIME_DIFF,
      logoUrl: `${baseURL}img/logo.png`,
      apiBase: `${baseURL}api`,
      domain: process.env.MINIO_URL,
      minioURL: `${process.env.MINIO_PROTOCOL}://${process.env.MINIO_URL}:${process.env.MINIO_PORT}`,
      minioHost: `${process.env.MINIO_URL}:${process.env.MINIO_PORT}`,
      minioUsr: process.env.MINIO_USER,
      services: {
        client: {
          name: "Client",
          icon: "mdi-xml",
          org: "mmb-irb",
          repo: "MDposit-client-build",
          image: "client_image",
          type: "core"
        },
        rest: {
          name: "REST API",
          icon: "mdi-code-block-braces",
          org: "mmb-irb",
          repo: "MDDB-REST-API",
          image: "rest_image",
          type: "core"
        },
        vre_lite: {
          name: "VRElite",
          icon: "mdi-cloud-upload-outline",
          org: "mmb-irb",
          repo: "MDDB-VRE",
          image: "vre_lite_image",
          type: "core"
        },
        loader: {
          name: "Loader",
          icon: "mdi-upload-outline",
          org: "mmb-irb",
          repo: "MDDB-loader",
          image: "loader_image",
          type: "core"
        },
        workflow: {
          name: "Workflow",
          icon: "mdi-cog-outline",
          org: "mmb-irb",
          repo: "MDDB-workflow",
          image: "workflow_image",
          type: "core"
        },
        minio: {
          name: "MinIO",
          icon: "mdi-pail-plus-outline",
          org: "mmb-irb",
          repo: "no-repo",
          image: "minio/minio",
          type: "core"
        },
        db: {
          name: "Database",
          icon: "mdi-database-outline",
          org: undefined,
          repo: undefined,
          image: undefined,
          type: "core"
        },
        optimade: {
          name: "OPTIMADE",
          icon: "mdi-hexagon-outline",
          org: undefined,
          repo: "no-repo",
          image: "optimade_image",
          type: "extension"
        },
        services_monitor: {
          name: "Service Monitor",
          icon: "mdi-incognito",
          org: undefined,
          repo: "no-repo",
          image: "services_monitor_image",
          type: "development"
        }
      },
      apiEndPoints: [
        '/api', 
        '/api/upload',
        '/^\/api/mc(\\?.*)?$/',
        '/api/services',
        '/api/services/rest'
      ]
    }
  },

  compatibilityDate: '2024-09-09',
})