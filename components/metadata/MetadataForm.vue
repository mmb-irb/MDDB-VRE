<template>
  <v-form
    v-model="form"
  >
    <v-row class="mb-1 mt-1">
      <v-col v-for="(item, index) in fields" :key="index" :lg="item.cols" :md="item.cols" sm="12" cols="12" class="pb-0">

        <input-field v-if="item.type === 'input'" :props="item" />
        <number-field v-if="item.type === 'number'" :props="item" />
        <text-area-field v-if="item.type === 'textarea'" :props="item" />
        <rich-text-area-field v-if="item.type === 'rich-textarea'" :props="item" />
        <select-field v-if="item.type === 'select'" :props="item" />
        <multiple-input-field v-if="item.type === 'multiple-input'" :props="item" />
        <multiple-multi-input-field v-if="item.type === 'multiple-multi-input'" :props="item" />
        <select-input v-if="item.type === 'select-input'" :props="item" />
        <ligands v-if="item.type === 'ligands'" :props="item" />
        <interactions v-if="item.type === 'interactions'" :props="item" />
        <hidden-field v-if="item.type === 'hidden'" :props="item" />

      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  
  const { fields } = defineProps(['fields'])

  const form = ref(false)

  const emit = defineEmits(['endFormMeta']);

   // controls "next" button on parent component
   watch(form, (nf, of) => {
    //console.log(nf)
    emit('endFormMeta', nf)
  })

</script>

<style scoped>

</style>