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
      <span><strong>Topology uploaded</strong>, please choose your favourite <strong>command line</strong> method for uploading the <strong>trajectory file(s)</strong>.</span>
    </v-alert>

    <div class="text-center pt-5" v-if="loading">
      <v-progress-circular
        color="purple-darken-1"
        indeterminate
      ></v-progress-circular>
    </div>

    <v-expansion-panels class="my-4" variant="inset" v-if="!loading">
      <v-expansion-panel>
        <v-expansion-panel-title collapse-icon="mdi-minus" expand-icon="mdi-plus">
          <div class="container-logo">
            <img src="/img/curl.png" class="img-logo">
          </div>
          <span class="panel-title">curl</span>  
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <panel-c-u-r-l :codes="codes.curl" @copyCode="handleCopyCode" />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title collapse-icon="mdi-minus" expand-icon="mdi-plus">
          <div class="container-logo">
            <img src="/img/minio.png" class="img-logo">
          </div>
          <span class="panel-title">MinIO Client</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <panel-m-c :codes="codes.mc" :bucket="codes.bucket" @copyCode="handleCopyCode" />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title collapse-icon="mdi-minus" expand-icon="mdi-plus">
          <div class="container-logo">
            <img src="/img/aws.png" class="img-logo2">
          </div>
          <span class="panel-title">AWS CLI</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <panel-a-w-s :codes="codes.aws" :bucket="codes.bucket" @copyCode="handleCopyCode" />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title collapse-icon="mdi-minus" expand-icon="mdi-plus">
          <div class="container-logo">
            <img src="/img/rclone.png" class="img-logo">
          </div>
          <span class="panel-title">Rclone</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <panel-rclone :codes="codes.rclone" :bucket="codes.bucket" @copyCode="handleCopyCode" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

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
  const { $globals, $axios } = useNuxtApp()

  const metadata = getMetadata()
  const trjType = metadata.trjType
  const codes = ref([])
  const snackbar = ref(false)
  const loading = ref(true)

  const processResults = (obj, oldUrl, newUrl) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        processResults(obj[key], oldUrl, newUrl);
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(oldUrl, newUrl)
      }
    }
  }

  if (trjType === 'large') {
    let resp = null

    // Manually serialize the query parameters
    const params = new URLSearchParams()
    //metadata.trajNames.forEach(file => params.append('files', file))
    params.append('bucket', metadata.bucket)

    $axios
      .get(`${config.public.apiBase}/mc`, { params })
      .then(function (response) {
          resp = response.data
      })
      .catch(err => console.error(err.message))
      .finally( () => {
        codes.value = processResults(resp.results, /http:\/\/[^:]+:\d{4}/g, config.public.minioURL)
        codes.value = resp.results
        loading.value = false
      })
  }

  const handleCopyCode = (l1, l2) => {
    navigator.clipboard.writeText(codes.value[l1][l2])
    snackbar.value = true
  }

</script>

<style scoped>
  .v-expansion-panel-title.v-expansion-panel-title--active { background-color: #f6f1ff; }
  .container-logo { min-width: 40px; }
  .img-logo { height: 30px; }
  .img-logo2 { margin-top:7px; }
  .panel-title { font-size: 1.1rem; font-weight: 500; }
</style>