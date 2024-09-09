<template>
  <v-container>
    <v-row>
      <v-col cols="8" class="mx-auto d-flex align-center justify-center green darken-4">
        <h1 class="display-1 font-weight-bold">{{ error.statusCode }}</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8" class="mx-auto d-flex align-center justify-center">
        <h2>{{ error.message }}</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="mx-auto d-flex align-center justify-center">
        <img src="/img/404.png" alt="error 404" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8" class="mx-auto d-flex align-center justify-center">
        <v-btn
        prepend-icon="mdi-home-import-outline"
        color="purple-accent-2"
        @click="handleClearError" 
        >
          Go Home...
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  const error = useError();

  useHead({
    title: error.value.message
  })

  const handleClearError = () => {
    clearError({ redirect: '/'})
  }
</script>

<style scoped>
  h1 { font-size: 80px; color:var(--palette-1); line-height: 5rem; }
  h2 { color:var(--palette-1); }
  img  { width: 100%; }
</style>
