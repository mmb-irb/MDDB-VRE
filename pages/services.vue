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

          <v-card-text class="py-5">
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
                  <td><strong>{{ item.name }}</strong></td>
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
                  <td><v-icon :icon="getUpdate(item.update).icon" :color="getUpdate(item.update).color"></v-icon> {{ getUpdate(item.update).text }}</td>
                  <td><v-icon :icon="getStatus(item.status).icon" :color="getStatus(item.status).color"></v-icon> {{ getStatus(item.status).text }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>
  
<script setup>

  const { $globals } = useNuxtApp()
  const config = useRuntimeConfig()

  const nodeName = config.public.nodeName

  const data = ref([])
  try {
      const resp = await fetch('api/services', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      })
      data.value = await resp.json()
  } catch (error) {
      console.error(error)
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