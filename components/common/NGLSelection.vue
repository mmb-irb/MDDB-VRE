<template>
  <v-select
    :label="chains.length === 0 ? 'Loading...' : (chains.length <= 1 ? `Single chain structure [:${chains[0]}]` : 'Chains')"
    v-model="modelChains"
    :items="chains"
    multiple
    :disabled="!enabled || chains.length <= 1"
    density="compact"
    @update:model-value="changeRepresentation"
  ></v-select>
  <v-select
    :label="residues.length === 0 ? 'Loading...' : 'Residues'"
    v-model="modelResidues"
    :items="residues"
    multiple
    :disabled="!enabled || residues.length <= 1"
    density="compact"
    @update:model-value="changeRepresentation"
  ></v-select>
  <p class="supralabel">Custom selection. If you need help with <strong>NGL Viewer selection language</strong>, <a href="https://nglviewer.org/ngl/api/manual/usage/selection-language.html" target="_blank">please click here</a>.</p>
  <v-textarea
    v-model="modelSelection"
    label="NGL selection"
    clearable
    @update:modelValue="setSelection"
    @click:clear="modelChains = []"
    :disabled="!enabled"
    rows="16"
    no-resize
  />
</template>

<script setup>

  const emit = defineEmits(['setSelection'])
  const { $eventBus } = useNuxtApp();

  const modelSelection = ref('')
  const modelChains = ref([])
  const modelResidues = ref([])
  const chains = ref([])
  const residues = ref([])
  const enabled = ref(false)

  onMounted(() => {
    $eventBus.on('nglReady', setEnabled);
    $eventBus.on('chainsList', setChains);
    $eventBus.on('residuesList', setResidues);
  });

  onUnmounted(() => {
    $eventBus.off('nglReady', setEnabled);
    $eventBus.off('chainsList', setChains);
    $eventBus.off('residuesList', setResidues);
  });

  const splitSelection = (selection) => {
    let tokens;
    if (selection.includes('or')) {
      tokens = selection.split(/\s*or\s*/);
    } else {
      tokens = selection.split(/\s+/);
    }
    return tokens;
  }

  const setSelection = (value) => {
    modelSelection.value = value
    emit('setSelection', value)

    // update modelChains based on the current modelSelection
    if(modelSelection.value) {
      const currentSelectionTokens = splitSelection(modelSelection.value)
      // Filter out chain-specific tokens
      const filteredSelectionTokens = currentSelectionTokens
      .filter(token => token.startsWith(':'))
      .map(token => token.replace(/:+/g, ''));
      // Update modelChains
      modelChains.value = filteredSelectionTokens
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

  const removeRepeatedInSelection = (selection) => {
    const tokens = splitSelection(selection)
    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens.join(' ');
  };

  const changeRepresentation = () => {
    if (modelSelection.value && modelSelection.value.trim() !== '') {
      // Split the current selection into individual tokens
      const currentSelectionTokens = splitSelection(modelSelection.value)

      // Filter out chain-specific tokens that are no longer in modelChains
      const filteredSelectionTokens = currentSelectionTokens.filter(token => {
        // Check if the token is a chain-specific term (e.g., :J, :C)
        if (token.startsWith(':')) {
          const chain = token.slice(1); // Remove the ':' prefix to get the chain ID
          return modelChains.value.includes(chain); // Keep only if the chain is still in modelChains
        }
        // Keep non-chain terms (e.g., 73, 50)
        return true;
      });

      //console.log(filteredSelectionTokens, modelChains.value)

      // Add new chains from modelChains that are not already in the selection
      const newChains = modelChains.value
        .filter(chain => !currentSelectionTokens.includes(`:${chain}`))
        .map(chain => `:${chain}`);

      // Combine the filtered selection and new chains
      const combinedSelection = [...filteredSelectionTokens, ...newChains].join(' ');

      // Remove any repeated terms and set the new selection
      const newSel = removeRepeatedInSelection(combinedSelection);
      setSelection(newSel);
      return;
    }

    // If modelSelection is empty, just set the selection to the current modelChains
    const chsel = modelChains.value.map(c => `:${c}`).join(' ');
    const resel = modelResidues.value.map(c => `${c}`).join(' ');
    setSelection(chsel + ' ' + resel);
  };

  defineExpose({
    setSelection,
    setEnabled,
    setChains
  })

</script>

<style scoped>
  .supralabel { font-size: 13px; }
</style>
