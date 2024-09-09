<template>
  <v-footer class="bg-black">
    <v-container>
      {{ new Date().getFullYear() }}&nbsp;<strong>&copy; <a href="https://mmb.irbbarcelona.org" target="_blank">Molecular Modeling and Bioinformatics Group</a></strong>
    </v-container>
  </v-footer>
</template>


<style scoped>
  a { color: var(--light-text)!important; }
  footer { font-size:13px; height: 60px!important; max-height: 60px; background-color: var(--palette-4)!important;}
</style>