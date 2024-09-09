<template>
    <v-container>

      <h1>REST API documentation</h1>

      <Breadcrumbs :props="{section:'REST API'}" />

      <v-card rounded="sm">

        <template v-slot:title>
            <v-icon size="small" icon="mdi-code-json"></v-icon> &nbsp;{{ $globals.shortName }} REST API
          </template>

          <template v-slot:text>

            <p id="rest-desc">In this section there is the documentation for all the available public end points of the {{ $globals.shortName }} REST API. Click on each end point and its documentation will be expanded.</p>

            <v-divider></v-divider>

            <div class="swagger" id="swagger"></div>

            <v-btn
              prepend-icon="mdi-tray-arrow-down"
              color="purple-accent-2"
              class="my-5 ms-5"
              @click="downloadSwagger" 
              >
                  Download swagger.json file
            </v-btn>
          </template>

      </v-card>

    </v-container>
  </template>
  
  <script setup>

  const { $globals, $sleep } = useNuxtApp()
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()

  useHead({
    title: `REST API` 
  })

  import SwaggerUI from 'swagger-ui'
  import 'swagger-ui/dist/swagger-ui.css'

  onMounted(async () => {

    const pjson = await import('../package.json')
    const spec = JSON.parse(JSON.stringify(await import('@/assets/settings/swagger.json')))

    spec.servers = [{ url: `${window.location.origin}${nuxtApp.$config.app.baseURL.replace(/\/$/, "")}${config.public.apiBase}` }]
    spec.info.version = pjson.version

    SwaggerUI({
      spec: spec,
      dom_id: '#swagger'
    })

    console.log('Swagger UI loaded')

    // trick for the swagger-ui to load properly
    await $sleep(10)

    // remove title from DOM
    const tit = spec.info.title
    const titDOM = document.querySelector('.swagger-ui .info .title').innerHTML
    document.querySelector('.swagger-ui .info .title').innerHTML = titDOM.replace(tit, '')

    // Schemas initially collapsed
    const schemas = document.querySelectorAll('button.models-control')
    schemas[0].click()

  })

  const downloadSwagger = async() => {
    const swagger = JSON.parse(JSON.stringify(await import('@/assets/settings/swagger.json')))
    const pjson = await import('../package.json')
    swagger.servers = [{ url: `${window.location.origin}${nuxtApp.$config.app.baseURL.replace(/\/$/, "")}${config.public.apiBase}` }]
    swagger.default.info.version = pjson.version
    swagger.default.info.title = `${$globals.shortName} REST API`
    swagger.default.info.description = document.querySelector('#rest-desc').innerHTML
    const blob = new Blob([JSON.stringify(swagger, null, 2)], {type : 'application/json'});

    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'swagger.json';
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();    
    a.remove();
  }

  </script>
  
  <style>
      hgroup.main { min-height: auto!important;}
      .swagger-ui .main { margin-bottom: 0!important; }
      .swagger-ui .info a { color: var(--palette-4); }
      .swagger-ui .info a:hover { color: #f33c28; }
      .swagger-ui .info .title { color:#555; font-size: 30px; }
      .swagger-ui .info { margin: 20px 0 0; }
      .swagger-ui .info .title small.version-stamp { background: var(--swagger-method); }
      .swagger-ui .info .title small { background: var(--palette-4); }
      .swagger-ui .info .description { display:none; }
      .swagger-ui .scheme-container { display:none; }
      .swagger-ui .model-example .model-box { width: 80%; }
      .swagger-ui .model .prop { justify-content: space-between; }
      .swagger-ui .model .prop .markdown p { margin-top:.5rem; }
      .swagger-ui .model-box-control:focus, .swagger-ui .models-control:focus, .swagger-ui .opblock-summary-control:focus { outline:none; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: var(--swagger-method); }
      .swagger-ui .opblock.opblock-get { background: var(--swagger-bg); border-color: var(--palette-4); }
      .swagger-ui .opblock.opblock-get .opblock-summary { border-color: var(--palette-4); }
      .swagger-ui .opblock.opblock-get .tab-header .tab-item.active h4 span:after { background: var(--palette-4); }
      .swagger-ui .btn.execute { background-color: var(--palette-4); border-color: var(--palette-4); }
      .swagger-ui table.model tr.property-row.required td:first-child { padding-top: .5rem!important; }
      .swagger-ui .prop-type { color: var(--palette-4); margin-top: 0.5rem; }
      .swagger-ui .prop-format { margin-top: 0.5rem; }
      .swagger-ui .model .prop { display: flex; }
      .swagger-ui .base-url { font-family: 'Open Sans'!important; font-size:15px!important; margin-bottom: .5rem!important; }
      .swagger-ui .info__license { display:none; }
      .swagger-ui table.model tr.description td { padding-top: .5rem!important; width: auto!important;}
      .swagger-ui table.model tr.description td .markdown p { margin: 0!important;}
      .swagger-ui section.models .model-box { width: 80%; }
      .swagger-ui .model-box { display: inherit;}
      #model-arguments .model-box { display:none; }
  </style>