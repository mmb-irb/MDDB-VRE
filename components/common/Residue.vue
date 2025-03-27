<template>
  <span class="sequence-number" v-if="index[1] % 10 === 0">{{ residue.num }}
      <span v-if="residue.num.toString().length == 4">&nbsp;&nbsp;</span>
      <span v-if="residue.num.toString().length == 3">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span v-if="residue.num.toString().length == 2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span v-if="residue.num.toString().length == 1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  </span>

  <span :class="selected ? 'sequence-item sequence-item-selected' : 'sequence-item'"
    :id="`res-${residue.num}-${residue.chain}`"
    @mouseover="onMouseOver($event, residue.chain, residue.num)"
    @mouseleave="onMouseLeave($event, residue.chain, residue.num)"
    @click.exact="onClick($event, residue.chain, residue.num)"
    @click.shift.exact="onSelectMultiple($event, residue.chain, residue.num)"
    @click.alt.exact="onCenterResidue($event, residue.chain, residue.num)"
  >
    {{ resid }}
  </span>
</template>

<script setup>

  const emit = defineEmits(['updateModelResidues', 'selectMultipleResidues', 'previewResidue', 'centerResidue'])

  const { $globals } = useNuxtApp()

  const { index, residue } = defineProps(['index', 'residue'])

  const selected = ref(false)  
  const rname = residue.resname.toLowerCase()
  const resid = (rname in $globals.ngl.aminoacids) ? $globals.ngl.aminoacids[rname].id : 'X'

  const onMouseOver = (event, chain, resnum) => {
    event.target.classList.add('sequence-item-hover');
    emit('previewResidue', resnum + ':' + chain, true)
  }

  const onMouseLeave = (event, chain, resnum) => {
    event.target.classList.remove('sequence-item-hover');
    emit('previewResidue', resnum + ':' + chain, false)
  }

  const setSelected = (value) => {
    selected.value = value
  }

  const onClick = (event, chain, resnum) => {
    emit('updateModelResidues', resnum + ':' + chain, index[0], index[1], !selected.value)
  }

  const onSelectMultiple = (event, chain, resnum) => {
    emit('selectMultipleResidues', resnum , chain, index[0], index[1])
  }

  const onCenterResidue = (event, chain, resnum) => {
    emit('centerResidue', resnum, chain)
  }

  defineExpose({ 
    setSelected 
  })
  
</script>

<style scoped>
  .sequence-item {
    font-family: monospace;
    font-size: 14px !important;
    position:relative; 
    z-index:1; 
    padding:0 0.5px; 
    cursor:default; 
    user-select: none;
  }
  .sequence-item:not(.disabled) { cursor: pointer; }    
  .sequence-item-hover {
    color: #fff;
    background: #99a8b9;
  }
  .sequence-item-selected {
    color: #fff;
    background: #5E738B;
  }
  .sequence-item-mult-selected {
    position: relative;
  }

  .sequence-item-mult-selected::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px dashed #bd78cc;
    pointer-events: none;
  }
  .sequence-number {
    color: #325880;
    word-break: keep-all;
    cursor: default;
    position: relative;
    top: -1.1em;
    left: 3.1em;
    padding: 0px;
    margin-left: -3em;
    font-size: 80%;
    user-select: none;
  }
</style>
