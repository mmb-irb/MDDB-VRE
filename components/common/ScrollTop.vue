<template>
  <div>
    <v-btn
      icon="mdi-chevron-up" 
      id="btn-back-to-top"
      color="purple-lighten-4"
      @click="backToTop" 
    >
    </v-btn>
  </div>
</template>

<script setup>

  let mybutton

  onMounted(() => mybutton = document.getElementById("btn-back-to-top"))

  const scrollFunction = () => {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        mybutton.style.display = "block"
    } else {
        mybutton.style.display = "none"
    }
  }

  window.onscroll = () => scrollFunction()

  const backToTop = () => window.scrollTo({top: 0, behavior: 'smooth'})
  
</script>

<style scoped>
  #btn-back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: none;
    z-index:10;
  }
  .v-btn { color: #fff!important; }
</style>
