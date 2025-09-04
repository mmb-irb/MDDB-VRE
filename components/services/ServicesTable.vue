<template>
  <v-alert
    :title="title"
    :icon="icon"
    :color="color"
    :class="`${textColor} mt-4`"
  ></v-alert>
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
</template>

<script setup>

  const { data, title, icon, color, textColor } = defineProps(['data', 'title', 'icon', 'color', 'textColor'])

  const config = useRuntimeConfig()

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
</script>

<style scoped>

</style>