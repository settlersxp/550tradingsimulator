<script setup lang="ts">
import type { Asset } from '../types/asset'
import PositionDisplay from './PositionDisplay.vue'

const props = defineProps<{
  asset: Asset
}>()

const emit = defineEmits(['close'])

// Calculate total positions value
function calculateTotalPositionsValue(): number {
  if (!props.asset) return 0;
  
  return props.asset.positions.reduce((total, position) => {
    return total + (position.openingPrice * position.quantity);
  }, 0);
}

// Calculate active positions value
function calculateActivePositionsValue(): number {
  if (!props.asset) return 0;
  
  return props.asset.positions
    .filter(position => position.isActive)
    .reduce((total, position) => {
      return total + (position.openingPrice * position.quantity);
    }, 0);
}

// Calculate closed positions value
function calculateClosedPositionsValue(): number {
  if (!props.asset) return 0;
  
  return props.asset.positions
    .filter(position => !position.isActive)
    .reduce((total, position) => {
      return total + (position.openingPrice * position.quantity);
    }, 0);
}
</script>

<template>
  <div class="asset-detail-view" v-if="props.asset">
    <div class="asset-header">
      <h2>{{ props.asset.name }} - Detailed View</h2>
      <button @click="emit('close')">Back to Dashboard</button>
    </div>
    
    <div class="asset-overview">
      <div class="price-info">
        <p><strong>Current Price:</strong> ${{ props.asset.price.toFixed(2) }}</p>
        <p><strong>Previous Price:</strong> ${{ props.asset.displayPrice.toFixed(2) }}</p>
        <p><strong>Highest Opening Price:</strong> ${{ props.asset.highestOpeningPrice.toFixed(2) }}</p>
      </div>
      
      <div class="trend-info">
        <p><strong>Trend Reversed:</strong> {{ props.asset.trendReversed ? 'Yes' : 'No' }}</p>
        <p><strong>Trend Reversal Percentage:</strong> {{ props.asset.trendReversalPercentage }}%</p>
        <p><strong>Reverse Trend Trigger Value:</strong> {{ props.asset.reverseTrendTriggerValue }}</p>
        <p><strong>Initial Reverse Trend Trigger Value:</strong> {{ props.asset.initialReverseTrendTriggerValue }}</p>
        <p><strong>Initial Uptrend Value:</strong> {{ props.asset.initialUptrendValue }}</p>
      </div>
    </div>

    <div class="positions-section">
      <h3>Positions</h3>
      <div v-if="props.asset.positions.length === 0" class="no-positions">
        No positions available for this asset.
      </div>
      <div v-else>
        <PositionDisplay 
          v-for="(position, index) in props.asset.positions" 
          :key="index"
          :position="position"
        />
      </div>
    </div>

    <div class="portfolio-value-section">
      <h3>Portfolio Value Calculation</h3>
      <p><strong>Total Positions Value:</strong> ${{ calculateTotalPositionsValue().toFixed(2) }}</p>
      <p><strong>Active Positions Value:</strong> ${{ calculateActivePositionsValue().toFixed(2) }}</p>
      <p><strong>Closed Positions Value:</strong> ${{ calculateClosedPositionsValue().toFixed(2) }}</p>
    </div>
  </div>
  <div v-else class="asset-detail-view-placeholder">
    Loading asset details...
  </div>
</template>

<style scoped>
.asset-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.asset-header h2 {
  color: #333;
  margin: 0;
}

.asset-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.price-info, .trend-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-info p, .trend-info p {
  margin: 5px 0;
  font-size: 16px;
  color: #333;
}

.positions-section {
  margin-bottom: 30px;
}

.positions-section h3 {
  color: #333;
  margin-bottom: 15px;
}

.no-positions {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.portfolio-value-section {
  padding: 20px;
  background-color: #e9f7fe;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.portfolio-value-section h3 {
  margin-top: 0;
  color: #333;
}

.portfolio-value-section p {
  margin: 10px 0;
  font-size: 16px;
  color: #333;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}
</style>
