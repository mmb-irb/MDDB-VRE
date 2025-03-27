<template>
  <v-row>
    <v-col md="12" cols="12" sm="12" >
      <v-select
        :label="chains.length === 0 ? 'Loading...' : (chains.length <= 1 ? `Single chain structure [:${chains[0]}]` : 'Chains')"
        v-model="modelChains"
        :items="chains"
        :disabled="!enabled || chains.length <= 1"
        density="compact"
        @update:model-value="changeRepresentationChains"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item 
            class="item-v-select" 
            v-bind="props" 
            :title="item.title" 
            :value="item.value" 
            @mouseover="setPreview(`:${item.value}`, true)"
            @mouseleave="setPreview(`:${item.value}`, false)"
          ></v-list-item>
        </template>
      </v-select>
    </v-col>
  </v-row>  
  <v-card
    variant="tonal"
    color="grey-darken-1"
  >
    <v-card-text class="pl-2 py-1 pr-0">
      <div id="container-residues" style="">
        <div class="chain-sequence margin-bottom-10" v-for="(chain, i) in strObj" :key="i">
          <div class="chain-title margin-bottom-10" v-if="chain.residues.length > 0">Chain {{ chain.chain }}</div>
          <residue
            v-for="(residue, j) in chain.residues" 
            :ref="setRefRes(i, j)"
            :index="[i, j]"
            :residue="residue"
            @updateModelResidues="handleUpdateModelResidues"
            @selectMultipleResidues="handleSelectMultipleResidues"
            @previewResidue="handlePreviewResidue"
            @centerResidue="handleCenterResidue"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
  <p class="supralabel mt-2">Custom selection. If you need help with <strong>NGL Viewer selection language</strong>, <a href="https://nglviewer.org/ngl/api/manual/usage/selection-language.html" target="_blank">please click here</a>.</p>
  <v-textarea
    v-model="modelSelection"
    label="NGL selection"
    clearable
    @update:modelValue="setSelection"
    @click:clear="cleanAll"
    :disabled="!enabled"
    rows="8"
    no-resize
  />
  <v-snackbar
    v-model="snackbar.model"
    color="purple-accent-1"
    :timeout="4000"
    elevation="24"
  >
    {{ snackbar.msg }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar.model = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>

  import utilsNGL from '@/modules/ngl/utils'

  const { addMultipleResidues, getResidueRange } = utilsNGL()

  const emit = defineEmits(['setSelection', 'setPreview', 'setView'])
  const { $eventBus, $waitFor } = useNuxtApp();

  const modelSelection = ref('')
  const modelChains = ref(null)
  const modelResidues = ref([])
  const chains = ref([])
  const residues = ref([])
  const strObj = ref({})
  const enabled = ref(false)
  const refResidue = ref([])
  const snackbar = ref({ model: false, msg: '' })

  onMounted(() => {
    $eventBus.on('nglReady', setEnabled)
    $eventBus.on('chainsList', setChains)
    $eventBus.on('residuesList', setResidues)
    $eventBus.on('strObj', setStructureObject)
  });

  onUnmounted(() => {
    $eventBus.off('nglReady', setEnabled)
    $eventBus.off('chainsList', setChains)
    $eventBus.off('residuesList', setResidues)
    $eventBus.off('strObj', setStructureObject)
  });

  const cleanAll = () => {
    modelChains.value = null
    modelResidues.value = []
    refResidue.value.forEach(ref => {
      if (ref) ref.setSelected(false)
    })
  }

  const splitSelection = (selection) => {
    let tokens;
    if (selection.includes('or')) {
      tokens = selection.split(/\s*or\s*/);
    } else {
      tokens = selection.split(/\s+/);
    }
    return tokens;
  }

  const setSelection = async (value) => {
    modelSelection.value = value
    emit('setSelection', value)

    if(modelSelection.value) {
      // update modelChains based on the current modelSelection
      const currentSelectionTokens = splitSelection(modelSelection.value)

      await $waitFor(() => residues.value.length > 0)

      // Store the old residues array (make sure to clone it)
      const oldResidues = [...modelResidues.value];
      // Filter out residue-specific tokens
      const filteredSelectionTokensRes = currentSelectionTokens
      .filter(token => token.match(/^[\-A-Za-z0-9]{1,3}:[A-Za-z]$/))
      // Update modelResidues
      modelResidues.value = filteredSelectionTokensRes
      // Compute the added tokens as the ones present in the new filtered list but not in oldResidues
      const addedIndexes = filteredSelectionTokensRes
        .map(token => residues.value.indexOf(token))
        .filter(index => index !== -1); // filter out any not found (if any)
      // Set the selected state of the added tokens
      addedIndexes.forEach(index => {
        refResidue.value[index].setSelected(true);
      });

      // Compute the removed tokens as the ones present in oldResidues but not in the new filtered list
      const removedResidues = oldResidues.filter(token =>
        !filteredSelectionTokensRes.includes(token)
      );
      // Compute the indexes of the removed tokens in the residues array
      const removedIndexes = removedResidues
        .map(token => residues.value.indexOf(token))
        .filter(index => index !== -1); // filter out any not found (if any)
      // Set the selected state of the removed tokens
      removedIndexes.forEach(index => {
        refResidue.value[index].setSelected(false);
      });
    } else {
      // If the selection is empty, reset the modelChains, modelPredefSels, and modelResidues
      modelChains.value = null
      //modelPredefSels.value = []
      modelResidues.value = []
    }
  }

  const setEnabled = (value) => {
    enabled.value = value
  }

  const setChains = (cs) => {
    chains.value = cs
  }

  const setResidues = (rs) => {
    residues.value = rs
  }

  const setStructureObject = (obj) => {
    // console.log(obj)
    strObj.value = obj
  }

  const removeRepeatedInSelection = (selection) => {
    const tokens = splitSelection(selection)
    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens.join(' ');
  };

  const changeRepresentationChains = () => {
    if (modelSelection.value && modelSelection.value.trim() !== '') {
      const chsel = strObj.value.filter(item => item.chain === modelChains.value)[0].residues.map(r => `${r.num}:${modelChains.value}`).join(' ');
      const combinedSelection = `${modelSelection.value} ${chsel}`;
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);

      modelChains.value = null;
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelChains
    const chsel = strObj.value.filter(item => item.chain === modelChains.value)[0].residues.map(r => `${r.num}:${modelChains.value}`).join(' ');
    setSelection(chsel);

    modelChains.value = null;
  };

  const changeRepresentationRes = () => {

    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out residue-specific tokens that are no longer in modelResidues
      const filteredSelectionTokens = currentSelectionTokens.filter(token => {
        // Check if the token is a residue-specific term (e.g., 1:J, -73:C)
        if (token.match(/^[\-A-Za-z0-9]{1,3}:[A-Za-z]$/)) {
          return modelResidues.value.includes(token); // Keep only if the residue is still in modelResidues
        }
        // Keep non-residue terms (e.g., :A, sheet)
        return true;
      });

      // Add new residues from modelResidues that are not already in the selection
      const newResidues = modelResidues.value
        .filter(residue => !currentSelectionTokens.includes(residue))
        .map(residue => `${residue}`);

      // Combine the filtered selection and new residues
      const combinedSelection = [...filteredSelectionTokens, ...newResidues].join(' ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelResidues
    const resel = modelResidues.value.map(c => `${c}`).join(' ');
    setSelection(resel);
  };

  // Set reference to input field
  const setRefRes = (i, j) => el => {
    let offset = 0
    for (let k = 0; k < i; k++) offset += strObj.value[k].residues.length
    refResidue.value[offset + j] = el
  }

  const handleUpdateModelResidues = (res, i, j, select) => {
    if(select) modelResidues.value.push(res)
    else modelResidues.value = modelResidues.value.filter(r => r !== res)
    let offset = 0
    for (let k = 0; k < i; k++) offset += strObj.value[k].residues.length
    refResidue.value[offset + j].setSelected(select)
    changeRepresentationRes()
  }

  const handleSelectMultipleResidues = (resnum, chain, i, j) => {
    const mr = addMultipleResidues({ num: resnum, chain: chain})

    if(mr.error) {
      snackbar.value = { model: true, msg: mr.msg }
      document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.style.cursor = 'pointer')
      document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.classList.remove('sequence-item-mult-selected'))
      return
    }

    document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.style.cursor = 'copy')
    // on second click
    if(!mr.status) {
      let first, last
      // check if error
      if(mr.error) {
        snackbar.value = { model: true, msg: mr.msg }
        document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.style.cursor = 'pointer')
        document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.classList.remove('sequence-item-mult-selected'))
        return
      } else  {
        // sort first last properly
        if(mr.firstRes.num > mr.lastRes.num) {
          first = mr.lastRes
          last = mr.firstRes
        } else {
          first = mr.firstRes
          last = mr.lastRes
        }
      }
      document.querySelectorAll('.sequence-item:not(.disabled)').forEach(el => el.style.cursor = 'pointer')
      document.querySelector(`#res-${mr.firstRes.num}-${mr.firstRes.chain}`).classList.remove('sequence-item-mult-selected')
      const [range, indexes] = getResidueRange(first, last, residues.value)

      const removeFromSelection = range.every(item => modelResidues.value.includes(item));
      
      if(removeFromSelection) {
        modelResidues.value = modelResidues.value.filter(item => !range.includes(item));
        indexes.forEach(index => {
          refResidue.value[index].setSelected(false)
        });
      } else {
        modelResidues.value = [...modelResidues.value, ...range]
      }
      changeRepresentationRes()
    // on first click
    } else {
      document.querySelector(`#res-${resnum}-${chain}`).classList.add('sequence-item-mult-selected')
    }
  }

  const setPreview = (res, type) => {
    emit('setPreview', res, type)
  }

  const handlePreviewResidue = (res, type) => {
    setPreview(res, type)
  }

  const handleCenterResidue = (resnum, chain) => {
    const s = `${resnum}:${chain}`
    //setSelection(s)
    emit('setView', s)
  }

  defineExpose({
    setSelection,
    setEnabled,
    setChains
  })

</script>

<style scoped>
  .supralabel { font-size: 13px; }
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
  }
  #container-residues {
    height: 182px;
    overflow-y: auto;
    word-break: break-all;line-height: 35px;
    word-break: break-all;
    overflow-y: auto; 
    overflow-x: hidden; 
  }
  .chain-sequence {
    border-bottom: solid 1px #d1d1d1;
    padding-bottom: .5rem;
  }
  .chain-title {
    font-family: 'Open Sans';
    border-bottom: solid 1px #555;
    padding-left: .5rem;
    line-height: 25px;
    margin-bottom: .5rem;
  }
</style>
