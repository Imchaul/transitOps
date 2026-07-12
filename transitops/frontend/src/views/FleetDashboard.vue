<template>
  <div>
    <h1>Fleet Manager Dashboard</h1>
    <p>Monitor your active vehicles and trips.</p>
    
    <div class="dashboard-grid">
      <div class="glass-card">
        <h3>Total Vehicles</h3>
        <div class="stat-value">{{ stats.total_vehicles || 0 }}</div>
      </div>
      <div class="glass-card">
        <h3>Active Trips</h3>
        <div class="stat-value">{{ stats.active_trips || 0 }}</div>
      </div>
      <div class="glass-card">
        <h3>In Maintenance</h3>
        <div class="stat-value" style="color: #ef4444;">{{ stats.vehicles_in_maintenance || 0 }}</div>
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
    stats.value = await apiFetch('/fleet/dashboard')
  } catch (error) {
    console.error(error)
  }
})
</script>
