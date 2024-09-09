import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => ['v-container'].includes(tag) 
        || ['v-footer'].includes(tag) 
        || ['v-row'].includes(tag)
        || ['v-col'].includes(tag)
        || ['v-btn'].includes(tag)
        || ['v-app'].includes(tag)
        || ['v-app-bar'].includes(tag)
        //|| ['v-menu'].includes(tag)
        || ['v-list'].includes(tag)
        || ['v-list-item'].includes(tag)
        //|| ['v-list-group'].includes(tag)
        || ['NuxtLink'].includes(tag)
        
        
        //isCustomElement: (tag) => tag.startsWith('v-')
      }
    }
  })],
  test: {
    environment: 'happy-dom',
    globals: true,
    server: {
      deps: {
        inline: ['vuetify'],
      }
    }
  }
}