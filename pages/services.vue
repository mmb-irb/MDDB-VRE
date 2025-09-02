<template>
  <v-container>

    <h1>{{ $globals.shortName }} services</h1>

    <v-row> 
      <v-col cols="12" >
        <v-card>
          <template v-slot:title>
            <v-icon size="small" icon="mdi-cloud-print"></v-icon>&nbsp;
            <span class="font-weight-black">List of services for {{ nodeName }} node </span>
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
          </div>
          <div v-else>
          <v-card-text class="py-5" v-if="!error">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">
                    Service
                  </th>
                  <th class="text-left">
                    Version
                  </th>
                  <th class="text-left">
                    Latest Tag
                  </th>
                  <th class="text-left">
                    Update
                  </th>
                  <th class="text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in data"
                  :key="item.service"
                >
                  <td>
                    <v-icon :icon="getServiceIcon(item.service)" color="grey-darken-1" class="me-2"></v-icon>
                    <strong>{{ item.name }}</strong>
                  </td>
                  <td>
                    <v-badge
                      color="purple-accent-3"
                      :content="item.version"
                      inline
                    ></v-badge>
                  </td>
                  <td>
                    <v-badge
                      color="deep-purple-lighten-4"
                      :content="item.latestTag"
                      inline
                    ></v-badge>
                  </td>
                  <td>
                    <v-icon :icon="getUpdate(item.update).icon" :color="getUpdate(item.update).color"></v-icon> {{ getUpdate(item.update).text }}
                  </td>
                  <td>
                    <v-icon :icon="getStatus(item.status).icon" :color="getStatus(item.status).color"></v-icon> {{ getStatus(item.status).text }}
                  </td>
                </tr>
              </tbody>
            </v-table>
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
  const data = ref([])

  data.value.push({
    service: 'db',
    name: 'Database',
    version: 'N/A',
    latestTag: 'N/A',
    update: 'no-repo',
    status: 'checking'
  })

  try {
    // First API call - get services data
    const resp = await fetch('api/services', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const servicesData = await resp.json()
    data.value.push(...servicesData)
    data.value.sort((a, b) => a.name.localeCompare(b.name))
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
        const dbIndex = data.value.findIndex(item => item.service === 'db')
        if (dbIndex !== -1) {
          data.value[dbIndex].status = 'running'
        }
      } else if (rest.status === 500) {
        const dbIndex = data.value.findIndex(item => item.service === 'db')
        if (dbIndex !== -1) {
          data.value[dbIndex].status = 'offline'
        }
      }

    } catch (restError) {
        console.error('REST API error:', restError)
        // Set database status to error if REST call fails
        const dbIndex = data.value.findIndex(item => item.service === 'db')
        if (dbIndex !== -1) {
          data.value[dbIndex].status = 'offline'
        }
        error.value = true
        loading.value = false
    }

  } catch (err) {
      console.error('Services API error:', err)
      error.value = true
      loading.value = false
  }

  const getServiceIcon = (service) => {
    const services = config.public.services
    return services[service]?.icon || 'mdi-cog'
  }

  const getUpdate = (status) => {
    if (status === 'up-to-date') {
      return {
        icon: 'mdi-check-decagram',
        color: 'purple-accent-4',
        text: 'Up to date'
      }
    } else if (status === 'updatable') {
      return {
        icon: 'mdi-arrow-up-bold-circle',
        color: 'purple-lighten-2',
        text: 'Updatable'
      }
    } else if (status === 'ahead') {
      return {
        icon: 'mdi-alert-circle',
        color: 'orange',
        text: 'Ahead'
      }
    } else if (status === 'no-repo') {
      return {
        icon: 'mdi-circle-outline',
        color: 'purple-lighten-4',
        text: 'No repository'
      }
    } else if (status === 'dev') {
      return {
        icon: 'mdi-cog',
        color: 'purple-lighten-3',
        text: 'Development'
      }
    } else {
      return 'Unknown'
    }
  }

  const getStatus = (status) => {
    if (status === 'running') {
      return {
        icon: 'mdi-check-circle',
        color: 'green',
        text: 'Running'
      }
    } else if (status === 'offline') {
      return {
        icon: 'mdi-close-circle',
        color: 'red',
        text: 'Offline'
      }
    } else if (status === 'idle') {
      return {
        icon: 'mdi-circle',
        color: 'grey',
        text: 'Idle'
      }
    } else if (status === 'checking') {
      return {
        icon: 'mdi-autorenew mdi-spin',
        color: 'orange-lighten-1',
        text: 'Checking'
      }
    } else {
      return 'Unknown'
    }
  }

  useHead({
    title: 'Services'
  })

</script>

<style scoped>
  h1 { margin-bottom: 1rem; }
</style>