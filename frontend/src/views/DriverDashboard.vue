<template>
  <div>
    <h1>Driver Portal</h1>
    <p>View and manage your assigned trips.</p>
    
    <div class="dashboard-grid">
      <div class="glass-card" v-for="trip in trips" :key="trip.trip_id">
        <h3>Trip #{{ trip.trip_id }}</h3>
        <p><strong>From:</strong> {{ trip.source }}</p>
        <p><strong>To:</strong> {{ trip.destination }}</p>
        <p><strong>Status:</strong> <span style="color: var(--accent);">{{ trip.status }}</span></p>
        
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button v-if="trip.status === 'PENDING_ACCEPTANCE'" @click="updateStatus(trip.trip_id, 'accept')" class="btn-primary">Accept</button>
          <button v-if="trip.status === 'ACCEPTED'" @click="updateStatus(trip.trip_id, 'start')" class="btn-primary" style="background: #10b981;">Start Trip</button>
          <button v-if="trip.status === 'IN_PROGRESS'" @click="updateStatus(trip.trip_id, 'complete')" class="btn-primary" style="background: #8b5cf6;">Complete</button>
        </div>
      </div>
      <div v-if="trips.length === 0" class="glass-card">
        <p>No trips assigned currently.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'

const trips = ref([])

const loadTrips = async () => {
  try {
    trips.value = await apiFetch('/driver/trips/assigned')
  } catch (error) {
    console.error(error)
  }
}

const updateStatus = async (id, action) => {
  try {
    await apiFetch(`/driver/trips/${id}/${action}`, { method: 'PUT' })
    await loadTrips()
  } catch (error) {
    alert(error.message)
  }
}

onMounted(loadTrips)
</script>
