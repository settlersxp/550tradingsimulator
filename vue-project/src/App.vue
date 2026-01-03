<script setup lang="ts">
// This component now acts as a wrapper to display the layout with navigation
// The actual portfolio simulation logic is now in PortfolioSimulation.vue
</script>

<template>
  <div class="app-wrapper">
    <!-- The Layout component will handle displaying the menu -->
    <router-view />
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
