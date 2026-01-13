<script setup lang="ts">
</script>

<template>
  <div class="layout-container">
    <header class="app-header">
      <h1>Portfolio Simulation Application</h1>
      <nav class="app-nav">
        <router-link to="/" class="nav-link">Main Simulation</router-link>
        <router-link to="/file-simulation" class="nav-link">File-Based Simulation</router-link>
        <router-link to="/ohlc-simulation" class="nav-link">OHLC File Simulation</router-link>
      </nav>
    </header>
    
    <main class="app-main">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.app-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.1);
}

.nav-link.router-link-active {
  background-color: #3498db;
}

.app-main {
  flex: 1;
  padding: 2rem;
}
</style>
