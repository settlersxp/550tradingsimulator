# OHLC Processing Implementation

## Overview

This document describes the implementation of OHLC (Open, High, Low, Close) file processing for the trading simulation system. The system now supports loading historical price data from OHLC files instead of generating random prices, allowing for more realistic simulations based on actual market data.

## File Format Specification

The OHLC files must follow a specific format with 5 columns:
1. Date (format: YYYY-MM-DD or MM/DD/YYYY)
2. Open price (numeric value)
3. High price (numeric value) 
4. Low price (numeric value)
5. Close price (numeric value)

Each row represents one trading day's worth of price data.

## Implementation Details

### OHLCFileSimulation Component

The main component for OHLC-based simulation is `OHLCFileSimulation.vue`. This component provides:

1. File upload interface for OHLC data
2. Price movement simulation from open to close in 0.5 increments
3. Integration with existing portfolio logic (threshold crossing, stop loss management)
4. Single asset display during simulation
5. Standalone web page accessible via new route

### Data Processing Flow

1. **File Parsing**: The component parses uploaded OHLC files and validates the format
2. **Data Validation**: Ensures all required columns are present and contain valid numeric data
3. **Sequential Processing**: Processes each day's OHLC data in order from oldest to newest
4. **Price Simulation**: For each day, simulates price movements from open to close in 0.5 increments
5. **Logic Application**: Applies existing threshold crossing and stop loss logic after each price update
6. **State Management**: Maintains portfolio state between days

### Price Movement Simulation Logic

For each day's OHLC data:
1. Calculate the difference between open and close prices
2. Determine direction of movement (up or down)
3. Simulate price movements in 0.5 increment steps from open to close
4. Apply threshold crossing and stop loss logic after each step
5. Update portfolio state with each simulated price change

### Integration with Portfolio Logic

The simulation integrates with existing functions:
- `addPositionWhenThresholdCrossed()`: Applied after each price movement to add new positions when thresholds are crossed
- `applyStopLossLogic()`: Applied after each price movement to manage stop loss prices and close positions when needed
- All existing portfolio state management is maintained between days

## Technical Specifications

### Component Structure

The OHLCFileSimulation component follows the same patterns as other Vue components in the project:
- Uses Vue 3 Composition API (`<script setup lang="ts">`)
- Reactive data structures for managing simulation state
- Integration with existing asset and position types
- Proper TypeScript typing throughout

### Error Handling

The implementation includes comprehensive error handling:
- File format validation
- Data type checking for numeric values
- Date parsing validation
- Graceful error messages for users
- Logging of processing errors for debugging

## Usage Instructions

1. Navigate to the OHLC Simulation page (new standalone route)
2. Upload an OHLC file using the file picker or drag-and-drop
3. Configure simulation parameters (thresholds) as needed
4. Click "Process Prices" to start simulation
5. Monitor the single asset's performance throughout the simulation
6. Use controls to pause/resume/reset the simulation

## Testing Considerations

The implementation should be tested with:
- Valid OHLC files with various date formats
- Files with different numbers of rows (single day, multiple days)
- Edge cases like identical open/close prices
- Invalid file formats and data types
- Integration with existing portfolio logic functions
