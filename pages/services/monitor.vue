<template>
  <v-container>

    <h1>{{ $globals.shortName }} services monitor</h1>

    <v-row> 
      <v-col cols="12" >
        <v-card>
          <template v-slot:title>
            <div id="header-container">
              <div>
                <v-icon size="small" icon="mdi-incognito"></v-icon>&nbsp;
                <span class="font-weight-black">Services monitor </span>
              </div>
            </div>
          </template>

          <div v-if="error && !loading">
            <v-alert
              text="Failed to load services monitor data. Please try again later."
              title="Error loading services monitor"
              class="ma-4"
              type="error"
            ></v-alert>
          </div>
          <div v-if="!error && loading" class="text-center py-8">
            <v-progress-circular
              :width="8"
              :size="75"
              color="purple-lighten-3"
              indeterminate
            ></v-progress-circular>
            <br>
            <div class="text-center mt-4">Fetching services monitor info, please wait...</div>
          </div>
          <div v-else class="pa-4" v-if="!error">
            <v-expansion-panels
              multiple
            >
              <v-expansion-panel
                v-for="item in nodesData.data"
                :key="item.node"
                :value="item.node"
                :readonly="item.success === false"
              >
                <v-expansion-panel-title>
                  <v-icon :icon="item.success ? 'mdi-check-network' : 'mdi-close-network'" :color="item.success ? 'purple-lighten-2' : 'error'"></v-icon>
                    <span class="panel-title ml-2">{{ item.node }} node ({{ new Date(item.timestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }})</span>
                  <template v-slot:actions="{ expanded }">
                    <v-icon :color="item.success ? '' : 'error'" :icon="expanded ? 'mdi-minus' : (item.success ? 'mdi-plus' : 'mdi-alert-circle')"></v-icon>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ServicesTable 
                    :data="item.services_data" 
                    :title="null" 
                    :replicas="true"
                    icon="mdi-server" 
                    color="deep-purple-lighten-3" 
                    text-color="text-white" 
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>
  
<script setup>

  // Apply middleware to this page: if not in development mode, block access
  definePageMeta({
    middleware: async (to, from) => {
      const servicesData = await $fetch('/api/services')
      // Check if 'vre_lite' service version is 'dev'
      const isDev = servicesData.filter(s => s.service === 'vre_lite')[0]?.version === 'dev'
      if (!isDev) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access forbidden'
        })
      }

      // Additionally, verify API key by calling health endpoint
      const apiKey = useRuntimeConfig().public.apiKey
      const checkApiKey = await fetch(`${useRuntimeConfig().public.urlDev}services-monitor/health`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
      }).then(res => res.ok).catch(() => false)
      if (!checkApiKey) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access forbidden'
        })
      }
    }
  })

  const { $globals } = useNuxtApp()
  const config = useRuntimeConfig()

  const urlDev = config.public.urlDev

  const loading = ref(true)
  const error = ref(false)
  let nodesData = ref([])

  onMounted(async () => {
    try {
      // Get nodes data from the services-monitor microservice
      const resp = await fetch(`${urlDev}services-monitor/api/data?latest=true`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      })
      nodesData.value = await resp.json()

      nodesData.value.data.sort((a, b) => a.node.localeCompare(b.node))
      // Filter out services with status 'not-found' from each node's services_data
      nodesData.value.data = nodesData.value.data.map(node => ({
        ...node,
        services_data: node.services_data ? node.services_data.filter(service => service.status !== 'not-found') : []
      }))

      loading.value = false

    } catch (err) {
        console.error('Services monitor API error:', err)
        error.value = true
        loading.value = false
    }
  })

  useHead({
    title: 'Services'
  })

</script>

<style scoped>
  h1 { margin-bottom: 1rem; }
  #header-container {
    display: flex; 
    justify-content: space-between;
  }
  .panel-title { font-size: 1.1rem; font-weight: 600; }

  @media only screen and (max-width: 600px) {
    #header-container {
      flex-direction: column;
    }
    #header-container .v-btn {  margin-top: 1rem; }
  }
</style>