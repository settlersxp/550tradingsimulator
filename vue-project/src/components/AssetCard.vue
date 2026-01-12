<script setup lang="ts">
import type { Asset } from '../types/asset'
import PositionDisplay from './PositionDisplay.vue'

const props = defineProps<{
  asset: Asset
}>()

// Emit event to show detail view
const emit = defineEmits(['show-detail'])

// Generate a unique identifier for this asset card internally
const assetId = props.asset.name

// Method to handle click and show detail
function handleShowDetail(): void {
  emit('show-detail', props.asset)
}
</script>

<template>
  <div class="asset-card" v-if="props.asset" @click="handleShowDetail">
    <h3>{{ props.asset.name }}</h3>
    <p>Current Price: ${{ props.asset.price.toFixed(2) }}</p>
    <p>Previous Price: ${{ props.asset.displayPrice.toFixed(2) }}</p>
    <div class="trend-reversal-input">
      <label :for="'trendReversal-' + assetId">Trend Reversal %:</label>
      <input 
        :id="'trendReversal-' + assetId"
        v-model.number="props.asset.trendReversalPercentage" 
        type="number" 
        min="0" 
        step="0.1"
      />
    </div>
    <div class="trend-reversed">
      <label :for="'trendReversal-' + assetId">Trend Reversed:</label>
      <span>{{ props.asset.trendReversed ? 'Yes' : 'No' }}</span>
    </div>
    <p>Reverse trend trigger value: {{ props.asset.reverseTrendTriggerValue }}</p>
    <p>Initial reversal trend trigger value: {{ props.asset.initialReverseTrendTriggerValue }}</p>
    <p>Initial uptrend value: {{ props.asset.initialUptrendValue }}</p>
    <div class="positions">
      <h4>Positions:</h4>
      <PositionDisplay 
        v-for="(position, index) in props.asset.positions" 
        :key="index"
        :position="position"
      />
    </div>
  </div>
  <div v-else class="asset-card-placeholder">
    Loading asset data...
  </div>
</template>

<style scoped>
.asset-card {
  border: 1px solid;
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
