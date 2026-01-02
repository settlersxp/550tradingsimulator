<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { 
  generateRandomWord,
  addPositionWhenThresholdCrossed,
  applyStopLossLogic,
  calculateTotalValue,
  calculateActivePositionsValue,
  calculateClosedPositionsValue
 } from './portfolioLogic'

// Position data structure
import type { Position } from './types/position'

// Portfolio data structure
import type { Portfolio } from './types/portfolio'

// Import the PositionDisplay component
import PositionDisplay from './components/PositionDisplay.vue'

// Reactive portfolio state
const portfolio = reactive<Portfolio>({
  assets: [],
  upwardThreshold: 5,
  downwardThreshold: 5,
  stopLossThreshold: 5 // New stop loss threshold
})

// Number of assets to generate
const numberOfAssets = ref(5)

// Generate or update portfolio assets
function generatePortfolio(): void {
  const currentAssetCount = portfolio.assets.length
  const targetAssetCount = numberOfAssets.value
  
  if (targetAssetCount > currentAssetCount) {
    // Increasing number of assets - add new ones only
    for (let i = currentAssetCount; i < targetAssetCount; i++) {
      const assetName = generateRandomWord()
      const initialPrice = 100
      const newPosition: Position = {
        openingPrice: initialPrice,
        quantity: 1,
        stopLossPrice: initialPrice * 1.05, // 5% higher than opening price
        isActive: true
      }
      
      portfolio.assets.push({
        name: assetName,
        price: initialPrice,
        previousPrice: initialPrice,
        positions: [newPosition]
      })
    }
  } else if (targetAssetCount < currentAssetCount) {
    // Decreasing number of assets - remove excess ones
    portfolio.assets.splice(targetAssetCount)
  }
  // If targetAssetCount === currentAssetCount, do nothing
}

// Calculate total portfolio value
function getTotalValue(): number {
  return calculateTotalValue(portfolio.assets)
}

// Calculate closed positions value
function getClosedPositionsValue(): number {
  return calculateClosedPositionsValue(portfolio.assets)
}

// Calculate active positions value
function getActivePositionsValue(): number {
  return calculateActivePositionsValue(portfolio.assets)
}

// Update portfolio with new prices
function updatePortfolio(): void {
  // Update prices for all assets
  portfolio.assets.forEach(asset => {
    // Store previous price before updating
    asset.previousPrice = asset.price;
    
    // Simulate price change with random fluctuation
    const fluctuation = (Math.random() * 20) - 10 // Random number between -10 and 10
    asset.price = Math.max(0.01, asset.price + fluctuation) // Ensure price doesn't go below 0.01
    
    // Calculate percentage change
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100;
    
    // Apply threshold crossing logic to add new positions when thresholds are crossed
    addPositionWhenThresholdCrossed(asset, changePercentage);
    
    // Apply stop loss logic based on price changes
    applyStopLossLogic(asset, changePercentage);
  })
  
  generatePortfolio()
}

// Initialize portfolio on component mount
generatePortfolio()

// Watch for changes to numberOfAssets and regenerate portfolio accordingly
watch(numberOfAssets, (newVal, oldVal) => {
  // Only regenerate if the number of assets actually changed
  if (newVal !== oldVal) {
    generatePortfolio()
  }
})
</script>

<template>
  <div class="container">
    <h1>Portfolio Simulation Application</h1>
    
    <div class="controls">
      <div class="control-group">
        <label for="assets">Number of Assets:</label>
        <input 
          id="assets" 
          v-model.number="numberOfAssets" 
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
      
      <button @click="updatePortfolio">Update Portfolio</button>
    </div>
    
    <div class="portfolio-info">
      <h2>Closed Positions: ${{ getClosedPositionsValue().toFixed(2) }}</h2>
      <h2>Active Positions: ${{ getActivePositionsValue().toFixed(2) }}</h2>
      <h2>Total: ${{ getTotalValue().toFixed(2) }}</h2>
    </div>
    
    <div class="assets-container">
      <div 
        v-for="asset in portfolio.assets" 
        :key="asset.name + '-' + Math.random()" 
        class="asset-card"
      >
        <h3>{{ asset.name }}</h3>
        <p>Current Price: ${{ asset.price.toFixed(2) }}</p>
        <p>Previous Price: ${{ asset.previousPrice.toFixed(2) }}</p>
        <div class="positions">
          <h4>Positions:</h4>
          <PositionDisplay 
            v-for="(position, index) in asset.positions" 
            :key="index"
            :position="position"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

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

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  align-self: flex-end;
}

button:hover {
  background-color: #45a049;
}

.portfolio-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #e8f5e8;
  border-radius: 8px;
  text-align: center;
}

.assets-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

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

.positions ul {
  padding-left: 20px;
  margin: 0;
}

.positions li {
  margin: 5px 0;
  color: #555;
}
</style>
