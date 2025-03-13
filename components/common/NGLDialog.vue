<template>
  <v-dialog
    v-model="dialog"
  >
    <v-card>
      <v-card-title>
        <v-icon>{{ icon }}</v-icon>
        <span v-html="title"></span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="8">
            <slot name="viewer"></slot>
          </v-col>
          <v-col cols="4">
            <slot name="selection"></slot>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple-accent-4"
          variant="tonal"
          text="Save"
          @click="saveSelection"
        ></v-btn>
        <v-btn
          text="Cancel"
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
</style>
