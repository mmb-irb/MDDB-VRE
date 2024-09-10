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
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.name}" />
          </template>
        </v-text-field>
      </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-model="fields.group"
          :rules="[]"
          label="Group(s)"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.group}" />
          </template>
      </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="py-0">
        <v-textarea 
          v-model="fields.authors"
          :rules="[]"
          label="Author(s)"
          rows="2"
          clearable
          no-resize
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.authors}" />
          </template>
      </v-textarea>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="py-0">
        <v-textarea 
          v-model="fields.description"
          :rules="[rules.required]"
          label="Description"
          clearable
          rows="4"
          no-resize
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.description}" />
          </template>
      </v-textarea>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col lg="6" md="6" sm="12" cols="12" class="py-0">
        <v-text-field
          v-model="fields.program"
          :rules="[rules.required]"
          label="Program and version"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.program}" />
          </template>
      </v-text-field>
      </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="py-0">
        <v-text-field
          v-model="fields.contact"
          :rules="[rules.required, rules.email]"
          label="Contact"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: tooltips.contact}" />
          </template>
      </v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  
  const form = ref(false)
  const fields = reactive({
    name: null,
    group: null,
    authors: null,
    description: null,
    program: null,
    contact: null
  })
  const tooltips = {
    name: 'Name to be shown in the browser and simulation(s) overview. This field is used by the browser to search the simulation(s).',
    group: 'Group names to be shown in the simulation(s) overview (e.g. Orozco lab). This field is used by the browser to search the simulation(s).',
    authors: 'Author names to be shown in the simulation(s) overview. This field is used by the browser to search the simulation(s).',
    description: 'Description to be shown in the simulation(s) overview. This field is used by the browser to search the simulation(s).',
    program: 'Software used to carry your simulation (e.g. Gromacs) and its version (e.g. 2020).',
    contact: 'An email address for anyone interested in the simulation to reach out.'
  }

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