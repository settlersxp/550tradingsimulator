<template>
  <div class="ohlc-simulation">
    <h2>OHLC File-Based Simulation</h2>
    
    <!-- File Upload Interface -->
    <div class="file-upload-section">
      <h3>Upload OHLC Data File</h3>
      <div 
        class="drop-zone" 
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
        @click="triggerFileSelect"
      >
        <p v-if="!selectedFile">Drag & drop your OHLC file here or click to browse</p>
        <p v-else>{{ selectedFile.name }}</p>
        <input 
          ref="fileInput" 
          type="file" 
          accept=".csv,.tsv" 
          @change="handleFileSelect"
          style="display: none;"
        />
      </div>
      
      <div class="file-validation">
        <div v-if="validationError" class="error">{{ validationError }}</div>
        <div v-else-if="isValidFile" class="success">Valid OHLC file</div>
      </div>
    </div>

    <!-- Simulation Controls -->
    <div class="simulation-controls" v-if="isValidFile">
      <button @click="startSimulation" :disabled="isSimulating">Start Simulation</button>
      <button @click="pauseSimulation" :disabled="!isSimulating">Pause</button>
      <button @click="resetSimulation">Reset</button>
    </div>

    <!-- Asset Display -->
    <div class="asset-display" v-if="currentAsset">
      <h3>Current Asset: {{ currentAsset.symbol }}</h3>
      <div class="price-info">
        <p>Open: {{ currentAsset.open }}</p>
        <p>High: {{ currentAsset.high }}</p>
        <p>Low: {{ currentAsset.low }}</p>
        <p>Close: {{ currentAsset.close }}</p>
        <p>Current Price: {{ currentAsset.currentPrice }}</p>
      </div>
    </div>

    <!-- Simulation Progress -->
    <div class="simulation-progress" v-if="isSimulating || simulationComplete">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <p>Day {{ currentDay }} of {{ totalDays }}</p>
    </div>

    <!-- Simulation Results -->
    <div class="simulation-results" v-if="simulationComplete">
      <h3>Simulation Complete</h3>
      <p>Total days processed: {{ totalDays }}</p>
      <p>Final portfolio value: {{ finalPortfolioValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { parseOHLCData, isValidOHLCFile } from '../utils/OHLCProcessor'
import { addPositionWhenThresholdCrossed, applyStopLossLogic, openNewPosition } from '../portfolioLogic'

// Define props
const props = defineProps<{
  // Add any props needed for the component
}>()

// Define emits
const emit = defineEmits<{
  (e: 'simulation-started'): void
  (e: 'simulation-paused'): void
  (e: 'simulation-completed', results: any): void
}>()

// Reactive data
const selectedFile = ref<File | null>(null)
const validationError = ref<string | null>(null)
const isValidFile = ref(false)
const isSimulating = ref(false)
const simulationComplete = ref(false)
const currentDay = ref(0)
const totalDays = ref(0)
const progressPercentage = ref(0)
const currentAsset = ref<any>(null)
const finalPortfolioValue = ref(0)

// Simulation state
let simulationInterval: any = null
let ohlcData: any[] = []
let portfolioState: any = {}

// File handling methods
const triggerFileSelect = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
  fileInput?.click();
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    if (selectedFile.value) {
      validateAndParseFile(selectedFile.value)
    }
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    if (selectedFile.value) {
      validateAndParseFile(selectedFile.value)
    }
  }
}

const validateAndParseFile = (file: File) => {
  validationError.value = null
  isValidFile.value = false
  
  // Check file extension
  const validExtensions = ['.csv', '.tsv']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!validExtensions.includes(fileExtension)) {
    validationError.value = 'Invalid file format. Please upload a CSV or TSV file.'
    return
  }
  
  // Read and parse the file
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      ohlcData = parseOHLCData(content, fileExtension)
      
      if (ohlcData.length === 0) {
        validationError.value = 'No valid OHLC data found in the file.'
        return
      }
      
      isValidFile.value = true
      totalDays.value = ohlcData.length
      
      // Initialize portfolio state
      portfolioState = {
        positions: [],
        cash: 10000, // Starting with $10,000
        value: 10000,
        history: []
      }
      
    } catch (error) {
      validationError.value = `Error parsing file: ${error}`
    }
  }
  
  reader.onerror = () => {
    validationError.value = 'Error reading file'
  }
  
  reader.readAsText(file)
}

// Simulation methods
const startSimulation = () => {
  if (!isValidFile.value || isSimulating.value) return
  
  isSimulating.value = true
  simulationComplete.value = false
  currentDay.value = 0
  progressPercentage.value = 0
  
  emit('simulation-started')
  
  // Start simulation immediately 
  simulateNextDay()
}

const pauseSimulation = () => {
  if (!isSimulating.value) return
  
  isSimulating.value = false
  clearInterval(simulationInterval)
  
  emit('simulation-paused')
}

const resetSimulation = () => {
  isSimulating.value = false
  simulationComplete.value = false
  currentDay.value = 0
  progressPercentage.value = 0
  clearInterval(simulationInterval)
  
  // Reset portfolio state
  portfolioState = {
    positions: [],
    cash: 10000,
    value: 10000,
    history: []
  }
}

const simulateNextDay = () => {
  if (currentDay.value >= totalDays.value) {
    completeSimulation()
    return
  }
  
  const dayData = ohlcData[currentDay.value]
  
  // Create a proper asset object for this day's data
  const asset = {
    name: `Asset-${currentDay.value + 1}`,
    price: dayData.close,
    displayPrice: dayData.close,
    previousPrice: currentDay.value > 0 ? ohlcData[currentDay.value - 1].close : dayData.open,
    positions: portfolioState.positions || [],
    highestOpeningPrice: portfolioState.highestOpeningPrice || dayData.open,
    trendReversed: portfolioState.trendReversed || false,
    trendReversalPercentage: 10, // Default value
    reverseTrendTriggerValue: portfolioState.reverseTrendTriggerValue,
    initialReverseTrendTriggerValue: portfolioState.initialReverseTrendTriggerValue,
    initialUptrendValue: portfolioState.initialUptrendValue
  }
  
  currentAsset.value = { ...dayData, symbol: asset.name }
  
  // Simulate price movement from open to close in 0.5 increments
  simulatePriceMovement(dayData)
  
  // Calculate percentage change for stop loss logic
  const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
  
  // Apply threshold crossing logic
  addPositionWhenThresholdCrossed(asset, 5, 50) // Using default thresholds
  
  // Apply stop loss logic
  applyStopLossLogic(asset, changePercentage, 3) // Using default thresholds
  
  // Update portfolio state with the modified asset
  portfolioState = {
    ...portfolioState,
    positions: asset.positions,
    highestOpeningPrice: asset.highestOpeningPrice,
    trendReversed: asset.trendReversed,
    reverseTrendTriggerValue: asset.reverseTrendTriggerValue,
    initialReverseTrendTriggerValue: asset.initialReverseTrendTriggerValue,
    initialUptrendValue: asset.initialUptrendValue
  }
  
  currentDay.value++
  progressPercentage.value = (currentDay.value / totalDays.value) * 100
  
  if (isSimulating.value) {
    setTimeout(simulateNextDay, 500) // Simulate delay between days
  }
}

const simulatePriceMovement = (dayData: any) => {
  // Create price movement from open to close in 0.5 increments
  const { open, close } = dayData
  const increment = 0.5
  const steps = Math.abs(close - open) / increment
  
  // For now, we'll just set the current price to the close value
  // In a more detailed implementation, this would simulate intermediate price movements
  currentAsset.value.currentPrice = close
}

const completeSimulation = () => {
  isSimulating.value = false
  simulationComplete.value = true
  finalPortfolioValue.value = portfolioState.value
  
  emit('simulation-completed', {
    totalDays: totalDays.value,
    finalPortfolioValue: portfolioState.value,
    results: portfolioState
  })
}

// Lifecycle hooks
onMounted(() => {
  // Component mounted
})
</script>

<style scoped>
.ohlc-simulation {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.file-upload-section {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.drop-zone {
  padding: 30px;
  text-align: center;
  border: 2px dashed #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.file-validation {
  margin-top: 10px;
}

.error {
  color: red;
  font-weight: bold;
}

.success {
  color: green;
  font-weight: bold;
}

.simulation-controls {
  margin: 20px 0;
  text-align: center;
}

.simulation-controls button {
  margin: 0 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.simulation-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.asset-display {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.price-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.simulation-progress {
  margin: 20px 0;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.simulation-results {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f8f9fa;
}
</style>
