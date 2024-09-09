<template>
  <v-app>
    
    <MainMenu />

    <v-main class="bg-grey-lighten-3">
      <slot />

    </v-main>

    <ScrollTop />
    
    <Footer />

  </v-app>
</template>