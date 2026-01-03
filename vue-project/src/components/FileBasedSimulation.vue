<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  addPositionWhenThresholdCrossed,
  applyStopLossLogic,
  calculateTotalValue,
  calculateActivePositionsValue,
  calculateClosedPositionsValue,
  openNewPosition
} from '../portfolioLogic'

// Portfolio data structure
import type { Portfolio } from '../types/portfolio'

// Import the PositionDisplay component
import PositionDisplay from './PositionDisplay.vue'

// Reactive portfolio state
const portfolio = reactive<Portfolio>({
  assets: [],
  upwardThreshold: 5,
  downwardThreshold: 50,
  stopLossThreshold: 3 // New stop loss threshold
})

// Asset name input
const assetName = ref('')

// File content for processing
const fileContent = ref<string[]>([])

// Flag to indicate if we're currently processing prices
const isProcessing = ref(false)

// Flag to indicate if processing is paused
const isPaused = ref(false)

// Handle file upload
function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  
  const file = input.files[0]
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (content && typeof content === 'string') {
      // Split by new lines and filter out empty lines
      fileContent.value = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
    }
  }
  reader.readAsText(file)
}

// Process prices from file in reverse order (bottom to top)
function processPrices(): void {
  if (!assetName.value || fileContent.value.length === 0) {
    alert('Please provide an asset name and upload a file with prices')
    return
  }

  // Reset portfolio for new simulation
  portfolio.assets = []

  const lastIndex = fileContent.value.length - 1
  
  // Create one asset with the specified name
  const initialPrice = parseFloat(fileContent.value[lastIndex])
  if (isNaN(initialPrice)) {
    alert('Invalid price in file')
    return
  }
  
  const newAsset = {
    name: assetName.value,
    price: initialPrice,
    previousPrice: initialPrice,
    positions: []
  }
  
  portfolio.assets.push(newAsset)
  openNewPosition(newAsset)
  
  // Start processing prices from bottom to top (last line first)
  isProcessing.value = true
  processNextPrice(lastIndex)
}

// Process the next price in sequence
function processNextPrice(index: number): void {
  if (index >= fileContent.value.length) {
    isProcessing.value = false
    return
  }
  
  // Check if processing is paused
  if (isPaused.value) {
    // If paused, we'll check again after a short delay
    setTimeout(() => {
      processNextPrice(index)
    }, 100) // Check every 100ms if still paused
    return
  }
  
  const priceStr = fileContent.value[index]
  const nextIndex = index - 1
  const price = parseFloat(priceStr)
  
  if (isNaN(price)) {
    console.warn(`Invalid price at line ${nextIndex}: ${priceStr}`)
    processNextPrice(nextIndex)
    return
  }
  
  // Update the single asset with this price
  const asset = portfolio.assets[0]
  if (!asset) {
    isProcessing.value = false
    return
  }
  
  // Store previous price before updating
  asset.previousPrice = asset.price
  
  // Update price
  asset.price = price
  
  // Calculate percentage change
  const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
  
  // Apply threshold crossing logic to add new positions when thresholds are crossed
  addPositionWhenThresholdCrossed(asset, portfolio.upwardThreshold, portfolio.downwardThreshold)
  
  // Apply stop loss logic based on price changes
  applyStopLossLogic(asset, changePercentage, portfolio.stopLossThreshold)
  
  // Process next price after a small delay to allow UI updates
  setTimeout(() => {
    processNextPrice(nextIndex)
  }, 50) // Small delay for UI responsiveness
}

// Reinitialize the portfolio while preserving threshold values
function reinitialize(): void {
  // Reset assets array to empty
  portfolio.assets = []
  
  // Regenerate portfolio with current settings
  if (assetName.value && fileContent.value.length > 0) {
    processPrices()
  }
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
</script>

<template>
  <div class="container">
    <h1>File-Based Portfolio Simulation</h1>
    
    <div class="upload-section">
      <h2>Upload Price Data</h2>
      <input type="file" @change="handleFileUpload" accept=".txt">
      <input 
        v-model="assetName" 
        type="text" 
        placeholder="Asset Name" 
        style="margin-top: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      >
    </div>
    
    <div class="controls">
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
      
      <button @click="processPrices" :disabled="isProcessing">Process Prices</button>
      <button @click="reinitialize">Reinitialize</button>
      <button @click="isPaused = !isPaused" :disabled="!isProcessing">
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
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

.upload-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
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
  margin-left: 10px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
