<template>
  <p style="color:#777;">{{ props.description }}</p>
  <v-row class="mb-0">
    <v-col v-for="(input, index) in refInputs" :key="index" :lg="props.subCols" :md="props.subCols" sm="12" cols="12" class="pb-0">
      <v-text-field
        v-model="refInputs[index]"
        :rules="rules"
        :label="`${props.label} ${required ? '*' : ''}`"
        :prepend-inner-icon="setViewIcon(refInputs[index])"
        :append-inner-icon="index > 0 ? 'mdi-delete-outline' : ''"
        @click:append-inner="removeInput(index)"
        @click:prepend-inner="setViewIconLink(refInputs[index])"
        @update:modelValue="setMetadata(props.id, refInputs)"
        clearable
      >
        <template v-slot:append>
          <v-icon :color="!nfEnabled ? 'grey-lighten-1' : ''" @click="createNewInput()" v-if="index === refInputs.length - 1">mdi-plus-circle-outline</v-icon>
        </template>
      </v-text-field>
    </v-col>
  </v-row>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata } = structureStorage()
  const { getRules, checkAllValuesAgainstRules } = useRules()

  const { props } = defineProps(['props'])
  const refInputs = ref([''])
  const required = ref(props.required)
  const rules = ref(props.rules ? getRules(props.rules) : [])

  // computed property to check if all values are non-empty and fulfill the rules
  const nfEnabled = computed(() => allValuesNonEmpty(refInputs.value) && checkAllValuesAgainstRules(refInputs.value, rules.value) === true)

  // computed property to display the selected PDBs
  const pdbs = computed(() => {
    const vals = refInputs.value
      .filter(val => /^[0-9][A-Za-z0-9]{3}$/.test(val))
      .map(val => ({[val]: `https://www.rcsb.org/structure/${val}`}))
    return vals
  })

  // computed property to display the selected UniProts
  const uniprots = computed(() => {
    const regex = /(?:[A-Za-z]: ?)?([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})/
    const vals = refInputs.value
      .map(val => {
        if (val === null) return []
        const match = val.match(regex)
        return match ? match[1] : null
      })
      .filter(val => val !== null)
      .map(val => ({[val]: `https://www.uniprot.org/uniprotkb/${val}/entry`}))
    return vals
  });

  // computed property to display the selected ligands
  const ligands = computed(() => {
    const regex = /^(?:pubchem: ?([1-9][0-9]*)|drugbank: ?(DB\d{5})|chembl: ?(CHEMBL\d+)|residue: ?(?:\d{1,3}(?:, ?\d{1,3})*))$/;
    const vals = refInputs.value
      .map(val => {
        if (val === null) return []
        const match = val.match(regex);
        if (match) {
          if (match[1]) return match[1]
          else if (match[2]) return match[2]
          else if (match[3]) return match[3]
        }
        return null;
      })
      .filter(val => val !== null)
      .map(val => ({[val]: `https://www.uniprot.org/uniprotkb/${val}/entry`}))
    return vals
  });

  // shows / hides eye icon depending if the input fulfills the rules
  const setViewIcon = (val) => {
    if (val === null) return ''
    switch (props.inputType) {
      case 'pdb':
        return (pdbs.value.find(entry => entry[val])?.[val]) ? 'mdi-eye-circle-outline' : ''
      case 'uniprot':
        const r1 = /(?:[A-Za-z]: ?)?([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})/
        const m1 = val.match(r1)
        if (m1 === null) return ''
        return (uniprots.value.find(entry => entry[m1[1]])?.[m1[1]]) ? 'mdi-eye-circle-outline' : ''
      case 'ligand':
        const r2 = /^(?:pubchem: ?([1-9][0-9]*)|drugbank: ?(DB\d{5})|chembl: ?(CHEMBL\d+)|residue: ?(?:\d{1,3}(?:, ?\d{1,3})*))$/
        const m2 = val.match(r2)
        if (m2 === null) return ''
        if (m2[1]) return (ligands.value.find(entry => entry[m2[1]])?.[m2[1]]) ? 'mdi-eye-circle-outline' : ''
        else if (m2[2]) return (ligands.value.find(entry => entry[m2[2]])?.[m2[2]]) ? 'mdi-eye-circle-outline' : ''
        else if (m2[3]) return (ligands.value.find(entry => entry[m2[3]])?.[m2[3]]) ? 'mdi-eye-circle-outline' : ''
    }
  }

  // opens a new tab with the link of the input
  const setViewIconLink = (val) => {
    switch (props.inputType) {
      case 'pdb':
        window.open(pdbs.value.find(entry => entry[val])?.[val], '_blank')
        break
      case 'uniprot':
        const r1 = /(?:[A-Za-z]: ?)?([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})/
        const m1 = val.match(r1)
        window.open(`https://www.uniprot.org/uniprotkb/${m1[1]}/entry`, '_blank')
        break
      case 'ligand':
        const regex = /^(?:pubchem: ?([1-9][0-9]*)|drugbank: ?(DB\d{5})|chembl: ?(CHEMBL\d+)|residue: ?(?:\d{1,3}(?:, ?\d{1,3})*))$/
        const match = val.match(regex)
        if (match) {
          if (match[1]) window.open(`https://pubchem.ncbi.nlm.nih.gov/compound/${match[1]}`, '_blank')
          else if (match[2]) window.open(`https://go.drugbank.com/drugs/${match[2]}`, '_blank')
          else if (match[3]) window.open(`https://www.ebi.ac.uk/chembl/compound_report_card/${match[3]}/`, '_blank')
        }
        break
    }
  }

  // Check if all values in an array of objects are non-empty
  const allValuesNonEmpty = (arr) => arr.every((val) => val !== '' && val !== null)

  const createNewInput = () => {
    if(allValuesNonEmpty(refInputs.value) && checkAllValuesAgainstRules(refInputs.value, rules.value) === true) {
      refInputs.value.push('')
    }    
  }

  const removeInput = (index) => {
    if (index > 0) {
      refInputs.value.splice(index, 1)
    }
  }

</script>

<style scoped>
  .multi { display: flex; }
</style>