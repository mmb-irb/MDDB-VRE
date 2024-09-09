<template>
  <div :id="`container-loader${idx}`" class="d-flex justify-center align-center">
    <v-progress-circular
      :width="8"
      :size="75"
      color="red"
      indeterminate
    ></v-progress-circular>
  </div>
</template>

<script setup>
  
  const { height, idx } = defineProps(['height', 'idx'])

  onMounted(async () => {
    document.querySelector(`#container-loader${idx}`).style.height = height + 'px'
  })

</script>

<style scoped>
  #container-loader {
    width:100%;
    /*height: 200px;*/
  }
</style>