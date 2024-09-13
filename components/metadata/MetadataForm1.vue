<template>
  <v-form
    v-model="form"
  >
    <v-row class="mb-1 mt-1">
      <v-col lg="6" md="6" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-model="fields.name"
          :rules="[rules.required]"
          :label="texts.name.label"
          @update:modelValue="setMetadata('name', fields.name)"
          clearable
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.name.tooltip}" />
          </template>
        </v-text-field>
      </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="pb-0">
        <v-text-field
          v-model="fields.group"
          :rules="[]"
          :label="texts.group.label"
          @update:modelValue="setMetadata('group', fields.group)"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.group.tooltip}" />
          </template>
      </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="py-0">
        <v-textarea 
          v-model="fields.authors"
          :rules="[]"
          :label="texts.authors.label"
          @update:modelValue="setMetadata('authors', fields.authors)"
          rows="2"
          clearable
          no-resize
        >
          <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.authors.tooltip}" />
          </template>
      </v-textarea>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col cols="12" class="py-0">
        <v-textarea 
          v-model="fields.description"
          :rules="[rules.required]"
          :label="texts.description.label"
          @update:modelValue="setMetadata('description', fields.description)"
          clearable
          rows="4"
          no-resize
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.description.tooltip}" />
          </template>
      </v-textarea>
      </v-col>
    </v-row>
    <v-row class="mb-1">
      <v-col lg="6" md="6" sm="12" cols="12" class="py-0">
        <v-text-field
          v-model="fields.program"
          :rules="[rules.required]"
          :label="texts.program.label"
          @update:modelValue="setMetadata('program', fields.program)"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.program.tooltip}" />
          </template>
      </v-text-field>
      </v-col>
      <v-col lg="6" md="6" sm="12" cols="12" class="py-0">
        <v-text-field
          v-model="fields.contact"
          :rules="[rules.required, rules.email]"
          :label="texts.contact.label"
          @update:modelValue="setMetadata('contact', fields.contact)"
          clearable
        >
        <template v-slot:append>
            <form-tooltip :props="{width: 300, text: texts.contact.tooltip}" />
          </template>
      </v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  
  import structureStorage from '@/modules/structure/structureStorage'

  const { setMetadata } = structureStorage()

  const form = ref(false)
  const fields = reactive({
    name: null,
    group: null,
    authors: null,
    description: null,
    program: null,
    contact: null
  })
  const texts = {
    name: {
      label: 'Name *',
      tooltip: 'Name to be shown in the browser and simulation(s) overview. This field is used by the browser to search the simulation(s).',
    },
    group: {
      label: 'Group(s)',
      tooltip: 'Group names to be shown in the simulation(s) overview (e.g. Orozco lab). This field is used by the browser to search the simulation(s).',
    },
    authors: {
      label: 'Author(s)',
      tooltip: 'Author names to be shown in the simulation(s) overview. This field is used by the browser to search the simulation(s).',
    },
    description: {
      label: 'Description *',
      tooltip: 'Description to be shown in the simulation(s) overview. This field is used by the browser to search the simulation(s).',
    },
    program: {
      label: 'Program and version *',
      tooltip: 'Software used to carry your simulation (e.g. Gromacs) and its version (e.g. 2020).',
    },
    contact: {
      label: 'Contact *',
      tooltip: 'An email address for anyone interested in the simulation to reach out.'
    }
  }
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