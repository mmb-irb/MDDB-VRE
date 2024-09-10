<template>
  <v-tooltip location="bottom" :max-width="props.width">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" icon="mdi-help-circle-outline"></v-icon>
    </template>
    {{ props.text }}
  </v-tooltip>
</template>

<script setup>

  const { props } = defineProps(['props'])

</script>