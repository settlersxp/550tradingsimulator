<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { 
  generateRandomWord,
  addPositionWhenThresholdCrossed,
  applyStopLossLogic,
  calculateTotalValue,
  calculateActivePositionsValue,
  calculateClosedPositionsValue,
  openNewPosition
 } from '../portfolioLogic'

// Import the ActionHistory for debugging purposes
import { ActionHistory } from '../history/ActionHistory'

// Portfolio data structure
import type { Portfolio } from '../types/portfolio'

// Import the PositionDisplay component
import AssetCard from './AssetCard.vue'
import PriceControls from './PriceControls.vue'
import AssetDetailView from './AssetDetailView.vue'
import type { Asset } from '@/types/asset'

// Reactive portfolio state
const portfolio = reactive<Portfolio>({
  assets: [],
  upwardThreshold: 5,
  downwardThreshold: 50,
  stopLossThreshold: 3
})

// Number of assets to generate
const numberOfAssets = ref(5)

// State for showing detail view
const showDetailView = ref(false)
const selectedAsset = ref<Asset | null>(null)

// Generate or update portfolio assets
function generatePortfolio(): void {
  const currentAssetCount = portfolio.assets.length
  const targetAssetCount = numberOfAssets.value
  
  if (targetAssetCount > currentAssetCount) {
    // Increasing number of assets - add new ones only
    for (let i = currentAssetCount; i < targetAssetCount; i++) {
      const assetName = generateRandomWord()
      const initialPrice = 100
      
      const newAsset: Asset = {
        name: assetName,
        price: initialPrice,
        displayPrice: initialPrice,
        previousPrice: initialPrice,
        positions: [],
        highestOpeningPrice: initialPrice,
        trendReversed: false,
        trendReversalPercentage: 10,
        initialReverseTrendTriggerValue: initialPrice
      }
      
      portfolio.assets.push(newAsset)
      openNewPosition(newAsset)
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


// Process individual asset updates (to be called automatically when prices change)
function processAssetUpdates(asset: Asset): void {
  // Store original previous price before processing
  const originalPreviousPrice = asset.previousPrice;
  
  // Calculate percentage change using the original previous price
  const changePercentage = ((asset.price - originalPreviousPrice) / originalPreviousPrice) * 100;
  
  // Apply threshold crossing logic to add new positions when thresholds are crossed
  addPositionWhenThresholdCrossed(asset, portfolio.upwardThreshold, portfolio.downwardThreshold);
  
  // Apply stop loss logic based on price changes
  applyStopLossLogic(asset, changePercentage, portfolio.stopLossThreshold);

  // Update display price to lag by one step - this ensures display shows the value from the previous processing cycle
  asset.displayPrice = asset.previousPrice;

  // Store previous price after processing (this should be the current price)
  asset.previousPrice = asset.price;
}

// Reinitialize the portfolio while preserving threshold values
function reinitialize(): void {
  // Reset assets array to empty
  portfolio.assets = [];
  
  // Regenerate portfolio with current settings
  generatePortfolio();
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

// Debounced function to handle price changes efficiently
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 1; // debounce delay

// Handle price changes automatically with debouncing 
function onPricesChanged(): void {
  // Clear previous timer if exists
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Set new timer to process all changes after the debounce period
  debounceTimer = setTimeout(() => {
    try {      
      // Process each asset when prices change
      portfolio.assets.forEach(asset => {
        processAssetUpdates(asset)
      })
      
      // Also regenerate portfolio in case number of assets changed
      generatePortfolio();
    } catch (error) {
      console.error('Error processing price changes:', error);
    }
  }, DEBOUNCE_DELAY);
}

// Handle asset count changes from PriceControls component
function handleAssetCountChange(newCount: number): void {
  if (newCount >= 1 && newCount <= 50) {
    numberOfAssets.value = newCount;
  }
}

// Function to export action history for debugging
function exportHistory(): void {
  const history = ActionHistory.getInstance();
  console.log("Action History:", history.exportAsJson());
  // Also copy to clipboard for easy paste
  navigator.clipboard.writeText(history.exportAsText()).then(() => {
    console.log("History copied to clipboard!");
  });
}

// Handle export history event from PriceControls
function handleExportHistory(): void {
  exportHistory();
}

// Method to show asset detail view
function showAssetDetail(asset: Asset): void {
  selectedAsset.value = asset;
  showDetailView.value = true;
}
</script>

<template>
  <div class="container">
    <h1>Portfolio Simulation Dashboard</h1>
    
    <PriceControls 
      :portfolio="portfolio"
      @reinitialize="reinitialize"
      @prices-changed="onPricesChanged"
      @asset-count-change="handleAssetCountChange"
      @export-history="handleExportHistory"
    />
    
    <!-- Portfolio Summary Section -->
    <div class="portfolio-summary">
      <div class="summary-card">
        <h2>Portfolio Value</h2>
        <p class="value">${{ getTotalValue().toFixed(2) }}</p>
      </div>
      
      <div class="summary-card">
        <h2>Active Positions</h2>
        <p class="value">${{ getActivePositionsValue().toFixed(2) }}</p>
      </div>
      
      <div class="summary-card">
        <h2>Closed Positions</h2>
        <p class="value">${{ getClosedPositionsValue().toFixed(2) }}</p>
      </div>
    </div>
    
    <!-- Assets Grid -->
    <div class="assets-container">
      <h2>Assets</h2>
      <AssetCard 
        v-for="asset in portfolio.assets" 
        :key="`asset-${Math.random().toString(36).substring(2, 11)}`" 
        :asset="asset"
        @show-detail="showAssetDetail"
      />
    </div>
    
    <!-- Asset Detail View -->
    <div v-if="showDetailView && selectedAsset" class="asset-detail-container">
      <AssetDetailView 
        :asset="selectedAsset"
        @close="showDetailView = false"
      />
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

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.summary-card h2 {
  margin-top: 0;
  color: #495057;
  font-size: 1.1em;
}

.value {
  font-size: 1.5em;
  font-weight: bold;
  color: #212529;
  margin: 10px 0 0 0;
}

.assets-container {
  margin-top: 30px;
}

.assets-container h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.assets-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.asset-detail-container {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .portfolio-summary {
    grid-template-columns: 1fr;
  }
  
  .assets-container {
    grid-template-columns: 1fr;
  }
}
</style>
