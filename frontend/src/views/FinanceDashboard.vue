<template>
  <div>
    <h1>Financial Analytics</h1>
    <p>Monitor your fleet's financial health.</p>
    
    <div class="dashboard-grid">
      <div class="glass-card">
        <h3>Total Expenses</h3>
        <div class="stat-value">${{ stats.total_expenses?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="glass-card">
        <h3>Total Fuel Cost</h3>
        <div class="stat-value">${{ stats.total_fuel_cost?.toFixed(2) || '0.00' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'

const stats = ref({})

onMounted(async () => {
  try {
    stats.value = await apiFetch('/finance/dashboard')
  } catch (error) {
    console.error(error)
  }
})
</script>
