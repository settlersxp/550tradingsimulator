<script setup lang="ts">
import type { Asset } from '../types/asset'
import PositionDisplay from './PositionDisplay.vue'

defineProps<{
  asset: Asset
}>()
</script>

<template>
  <div class="asset-card">
    <h3>{{ asset.name }}</h3>
    <p>Current Price: ${{ asset.price.toFixed(2) }}</p>
    <p>Previous Price: ${{ asset.previousPrice.toFixed(2) }}</p>
    <div class="trend-reversal-input">
      <label for="trendReversal">Trend Reversal %:</label>
      <input 
        :id="'trendReversal-' + asset.name"
        v-model.number="asset.trendReversalPercentage" 
        type="number" 
        min="0" 
        step="0.1"
      />
    </div>
    <div class="trend-reversed">
      <label for="trendReversed">Trend Reversed:</label>
      <span>{{ asset.trendReversed ? 'Yes' : 'No' }}</span>
    </div>
    <p>Reverse trend trigger value: {{ asset.reverseTrendTriggerValue }}</p>
    <div class="positions">
      <h4>Positions:</h4>
      <PositionDisplay 
        v-for="(position, index) in asset.positions" 
        :key="index"
        :position="position"
      />
    </div>
  </div>
</template>

<style scoped>
.asset-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.asset-card h3 {
  margin-top: 0;
  color: #333;
}

.asset-card p {
  margin: 5px 0;
  color: #666;
}

.positions h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #444;
}
</style>
