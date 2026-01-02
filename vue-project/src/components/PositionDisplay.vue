<script setup lang="ts">
import type { Position } from '../types/position'

defineProps<{
  position: Position
}>()
</script>

<template>
  <div :class="['position-card', { 'active': position.isActive }]">
    <div class="price-info">
      <p class="price-label">Opening Price</p>
      <p class="price-value">{{ position.openingPrice.toFixed(2) }}</p>
    </div>
    <div class="price-info">
      <p class="price-label">Stop Loss Price</p>
      <p class="price-value">{{ position.stopLossPrice.toFixed(2) }}</p>
    </div>
    <div class="status">
      <span :class="{ 'active': position.isActive, 'inactive': !position.isActive }">
        {{ position.isActive ? 'Active' : 'Closed' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.position-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.position-card.active {
  background-color: #d4edda; /* Light green for active positions */
}

.price-info {
  margin: 5px 0;
}

.price-label {
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #333;
  font-size: 14px;
}

.price-value {
  margin: 0;
  color: #2c7f2c;
  font-weight: bold;
  font-size: 16px;
}

.status {
  margin-top: 10px;
  text-align: right;
  font-size: 12px;
}

.status span.active {
  color: #28a745;
  font-weight: bold;
}

.status span.inactive {
  color: #dc3545;
  font-weight: bold;
}
</style>
