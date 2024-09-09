<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs">
      <template v-slot:divider>
        <v-icon icon="mdi-circle-small"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>
</template>

<script setup>
  
  const { props } = defineProps(['props'])
  const { $breadcrumbs } = useNuxtApp()

  const routePath = useRoute().fullPath.split('/').slice(1)
  let breadcrumbs
  switch (routePath.length) {
    case 1: breadcrumbs =  $breadcrumbs['first-level'](props.section); 
            break;
    case 2: breadcrumbs = $breadcrumbs['second-level'](props.section, props.title, routePath[0])
            break;
  }

</script>

<style scoped>
  
</style>
