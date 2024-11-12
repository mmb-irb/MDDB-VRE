<template>
  <p style="color:#777;">{{ props.description }}</p>
  <v-row class="mb-0">
    <v-col v-for="(input, index) in refModel" :key="index" :lg="props.subCols" :md="props.subCols" sm="12" cols="12" class="pb-0">
      <div class="select-input">
        <div class="sel-class">
          <v-autocomplete
            v-model="refModel[index].select"
            :rules="selRules"
            :items="items"
            :label="`${select.label} ${select.required ? '*' : ''}`"
            @update:modelValue="(value) => handleSelect(index)"
            item-title="name"
            item-value="option"
            clearable
            allow-new
          >
          </v-autocomplete>
        </div>
        <div class="input-class">
          <v-text-field
            v-model="refModel[index].input"
            :rules="inpRules"
            :label="`${inputLabel} ${inputRequired ? '*' : ''}`"
            :prepend-inner-icon="setViewIcon(refModel[index].input)"
            @update:modelValue="(value) => handleInput(index)"
            @click:prepend-inner="setViewIconLink(refModel[index].input)"
            clearable
          >
          </v-text-field>
        </div>
        <div class="input-class">
          <v-text-field
            v-model="refModel[index].residue"
            :rules="resRules"
            :label="`${residueLabel} ${residueRequired ? '*' : ''}`"
            :append-inner-icon="index > 0 ? 'mdi-delete-outline' : ''"
            @update:modelValue="(value) => handleResidue(index)"
            @click:append-inner="remove(index)"
            clearable
          >
          <template v-slot:append>
            <v-icon :color="!nfEnabled ? 'grey-lighten-1' : ''" @click="createNewInput()" v-if="index === refModel.length - 1">mdi-plus-circle-outline</v-icon>
          </template>
          </v-text-field>
        </div>
      </div>
    </v-col>
  </v-row>
  <p style="color:#777;">{{ props.description2 }}</p>
  <v-row class="mb-0">
    <v-col v-for="(input, index) in refModelOther" :key="index" :lg="props.subCols" :md="props.subCols" sm="12" cols="12" class="pb-0">
      <div class="select-input">
        <div class="sel-class">
          <v-text-field
            v-model="refModelOther[index].input"
            :label="`${otherLabel} ${otherRequired ? '*' : ''}`"
            @update:modelValue="(value) => handleInputOther(index)"
            clearable
          >
          </v-text-field>
        </div>
        <div class="input-class">
          <v-text-field
            v-model="refModelOther[index].residue"
            :rules="resRules"
            :label="`${residueLabel} ${residueRequired ? '*' : ''}`"
            :append-inner-icon="index > 0 ? 'mdi-delete-outline' : ''"
            @update:modelValue="(value) => handleResidueOther(index)"
            @click:append-inner="removeOther(index)"
            clearable
          >
          <template v-slot:append>
            <v-icon :color="!nfOtherEnabled ? 'grey-lighten-1' : ''" @click="createNewInputOther(index)" v-if="index === refModelOther.length - 1">mdi-plus-circle-outline</v-icon>
          </template>
          </v-text-field>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>

  import structureStorage from '@/modules/structure/structureStorage'
  import useRules from '@/modules/helpers/useRules'

  const { setMetadata, getMetadataField } = structureStorage()
  const { getRules, getMultipleRules, checkMultipleValuesAgainstRules } = useRules()

  const { props } = defineProps(['props'])
  const initModel = {select: null, input: null, residue: null}
  const refModel = ref([{ ...initModel }])
  const initModelOther = {input: null, residue: null}
  const refModelOther = ref([{ ...initModelOther }])
  const refLigands = ref([])
  const refLigandsOther = ref([])

  const select = props.fields.filter(f => f.type === 'select')[0]
  const items = select.items
  const input = props.fields.filter(f => f.type === 'input')[0]
  const inputLabel = ref(input.label)
  const inputRequired = ref(input.required)
  const residue = props.fields.filter(f => f.type === 'residue')[0]
  const residueLabel = ref(residue.label)
  const residueRequired = ref(residue.required)
  const other = props.fields.filter(f => f.type === 'other')[0]
  const otherLabel = ref(other.label)
  const otherRequired = ref(other.required)

  const selRules = ref(select.rules ? getRules(select.rules) : [])
  const inpRules = computed(() => input.rules ? getRules(input.rules.input) : [])
  const inpRules2 = computed(() => input.rules ? getMultipleRules(input.rules, Object.keys(initModel)) : [])
  const resRules = computed(() => residue.rules ? getRules(residue.rules.residue) : [])

  // computed property to check if all values are non-empty and fulfill the rules
  const nfEnabled = computed(() => allValuesNonEmpty(refModel.value) && checkMultipleValuesAgainstRules(refModel.value, inpRules2.value) === true)
  const nfOtherEnabled = computed(() => allOtherValuesNonEmpty(refModelOther.value))

  //const totalInputs = computed(() => getMetadataField(props.id) ? getMetadataField(props.id).length : -1)

  // function to handle the select field
  const handleSelect = (index) => {
    if (refModel.value[index].input) {
      const obj = {
        [refModel.value[index].select]: refModel.value[index].input
      };
      if (refModel.value[index].residue) obj['residue'] = refModel.value[index].residue;

      refLigands.value[index] = obj;
      setMetadata(props.id, refLigands.value);
    }
  }

  // function to handle the input field
  const handleInput = (index) => {
    if (refModel.value[index].select) {
      const obj = {
        [refModel.value[index].select]: refModel.value[index].input
      };
      if (refModel.value[index].residue) obj['residue'] = refModel.value[index].residue;

      refLigands.value[index] = obj;
      setMetadata(props.id, refLigands.value);
    }
  }
  
  // function to handle the residue field
  const handleResidue = (index) => {
    if(refModel.value[index].select && refModel.value[index].input) {
      const obj =  {
        residue: refModel.value[index].residue
      }
      if(refModel.value[index].select) obj[refModel.value[index].select] = refModel.value[index].input
      refLigands.value[index] = obj
      setMetadata(props.id, refLigands.value)
    }
  }

  // function to handle the other field
  const handleInputOther = (index) => {
    const obj = {
        name: refModelOther.value[index].input
    };
    if (refModelOther.value[index].residue) obj['residue'] = refModelOther.value[index].residue;

    refLigandsOther.value[index] = obj;
    setMetadata('ligands_other', refLigandsOther.value);
  }

  const handleResidueOther = (index) => {
    if(refModelOther.value[index].input) {
      const obj =  {
        residue: refModelOther.value[index].residue
      }
      if(refModelOther.value[index].input) obj.name = refModelOther.value[index].input
      refLigandsOther.value[index] = obj
      setMetadata('ligands_other', refLigandsOther.value)
    }
  }

  // computed property to display the selected ligands
  const ligands = computed(() => {
    const regex = /^(?: ?([1-9][0-9]*)| ?(DB\d{5})| ?(CHEMBL\d+))$/
    const vals = refModel.value
      .map(item => item.input)
      .filter(input => input !== null && input !== '')
      .map(val => {
        const match = val.match(regex);
        if (match) {
          if (match[1]) return match[1]
          else if (match[2]) return match[2]
          else if (match[3]) return match[3]
        }
        return null;
      })
      .filter(val => val !== null)
      .map(val => ({[val]: val}))
    return vals
  });

  // shows / hides eye icon depending if the input fulfills the rules
  const setViewIcon = (val) => {
    if (val === null) return ''
    switch (input.inputType) {
      case 'ligand':
        const r2 = /^(?: ?([1-9][0-9]*)| ?(DB\d{5})| ?(CHEMBL\d+))$/
        const m2 = val.match(r2)
        if (m2 === null) return ''
        if (m2[1]) return (ligands.value.find(entry => entry[m2[1]])?.[m2[1]]) ? 'mdi-eye-circle-outline' : ''
        else if (m2[2]) return (ligands.value.find(entry => entry[m2[2]])?.[m2[2]]) ? 'mdi-eye-circle-outline' : ''
        else if (m2[3]) return (ligands.value.find(entry => entry[m2[3]])?.[m2[3]]) ? 'mdi-eye-circle-outline' : ''
    }
  }

  // opens a new tab with the link of the input
  const setViewIconLink = (val) => {
    switch (input.inputType) {
      case 'ligand':
        const regex = /^(?: ?([1-9][0-9]*)| ?(DB\d{5})| ?(CHEMBL\d+))$/
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
  const allValuesNonEmpty = (arr) => arr.every((val) => val.select !== '' && val.select !== null && val.input !== '' && val.input !== null)
  const allOtherValuesNonEmpty = (arr) => arr.every((val) => val.input !== '' && val.input !== null)

  // creates a new input field
  const createNewInput = () => {
    if(allValuesNonEmpty(refModel.value) && checkMultipleValuesAgainstRules(refModel.value, inpRules2.value) === true) {
      refModel.value.push({ ...initModel })
    }    
  }

  // removes an input field
  const remove = (index) => {
    if (index > 0) {
      refModel.value.splice(index, 1)
      refLigands.value.splice(index, 1)
      setMetadata(props.id, refLigands.value)
    }
  }

  // creates a new input field
  const createNewInputOther = () => {
    if(allOtherValuesNonEmpty(refModelOther.value)) {
      refModelOther.value.push({ ...initModel })
    }    
  }

  // removes an input field
  const removeOther = (index) => {
    if (index > 0) {
      refModelOther.value.splice(index, 1)
      refLigandsOther.value.splice(index, 1)
      setMetadata(props.id, refLigandsOther.value)
    }
  }

</script>

<style>
  .sel-class .v-input__append { margin-inline-start:15px;  }
</style>
<style scoped>
  .select-input { display: flex; }
  .sel-class { display: flex; width: 100%; }
  .input-class { display: flex; width: 100%; margin-left: 24px; }
</style>