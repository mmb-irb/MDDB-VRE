<template>
  <div v-if="trjType === 'small'">
    <v-alert 
      border="start"
      color="deep-purple-accent-3" 
      icon="mdi-check-circle-outline" 
      variant="tonal"
      elevation="2"
    >
      <span class="font-weight-black">Process finished successfully!</span>
    </v-alert>
  </div>
  <div v-else>
    <v-alert 
      border="start"
      color="deep-purple-accent-3" 
      icon="mdi-check-circle-outline" 
      variant="tonal"
      elevation="2"
    >
      <span><strong>Topology uploaded</strong>, please copy the below code(s) for uploading your trajectory file(s) <strong>from your computer</strong>. Be aware to <strong>replace &lt;FILE&gt;</strong> by the <strong>path</strong> of the trajectory file(s) to upload. The link(s) will <strong>expire</strong> in <strong>one day</strong>.</span>
    </v-alert>
    <v-textarea
      v-for="(c, index) in codes"
      class="my-2"
      append-inner-icon="mdi-content-copy"
      @click:append-inner="copyCode(index)"
      :label="codes[index].file"
      v-model="codes[index].code"
      auto-grow
      readonly
      hide-details="auto"
    ></v-textarea>
  </div>
  <v-snackbar
    v-model="snackbar"
    color="deep-purple-accent-1"
    :timeout="2000"
    elevation="24"
  >
    Code copied to clipboard!
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'

  const { getMetadata } = structureStorage()
  const config = useRuntimeConfig()
  const { $axios } = useNuxtApp()

  const metadata = getMetadata()
  const trjType = metadata.trjType
  const codes = ref([])
  const snackbar = ref(false)

  if (trjType === 'large') {
    let resp = null

    // Manually serialize the query parameters
    const params = new URLSearchParams()
    metadata.trajNames.forEach(file => params.append('files', file))
    params.append('bucket', metadata.bucket)

    $axios
      .get(`${config.public.apiBase}/mc`, { params })
      .then(function (response) {
          resp = response.data
      })
      .catch(err => console.error(err.message))
      .finally( () => {
        codes.value = resp.results
      })
  }

  const copyCode = (index) => {
    navigator.clipboard.writeText(codes.value[index].code)
    snackbar.value = true
  }

</script>

<style scoped>

</style>