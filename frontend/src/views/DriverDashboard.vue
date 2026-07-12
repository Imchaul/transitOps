<template>
  <div>
    <h1>Driver Portal</h1>
    <p>View and manage your assigned trips.</p>
    
    <div class="dashboard-grid" style="margin-bottom: 2rem;">
      <div class="glass-card" style="text-align: center;">
        <h3>Total Earnings</h3>
        <div class="stat-value" style="color: #10b981; font-size: 2rem; font-weight: bold; margin-top: 0.5rem;">${{ stats.total_earnings?.toFixed(2) || '0.00' }}</div>
        <p style="color: var(--text-muted); font-size: 0.8rem;">Based on completed trips</p>
      </div>
      <div class="glass-card" style="text-align: center;">
        <h3>Total Fuel Logged</h3>
        <div class="stat-value" style="color: #ef4444; font-size: 2rem; font-weight: bold; margin-top: 0.5rem;">${{ stats.total_fuel_expenses?.toFixed(2) || '0.00' }}</div>
        <p style="color: var(--text-muted); font-size: 0.8rem;">Total fuel cost across all trips</p>
      </div>
    </div>
    
    <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
      <button :class="['tab-btn', activeTab === 'available' ? 'active' : '']" @click="activeTab = 'available'">Available Trips</button>
      <button :class="['tab-btn', activeTab === 'active' ? 'active' : '']" @click="activeTab = 'active'">Active Trip</button>
      <button :class="['tab-btn', activeTab === 'completed' ? 'active' : '']" @click="activeTab = 'completed'">Completed Trips</button>
    </div>
    
    <div v-if="activeTab === 'available'" class="dashboard-grid">
      <div class="glass-card" v-for="trip in availableTrips" :key="trip.trip_id">
        <h3>Trip #{{ trip.trip_id }} (Customer Preview)</h3>
        <p><strong>From:</strong> {{ trip.source }}</p>
        <p><strong>To:</strong> {{ trip.destination }}</p>
        <p><strong>Cargo Weight:</strong> {{ trip.cargo_weight }} kg</p>
        <p><strong>Planned Dist:</strong> {{ trip.planned_distance }} km</p>
        <p><strong>Status:</strong> <span style="color: var(--accent);">{{ trip.status }}</span></p>
        <div style="margin-top: 1rem;">
          <button @click="updateStatus(trip.trip_id, 'accept')" class="btn-primary">Accept Trip</button>
        </div>
      </div>
      <div v-if="availableTrips.length === 0" class="glass-card"><p>No available trips at this time.</p></div>
    </div>
    
    <div v-if="activeTab === 'active'" class="dashboard-grid">
      <div class="glass-card" v-for="trip in activeTrips" :key="trip.trip_id">
        <h3>Active Trip #{{ trip.trip_id }}</h3>
        <p><strong>From:</strong> {{ trip.source }} <strong>To:</strong> {{ trip.destination }}</p>
        <p><strong>Status:</strong> <span style="color: var(--accent);">{{ trip.status }}</span></p>
        
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button v-if="trip.status === 'ACCEPTED'" @click="updateStatus(trip.trip_id, 'start')" class="btn-primary" style="background: #10b981;">Start Trip</button>
          <button v-if="trip.status === 'IN_PROGRESS'" @click="updateStatus(trip.trip_id, 'complete')" class="btn-primary" style="background: #8b5cf6;">Complete Trip</button>
        </div>
        
        <!-- Expense & Fuel Forms for IN_PROGRESS and ACCEPTED trips -->
        <div v-if="trip.status === 'IN_PROGRESS' || trip.status === 'ACCEPTED'" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
          <h4>Log Fuel</h4>
          <form @submit.prevent="logFuel(trip.trip_id)" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input v-model="fuelForm.liters" type="number" step="0.1" placeholder="Liters" class="input-field" required style="padding: 0.5rem;" />
            <input v-model="fuelForm.cost" type="number" step="0.01" placeholder="Cost ($)" class="input-field" required style="padding: 0.5rem;" />
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem;">Save</button>
          </form>
          
          <h4>Log Expense (Parking, Tolls)</h4>
          <form @submit.prevent="logExpense(trip.trip_id)" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; gap: 0.5rem;">
              <select v-model="expenseForm.expense_type" class="input-field" required style="padding: 0.5rem; flex: 1;">
                <option value="Parking">Parking</option>
                <option value="Toll">Toll</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
              <input v-model="expenseForm.amount" type="number" step="0.01" placeholder="Amount ($)" class="input-field" required style="padding: 0.5rem; flex: 1;" />
            </div>
            <input v-model="expenseForm.description" type="text" placeholder="Description (Optional)" class="input-field" style="padding: 0.5rem;" />
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; align-self: flex-start;">Save</button>
          </form>
        </div>
      </div>
      <div v-if="activeTrips.length === 0" class="glass-card"><p>No active trips.</p></div>
    </div>
    
    <div v-if="activeTab === 'completed'" class="dashboard-grid">
      <div class="glass-card" v-for="trip in completedTrips" :key="trip.trip_id">
        <h3>Trip #{{ trip.trip_id }}</h3>
        <p><strong>From:</strong> {{ trip.source }}</p>
        <p><strong>To:</strong> {{ trip.destination }}</p>
        <p><strong>Status:</strong> <span style="color: var(--accent);">{{ trip.status }}</span></p>
      </div>
      <div v-if="completedTrips.length === 0" class="glass-card"><p>No completed trips.</p></div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiFetch } from '../api'

const activeTab = ref('available')
const trips = ref([])
const stats = ref({})

const fuelForm = ref({ liters: '', cost: '' })
const expenseForm = ref({ expense_type: 'Parking', amount: '', description: '' })

const availableTrips = computed(() => trips.value.filter(t => t.status === 'PENDING_ACCEPTANCE'))
const activeTrips = computed(() => trips.value.filter(t => ['ACCEPTED', 'IN_PROGRESS', 'PENDING_REVIEW'].includes(t.status)))
const completedTrips = computed(() => trips.value.filter(t => t.status === 'COMPLETED'))

const loadTrips = async () => {
  try {
    trips.value = await apiFetch('/driver/trips/assigned')
    stats.value = await apiFetch('/driver/stats')
  } catch (error) {
    console.error(error)
  }
}

const updateStatus = async (id, action) => {
  try {
    await apiFetch(`/driver/trips/${id}/${action}`, { method: 'PUT' })
    await loadTrips()
    if (action === 'accept') activeTab.value = 'active'
    if (action === 'complete') activeTab.value = 'active' // Stays in active because it's PENDING_REVIEW
  } catch (error) {
    alert(error.message)
  }
}

const logFuel = async (trip_id) => {
  try {
    await apiFetch(`/driver/trips/${trip_id}/fuel`, {
      method: 'POST',
      body: JSON.stringify(fuelForm.value)
    })
    alert('Fuel logged successfully')
    fuelForm.value = { liters: '', cost: '' }
    await loadTrips() // Refresh stats
  } catch (error) {
    alert(error.message)
  }
}

const logExpense = async (trip_id) => {
  try {
    await apiFetch(`/driver/trips/${trip_id}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseForm.value)
    })
    alert('Expense logged successfully')
    expenseForm.value = { expense_type: 'Parking', amount: '', description: '' }
  } catch (error) {
    alert(error.message)
  }
}

onMounted(loadTrips)
</script>

<style scoped>
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--text);
  background: rgba(255,255,255,0.05);
}
.tab-btn.active {
  color: var(--text);
  background: rgba(255,255,255,0.1);
  font-weight: bold;
}
</style>
