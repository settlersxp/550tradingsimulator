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

// Portfolio data structure
import type { Portfolio } from '../types/portfolio'

// Import the PositionDisplay component
import AssetCard from './AssetCard.vue'
import PriceControls from './PriceControls.vue'
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

// Generate or update portfolio assets
function generatePortfolio(): void {
  const currentAssetCount = portfolio.assets.length
  const targetAssetCount = numberOfAssets.value
  
  if (targetAssetCount > currentAssetCount) {
    // Increasing number of assets - add new ones only
    for (let i = currentAssetCount; i < targetAssetCount; i++) {
      const assetName = generateRandomWord()
      const initialPrice = 100
      
      const newAsset = {
        name: assetName,
        price: initialPrice,
        displayPrice: initialPrice,
        previousPrice: initialPrice,
        positions: [],
        highestOpeningPrice: initialPrice,
        trendReversed: false,
        trendReversalPercentage: 10
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
</script>

<template>
  <div class="container">
    <h1>Portfolio Simulation Application</h1>
    
    <PriceControls 
      :portfolio="portfolio"
      @reinitialize="reinitialize"
      @prices-changed="onPricesChanged"
    />
    
    <div class="portfolio-info">
      <h2>Closed Positions: ${{ getClosedPositionsValue().toFixed(2) }}</h2>
      <h2>Active Positions: ${{ getActivePositionsValue().toFixed(2) }}</h2>
      <h2>Total: ${{ getTotalValue().toFixed(2) }}</h2>
    </div>
    
    <div class="assets-container">
      <AssetCard 
        v-for="asset in portfolio.assets" 
        :key="`asset-${Math.random().toString(36).substring(2, 11)}`" 
        :asset="asset"
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

.portfolio-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #e8f5e8;
  border-radius: 8px;
  text-align: center;
}

.assets-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

</style>
