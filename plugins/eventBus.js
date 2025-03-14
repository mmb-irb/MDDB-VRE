// plugins/eventBus.js
import mitt from 'mitt';

// Create a new event bus
const eventBus = mitt();

// Export the event bus as a plugin
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('eventBus', eventBus);
});