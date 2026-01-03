<script setup lang="ts">
import type { Portfolio } from '../types/portfolio'

const props = defineProps<{
  portfolio: Portfolio
}>()

// Function to increase price by $1 for all assets
function increasePrices(): void {
  props.portfolio.assets.forEach((asset) => {
    asset.price += 1
  })
}

// Function to decrease price by $1 for all assets
function decreasePrices(): void {
  props.portfolio.assets.forEach((asset) => {
    asset.price = Math.max(0.01, asset.price - 1)
  })
}

// Emit events to parent component
const emit = defineEmits(['generate', 'reinitialize'])
</script>

<template>
  <div class="controls">
    <div class="control-group">
      <label for="assets">Number of Assets:</label>
      <input 
        id="assets" 
        v-model.number="portfolio.assets.length" 
        type="number" 
        min="1" 
        max="50"
      />
    </div>
    
    <div class="control-group">
      <label for="upThreshold">Upward Threshold (%):</label>
      <input 
        id="upThreshold" 
        v-model.number="portfolio.upwardThreshold" 
        type="number" 
        min="0" 
        step="0.1"
      />
    </div>
    
    <div class="control-group">
      <label for="downThreshold">Downward Threshold (%):</label>
      <input 
        id="downThreshold" 
        v-model.number="portfolio.downwardThreshold" 
        type="number" 
        min="0" 
        step="0.1"
      />
    </div>
    
    <div class="control-group">
      <label for="stopLossThreshold">Stop Loss Threshold (%):</label>
      <input 
        id="stopLossThreshold" 
        v-model.number="portfolio.stopLossThreshold" 
        type="number" 
        min="0" 
        step="0.1"
      />
    </div>
    
    <div class="button-group">
      <button @click="increasePrices">+</button>
      <button @click="decreasePrices">-</button>
      <button @click="$emit('generate')">Generate</button>
      <button @click="$emit('reinitialize')">Reinitialize</button>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.control-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.control-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}
</style>
