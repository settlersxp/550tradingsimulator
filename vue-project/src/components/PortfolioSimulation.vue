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
        previousPrice: initialPrice,
        positions: [],
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
    addPositionWhenThresholdCrossed(asset, portfolio.upwardThreshold, portfolio.downwardThreshold);
    
    // Apply stop loss logic based on price changes
    applyStopLossLogic(asset, changePercentage, portfolio.stopLossThreshold);
  })
  
  generatePortfolio()
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
</script>

<template>
  <div class="container">
    <h1>Portfolio Simulation Application</h1>
    
    <PriceControls 
      :portfolio="portfolio"
      @generate="updatePortfolio"
      @reinitialize="reinitialize"
    />
    
    <div class="portfolio-info">
      <h2>Closed Positions: ${{ getClosedPositionsValue().toFixed(2) }}</h2>
      <h2>Active Positions: ${{ getActivePositionsValue().toFixed(2) }}</h2>
      <h2>Total: ${{ getTotalValue().toFixed(2) }}</h2>
    </div>
    
    <div class="assets-container">
      <AssetCard 
        v-for="asset in portfolio.assets" 
        :key="asset.name + '-' + Math.random()" 
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
