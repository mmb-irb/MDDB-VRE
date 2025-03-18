<template>
  <span class="sequence-number" v-if="index % 10 === 0">{{ residue.resno }}
      <span v-if="residue.resno.toString().length == 4">&nbsp;&nbsp;</span>
      <span v-if="residue.resno.toString().length == 3">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span v-if="residue.resno.toString().length == 2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span v-if="residue.resno.toString().length == 1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  </span>

  <span class="sequence-item"
    @mouseover="onMouseOver($event, residue.model, residue.chain, residue.num, residue.label, residue.longname)"
    @mouseleave="onMouseLeave($event, residue.model, residue.chain, residue.num, residue.label)"
    @click.exact="onClick($event, residue.model, residue.chain, residue.num, residue.label)"
  >
    {{ resid }}
  </span>
</template>

<script setup>

  const { $globals } = useNuxtApp()

  const { index, residue } = defineProps(['index', 'residue'])
  
  //console.log(residue)
  const rname = residue.resname.toLowerCase()
  const resid = (rname in $globals.ngl.aminoacids) ? $globals.ngl.aminoacids[rname].id : 'X'

  const onMouseOver = (event, model, chain, resnum, resname, longname) => {
    event.target.classList.add('sequence-item-hover');
    //console.log('Mouse over')
  }

  const onMouseLeave = (event, model, chain, resnum, resname, longname) => {
    event.target.classList.remove('sequence-item-hover');
    //console.log('Mouse leave')
  }

  const onClick = (event, model, chain, resnum, resname, longname) => {
    console.log('Click')
  }
  
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
