<template>
  <v-dialog
    v-model="dialog"
    width="700px"
  >
    <v-card>
      <v-card-title>
        <v-icon>{{ icon }}</v-icon>
        <span v-html="title"></span>
      </v-card-title>
      <v-card-text>
        <slot name="viewer"></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple-accent-4"
          variant="tonal"
          text="Ok"
          @click="saveSelection"
        ></v-btn>
        <v-btn
          text="Close"
          variant="outlined"
          @click="closeDialog"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

  const props = defineProps({
    modelValue: Boolean
  })

  const emit = defineEmits(['update:modelValue', 'saveSelection', 'closeDialog'])

  const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const closeDialog = () => {
    emit('closeDialog')
  }

  const saveSelection = () => {
    emit('saveSelection')
  }

  const title = ref('Molecular selection')
  const icon = ref('mdi-select-color')

</script>

<style scoped>
  #loader-viewer { position: absolute; top: 0; left: 0; background: #dedede; width: 100%; height: 400px; z-index: 1;}
  #viewport { width: 100%; height: 400px; background-color: #dedede; }
</style>
