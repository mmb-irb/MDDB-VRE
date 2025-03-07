<template>
  <v-dialog
    v-model="dialog"
    width="700px"
  >
    <v-card>
      <v-card-title v-html="title"></v-card-title>
      <v-card-text>
        <div id="dialog-content">
          <v-icon id="dialog-icon" :color="color">{{ icon }}</v-icon>
          <p v-html="text" id="dialog-text"></p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="Close"
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

  const emit = defineEmits(['update:modelValue'])

  const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const closeDialog = () => {
    dialog.value = false;
  }

  const title = ref('')
  const text = ref('')
  const icon = ref('')
  const color = ref('')
  const icon_types = {
    info: 'mdi-information-outline',
    warning: 'mdi-alert-outline',
    error: 'mdi-close-circle-outline'
  }
  const icon_colors = {
    info: 'purple-lighten-3',
    warning: 'orange-lighten-4',
    error: 'red-lighten-2'
  }
  const updateContent = (tit, txt, type) => {
    title.value = tit
    text.value = txt
    icon.value = icon_types[type]
    color.value = icon_colors[type]
  }

  defineExpose({
		updateContent
	});

</script>

<style scoped>
  #dialog-content { display: table; }
  #dialog-icon { display: table-cell; vertical-align: middle; font-size: 80px; }
  #dialog-text { display: table-cell; padding-left: 20px; vertical-align: middle; }
</style>
