<template>
  <v-form
    v-model="form"
  >
    <v-row class="mb-1">
      <v-col lg="6" md="6" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-model="fields.name"
          :rules="[rules.required]"
          label="Name"
          clearable
        >
          
        </v-text-field>
      </v-col>
      
    </v-row>
    
  </v-form>
</template>

<script setup>
  
  const form = ref(false)
  const fields = reactive({
    name: null,
  })

  const emit = defineEmits(['endFormMeta']);

  const rules = {
    required: v => !!v || 'This field is required',
    email: v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  }

   // controls "next" button on parent component
   watch(form, (nf, of) => {
    emit('endFormMeta', nf)
  })

</script>

<style scoped>

</style>