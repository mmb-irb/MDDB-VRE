<template>
	<div :class="`legend ${props.position}`" v-html="legend"></div>
</template>

<script setup>

	const props = defineProps({
    modelValue: String,
		position: { type: String, default: 'tl' }
  })

	const legend = computed(() => props.modelValue)

</script>

<style>
	.legend {
		position: absolute;
		top: 5px;
		right: 5px;
		background-color: #ffffffcc;
		padding: 10px;
		border-radius: 5px;
		z-index: 2;
	}
	.legend.tl { bottom: auto; right: auto; top: 5px; left: 5px; }
	.legend.tr { bottom: auto; left: auto; top: 5px; right: 5px; }
	.legend.bl { top: auto; right: auto; bottom: 5px; left: 5px; }
	.legend.br { top: auto; left: auto; bottom: 5px; right: 5px; }
</style>
