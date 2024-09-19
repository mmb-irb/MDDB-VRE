<template>
  <p v-if="trjType === 'small'">
    <v-alert 
      border="start"
      color="deep-purple-accent-3" 
      icon="mdi-check-circle-outline" 
      variant="tonal"
      elevation="2"
    >
      <span class="font-weight-black">Process finished successfully!</span>
    </v-alert>
  </p>
  <p v-else>
    <v-alert 
      border="start"
      color="deep-purple-accent-3" 
      icon="mdi-check-circle-outline" 
      variant="tonal"
      elevation="2"
    >
      <span class="font-weight-black">Topology uploaded, please copy the following code for finishing the process!!</span>
    </v-alert>
    <v-sheet
      class="mt-4 pa-3"
      :elevation="5"
      border
      color="deep-purple-accent-1" 
      rounded
    >
    TODO N MULTILINE TEXT FIELDS WITH A COPY BUTTON FOR EAHC codes CONTENT
    SEE https://stackoverflow.com/questions/57713402/how-can-i-copy-text-from-vuetifys-v-text-field-to-clipboard
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde, quae perferendis. Ea at voluptates odio autem eaque repellat ipsa sit tempore voluptate necessitatibus aperiam, adipisci omnis ut, impedit vitae neque!
    </v-sheet>
  </p>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { getMetadata } = structureStorage()
  const config = useRuntimeConfig()
  const { $axios } = useNuxtApp()

  const metadata = getMetadata()
  const trjType = metadata.trjType
  const codes = ref([])

  if (trjType === 'large') {
    let resp = null

    // Manually serialize the query parameters
    const params = new URLSearchParams()
    metadata.trajNames.forEach(file => params.append('files', file))

    $axios
      .get(`${config.public.apiBase}/mc`, { params })
      .then(function (response) {
          resp = response.data
      })
      .catch(err => console.error(err.message))
      .finally( () => {

        console.log(resp)

      })
  }

</script>

<style scoped>

</style>