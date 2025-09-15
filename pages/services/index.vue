<template>
  <v-container>

    <h1>{{ $globals.shortName }} services</h1>

    <v-row> 
      <v-col cols="12" >
        <v-card>
          <template v-slot:title>
            <div id="header-container">
              <div>
                <v-icon size="small" icon="mdi-cloud-print"></v-icon>&nbsp;
                <span class="font-weight-black">List of services for {{ nodeName }} node </span>
              </div>
              <v-btn v-if="isDev" prepend-icon="mdi-incognito"
                variant="outlined"
                color="purple-lighten-2"
                :to="`/services/monitor`"
                >Services monitor</v-btn>
            </div>
          </template>

          <div v-if="error && !loading">
            <v-alert
              text="Failed to load services data. Please try again later."
              title="Error loading services"
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
            <div class="text-center mt-4">Fetching services info, please wait...</div>
          </div>
          <div v-else>
          <v-card-text class="pb-5" v-if="!error">
          <ServicesTable 
            :data="data_core" 
            title="Core services" 
            icon="mdi-memory" 
            color="deep-purple-lighten-3" 
            text-color="text-white" 
          />
          <ServicesTable 
            :data="data_extension" 
            title="Extension services" 
            icon="mdi-puzzle" 
            color="deep-purple-lighten-4" 
            text-color="text-white" 
            v-if="data_extension.length > 0"
          />
          <ServicesTable 
            :data="data_development" 
            title="Development services" 
            icon="mdi-cog-clockwise" 
            color="deep-purple-lighten-5" 
            text-color="text-grey-lighten-1" 
            v-if="data_development.length > 0"
          />
          </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>
  
<script setup>
  const { $globals } = useNuxtApp()
  const config = useRuntimeConfig()

  const nodeName = config.public.nodeName

  const loading = ref(true)
  const error = ref(false)
  const data_core = ref([])
  const data_extension = ref([])
  const data_development = ref([])
  const isDev = config.public.hasApiKey

  data_core.value.push({
    service: 'db',
    name: 'Database',
    version: 'N/A',
    latestTag: 'N/A',
    update: 'no-repo',
    type: 'core',
    status: 'checking'
  })

  onMounted(async () => {
    try {
      // First API call - get services data
      const servicesData = await $fetch('/api/services')

      data_core.value.push(...servicesData.filter(s => s.type === 'core'))
      data_core.value.sort((a, b) => a.name.localeCompare(b.name))

      data_extension.value.push(...servicesData.filter(s => s.type === 'extension'))
      data_extension.value.sort((a, b) => a.name.localeCompare(b.name))
      data_extension.value = data_extension.value.filter(item => item.status !== 'not-found')

      data_development.value.push(...servicesData.filter(s => s.type === 'development'))
      data_development.value.sort((a, b) => a.name.localeCompare(b.name))
      data_development.value = data_development.value.filter(item => item.status !== 'not-found')

      loading.value = false

      // Second API call - check REST API status (runs AFTER the first completes)
      try {
        const restResp = await fetch('api/services/rest', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const rest = await restResp.json()

        if (rest.status === 200) {
          const dbIndex = data_core.value.findIndex(item => item.service === 'db')
          if (dbIndex !== -1) {
            data_core.value[dbIndex].status = 'running'
          }
        } else if (rest.status === 500) {
          const dbIndex = data_core.value.findIndex(item => item.service === 'db')
          if (dbIndex !== -1) {
            data_core.value[dbIndex].status = 'offline'
          }
        }

      } catch (restError) {
          console.error('REST API error:', restError)
          // Set database status to error if REST call fails
          const dbIndex = data_core.value.findIndex(item => item.service === 'db')
          if (dbIndex !== -1) {
            data_core.value[dbIndex].status = 'offline'
          }
          error.value = true
          loading.value = false
      }

    } catch (err) {
        console.error('Services API error:', err)
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

  @media only screen and (max-width: 600px) {
    #header-container {
      flex-direction: column;
    }
    #header-container .v-btn {  margin-top: 1rem; }
  }
</style>