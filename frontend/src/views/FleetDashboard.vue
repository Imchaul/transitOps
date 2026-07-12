<template>
  <div class="fleet-dashboard">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <h1>Fleet Control Console</h1>
        <p style="margin-bottom: 0;">Monitor vehicles, driver assignments, and log maintenance activities.</p>
      </div>
      <div v-if="successMessage" class="toast-banner success">{{ successMessage }}</div>
      <div v-if="error" class="toast-banner error">{{ error }}</div>
    </div>

    <!-- Tab navigation -->
    <div class="tabs-nav">
      <button @click="activeTab = 'overview'" :class="['tab-btn', { active: activeTab === 'overview' }]">
        <span class="tab-icon">📊</span> Overview
      </button>
      <button @click="activeTab = 'vehicles'" :class="['tab-btn', { active: activeTab === 'vehicles' }]">
        <span class="tab-icon">🚚</span> Vehicles
      </button>
      <button @click="activeTab = 'drivers'" :class="['tab-btn', { active: activeTab === 'drivers' }]">
        <span class="tab-icon">👤</span> Drivers
      </button>
      <button @click="activeTab = 'trips'" :class="['tab-btn', { active: activeTab === 'trips' }]">
        <span class="tab-icon">🗺️</span> Trip Assignments
      </button>
      <button @click="activeTab = 'maintenance'" :class="['tab-btn', { active: activeTab === 'maintenance' }]">
        <span class="tab-icon">🔧</span> Maintenance Logs
      </button>
    </div>

    <!-- TAB 1: OVERVIEW -->
    <div v-if="activeTab === 'overview'" class="tab-content">
      <div class="dashboard-grid">
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span>Total Vehicles</span>
            <span class="stat-icon">🚚</span>
          </div>
          <div class="stat-value">{{ stats.total_vehicles || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span>Active Trips</span>
            <span class="stat-icon">🛣️</span>
          </div>
          <div class="stat-value" style="color: #3b82f6;">{{ stats.active_trips || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span>In Maintenance</span>
            <span class="stat-icon">🔧</span>
          </div>
          <div class="stat-value" style="color: #f59e0b;">{{ stats.vehicles_in_maintenance || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span>Pending Acceptance</span>
            <span class="stat-icon">⏳</span>
          </div>
          <div class="stat-value" style="color: #a78bfa;">{{ stats.pending_trips || 0 }}</div>
        </div>
      </div>

      <!-- Quick Summary Lists -->
      <div class="dashboard-grid" style="margin-top: 2rem;">
        <div class="glass-card">
          <h3>Active Fleet Alerts</h3>
          <ul class="alerts-list">
            <li v-for="vehicle in inMaintenanceVehicles" :key="vehicle.vehicle_id">
              <span class="alert-badge warning">In Maintenance</span>
              <strong>{{ vehicle.vehicle_name }}</strong> ({{ vehicle.registration_number }}) is currently undergoing repair.
            </li>
            <li v-for="vehicle in retiredVehicles" :key="vehicle.vehicle_id">
              <span class="alert-badge error">Out of Service</span>
              <strong>{{ vehicle.vehicle_name }}</strong> ({{ vehicle.registration_number }}) is retired or out of service.
            </li>
            <li v-if="inMaintenanceVehicles.length === 0 && retiredVehicles.length === 0">
              <span class="alert-badge success">All Clear</span> All operational fleet vehicles are available or on active routes.
            </li>
          </ul>
        </div>
        <div class="glass-card">
          <h3>Recent Operations</h3>
          <div class="recent-trips-list">
            <div v-for="trip in trips.slice(0, 3)" :key="trip.trip_id" class="recent-trip-item">
              <div class="trip-route">
                <strong>{{ trip.source }}</strong> → <strong>{{ parseDestination(trip.destination).name }}</strong>
              </div>
              <div class="trip-meta-info">
                <span>Driver: {{ trip.driver_name }}</span> | <span>Status: <b style="color: var(--accent);">{{ trip.status }}</b></span>
              </div>
            </div>
            <div v-if="trips.length === 0" style="color: var(--text-muted);">No active trip assignments logged.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: VEHICLES -->
    <div v-if="activeTab === 'vehicles'" class="tab-content">
      <div class="action-bar">
        <input v-model="vehicleSearch" type="text" placeholder="Search registration, name, type..." class="search-input" />
        <button @click="openAddVehicle" class="btn-primary" style="width: auto;">+ Add Vehicle</button>
      </div>

      <div class="glass-card" style="padding: 0; overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vehicle Name</th>
              <th>Reg Number</th>
              <th>Type / Capacity</th>
              <th>Status</th>
              <th>Current Assignment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vehicle in filteredVehicles" :key="vehicle.vehicle_id">
              <td>
                <div style="font-weight: 600;">{{ vehicle.vehicle_name }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">{{ vehicle.manufacturer }} {{ vehicle.model }} ({{ vehicle.year }})</div>
              </td>
              <td><code>{{ vehicle.registration_number }}</code></td>
              <td>
                <div>{{ vehicle.vehicle_type }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Max capacity: {{ vehicle.max_load_capacity }} kg</div>
              </td>
              <td>
                <span :class="['badge', vehicle.status.toLowerCase()]">{{ vehicle.status }}</span>
              </td>
              <td>
                <div v-if="vehicle.assigned_driver_name">
                  👤 {{ vehicle.assigned_driver_name }}
                  <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Trip #{{ vehicle.active_trip_id }} ({{ vehicle.active_trip_status }})</span>
                </div>
                <div v-else style="color: var(--text-muted); font-size: 0.9rem;">—</div>
              </td>
              <td>
                <div class="table-actions">
                  <button @click="openEditVehicle(vehicle)" class="btn-action">Edit</button>
                  <button v-if="vehicle.status === 'AVAILABLE'" @click="openLogMaintenance(vehicle)" class="btn-action secondary">🔧 Log Mainten.</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredVehicles.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No vehicles found matching the search criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: DRIVERS -->
    <div v-if="activeTab === 'drivers'" class="tab-content">
      <div class="action-bar">
        <input v-model="driverSearch" type="text" placeholder="Search driver name, phone, email..." class="search-input" />
      </div>

      <div class="glass-card" style="padding: 0; overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Contact</th>
              <th>License Details</th>
              <th>Status</th>
              <th>Current Assignment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="driver in filteredDrivers" :key="driver.driver_id">
              <td>
                <div style="font-weight: 600;">{{ driver.driver_name }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">{{ driver.email }}</div>
              </td>
              <td>{{ driver.phone_number }}</td>
              <td>
                <div><code>{{ driver.license_number }}</code></div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Expires: {{ driver.license_expiry }}</div>
              </td>
              <td>
                <span :class="['badge', driver.status.toLowerCase()]">{{ driver.status }}</span>
              </td>
              <td>
                <div v-if="driver.active_trip_id">
                  📍 {{ driver.active_trip_source }} → {{ parseDestination(driver.active_trip_destination).name }}
                  <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Vehicle: {{ driver.active_vehicle_registration }}</span>
                </div>
                <div v-else style="color: var(--text-muted); font-size: 0.9rem;">—</div>
              </td>
            </tr>
            <tr v-if="filteredDrivers.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No drivers found matching the search criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: TRIPS -->
    <div v-if="activeTab === 'trips'" class="tab-content">
      <div class="action-bar">
        <input v-model="tripSearch" type="text" placeholder="Search source, destination, driver..." class="search-input" />
        <button @click="showAssignTripModal = true" class="btn-primary" style="width: auto;">+ Assign Trip</button>
      </div>

      <div class="glass-card" style="padding: 0; overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Route</th>
              <th>Details</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in filteredTrips" :key="trip.trip_id">
              <td><code>#{{ trip.trip_id }}</code></td>
              <td>
                <div><strong>From:</strong> {{ trip.source }}</div>
                <div><strong>To:</strong> {{ parseDestination(trip.destination).name }}</div>
              </td>
              <td>
                <div style="font-size: 0.85rem; color: var(--text-main);">
                  📅 Date: {{ parseDestination(trip.destination).date || 'Not scheduled' }}
                </div>
                <div style="font-size: 0.85rem; margin-top: 0.2rem;">
                  <span :class="['priority-badge', parseDestination(trip.destination).priority.toLowerCase()]">
                    {{ parseDestination(trip.destination).priority }} Priority
                  </span>
                </div>
                <div v-if="parseDestination(trip.destination).notes" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; font-style: italic;">
                  "{{ parseDestination(trip.destination).notes }}"
                </div>
              </td>
              <td>
                <div>{{ trip.driver_name }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">{{ trip.driver_email }}</div>
              </td>
              <td>
                <div>{{ trip.vehicle_name }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);"><code>{{ trip.registration_number }}</code></div>
              </td>
              <td>
                <span :class="['badge', trip.status.toLowerCase()]">{{ trip.status }}</span>
              </td>
            </tr>
            <tr v-if="filteredTrips.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No trip records logged.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 5: MAINTENANCE -->
    <div v-if="activeTab === 'maintenance'" class="tab-content">
      <div class="action-bar">
        <input v-model="maintenanceSearch" type="text" placeholder="Search maintenance logs..." class="search-input" />
      </div>

      <div class="glass-card" style="padding: 0; overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Task Details</th>
              <th>Technician / Cost</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredMaintenance" :key="log.maintenance_id">
              <td>
                <strong>{{ log.vehicle_name }}</strong>
                <div style="font-size: 0.85rem; color: var(--text-muted);"><code>{{ log.registration_number }}</code></div>
              </td>
              <td>
                <div style="font-weight: 600;">{{ log.title }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Notes: {{ parseMaintenanceDesc(log.description).notes }}</div>
                <div style="font-size: 0.85rem; margin-top: 0.15rem; color: var(--accent);">Type: {{ parseMaintenanceDesc(log.description).type }}</div>
              </td>
              <td>
                <div>👤 {{ parseMaintenanceDesc(log.description).technician }}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: #10b981;">Cost: ${{ parseMaintenanceDesc(log.description).cost }}</div>
              </td>
              <td>{{ parseMaintenanceDesc(log.description).date || new Date(log.created_at).toLocaleDateString() }}</td>
              <td>
                <span :class="['badge', log.status.toLowerCase()]">{{ log.status }}</span>
              </td>
              <td>
                <button v-if="log.status === 'ACTIVE'" @click="completeMaintenanceRecord(log.maintenance_id)" class="btn-primary" style="padding: 0.4rem 0.8rem; width: auto; font-size: 0.85rem; background: #10b981;">
                  Complete Task
                </button>
                <span v-else style="color: var(--text-muted); font-size: 0.9rem;">
                  Done ({{ log.completed_at ? new Date(log.completed_at).toLocaleDateString() : 'N/A' }})
                </span>
              </td>
            </tr>
            <tr v-if="filteredMaintenance.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No maintenance logs registered.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: ADD/EDIT VEHICLE -->
    <div v-if="showAddVehicleModal || showEditVehicleModal" class="modal-overlay">
      <div class="glass-card modal-content">
        <h2>{{ showEditVehicleModal ? 'Edit Vehicle Details' : 'Add New Fleet Vehicle' }}</h2>
        <form @submit.prevent="saveVehicle">
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle Name</label>
              <input v-model="vehicleForm.vehicle_name" type="text" placeholder="e.g. Truck Alpha" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Registration Number</label>
              <input v-model="vehicleForm.registration_number" type="text" placeholder="e.g. ABC-1234" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Manufacturer</label>
              <input v-model="vehicleForm.manufacturer" type="text" placeholder="e.g. Ford" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Model</label>
              <input v-model="vehicleForm.model" type="text" placeholder="e.g. F-150" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle Type</label>
              <select v-model="vehicleForm.vehicle_type" class="input-field" required>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="HEAVY_TRUCK">Heavy Truck</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fuel Type</label>
              <select v-model="vehicleForm.fuel_type" class="input-field" required>
                <option value="DIESEL">Diesel</option>
                <option value="PETROL">Petrol</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Year</label>
              <input v-model.number="vehicleForm.year" type="number" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Max Load (kg)</label>
              <input v-model.number="vehicleForm.max_load_capacity" type="number" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Acquisition Cost ($)</label>
              <input v-model.number="vehicleForm.acquisition_cost" type="number" class="input-field" />
            </div>
            <div class="form-group" v-if="showEditVehicleModal">
              <label>Vehicle Status</label>
              <select v-model="vehicleForm.status" class="input-field" required>
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP" disabled>On Active Trip</option>
                <option value="IN_MAINTENANCE">In Maintenance</option>
                <option value="RETIRED">Out of Service</option>
              </select>
            </div>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="closeVehicleModal" class="btn-action secondary">Cancel</button>
            <button type="submit" class="btn-primary" style="width: auto;">Save Vehicle</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: ASSIGN TRIP -->
    <div v-if="showAssignTripModal" class="modal-overlay">
      <div class="glass-card modal-content">
        <h2>Assign New Route Assignment</h2>
        <form @submit.prevent="assignTrip">
          <div class="form-group">
            <label>Select Driver</label>
            <select v-model="tripForm.driver_id" class="input-field" required>
              <option value="" disabled>Choose an available driver</option>
              <option v-for="driver in availableDrivers" :key="driver.driver_id" :value="driver.driver_id">
                {{ driver.driver_name }} (Status: {{ driver.status }})
              </option>
            </select>
            <p style="font-size: 0.8rem; margin: -0.5rem 0 0.5rem 0.2rem; color: var(--text-muted);">
              Only operational and available drivers are shown.
            </p>
          </div>
          <div class="form-group">
            <label>Select Vehicle</label>
            <select v-model="tripForm.vehicle_id" class="input-field" required>
              <option value="" disabled>Choose an available vehicle</option>
              <option v-for="vehicle in availableVehicles" :key="vehicle.vehicle_id" :value="vehicle.vehicle_id">
                {{ vehicle.vehicle_name }} (Reg: {{ vehicle.registration_number }})
              </option>
            </select>
            <p style="font-size: 0.8rem; margin: -0.5rem 0 0.5rem 0.2rem; color: var(--text-muted);">
              Only ready/available vehicles are shown.
            </p>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pickup Location</label>
              <input v-model="tripForm.source" type="text" placeholder="e.g. Depot Central" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Destination Location</label>
              <input v-model="tripForm.destination" type="text" placeholder="e.g. Retail Warehouse B" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Cargo Weight (kg)</label>
              <input v-model.number="tripForm.cargo_weight" type="number" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Planned Distance (km)</label>
              <input v-model.number="tripForm.planned_distance" type="number" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Scheduled Date & Time</label>
              <input v-model="tripForm.scheduled_time" type="datetime-local" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select v-model="tripForm.priority" class="input-field" required>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Trip Instructions / Notes</label>
            <textarea v-model="tripForm.notes" placeholder="Special requirements, contact numbers..." class="input-field" style="height: 80px; resize: none;"></textarea>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="closeTripModal" class="btn-action secondary">Cancel</button>
            <button type="submit" class="btn-primary" style="width: auto;">Confirm Assignment</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: LOG MAINTENANCE -->
    <div v-if="showMaintenanceModal" class="modal-overlay">
      <div class="glass-card modal-content">
        <h2>Log Vehicle Maintenance Activity</h2>
        <form @submit.prevent="logMaintenance">
          <div class="form-group">
            <label>Vehicle Under Repair</label>
            <input type="text" :value="`${maintenanceForm.vehicle_name} [${maintenanceForm.registration_number}]`" class="input-field" disabled />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Maintenance Task Title</label>
              <input v-model="maintenanceForm.title" type="text" placeholder="e.g. Engine Oil & Spark Plugs" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Maintenance Type</label>
              <select v-model="maintenanceForm.maintenance_type" class="input-field" required>
                <option value="Routine Service">Routine Service</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="Electrical Repair">Electrical Repair</option>
                <option value="Tire Rotation">Tire Rotation</option>
                <option value="General Checkup">General Checkup</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Assigned Technician</label>
              <input v-model="maintenanceForm.technician" type="text" placeholder="e.g. Alex Mechanic" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Service Date</label>
              <input v-model="maintenanceForm.maintenance_date" type="date" class="input-field" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Estimated Cost ($)</label>
              <input v-model.number="maintenanceForm.cost" type="number" class="input-field" required />
            </div>
            <div class="form-group">
              <p style="font-size: 0.85rem; margin-top: 2rem; color: var(--text-muted);">
                🔧 Vehicle status will automatically be set to <b>In Maintenance</b> while active.
              </p>
            </div>
          </div>
          <div class="form-group">
            <label>Detailed Repair Description</label>
            <textarea v-model="maintenanceForm.description" placeholder="Specify parts replaced, issues found..." class="input-field" style="height: 80px; resize: none;"></textarea>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="closeMaintenanceModal" class="btn-action secondary">Cancel</button>
            <button type="submit" class="btn-primary" style="width: auto;">Initiate Maintenance</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../api'

const activeTab = ref('overview')
const stats = ref({})
const vehicles = ref([])
const drivers = ref([])
const trips = ref([])
const maintenanceLogs = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Search states
const vehicleSearch = ref('')
const driverSearch = ref('')
const tripSearch = ref('')
const maintenanceSearch = ref('')

// Modal States
const showAddVehicleModal = ref(false)
const showEditVehicleModal = ref(false)
const showAssignTripModal = ref(false)
const showMaintenanceModal = ref(false)

// Form states
const vehicleForm = ref({
  vehicle_id: null,
  registration_number: '',
  vehicle_name: '',
  manufacturer: '',
  model: '',
  vehicle_type: 'TRUCK',
  year: new Date().getFullYear(),
  fuel_type: 'DIESEL',
  max_load_capacity: 0,
  acquisition_cost: 0,
  status: 'AVAILABLE'
})

const tripForm = ref({
  driver_id: '',
  vehicle_id: '',
  source: '',
  destination: '',
  cargo_weight: 0,
  planned_distance: 0,
  scheduled_time: '',
  priority: 'Normal',
  notes: ''
})

const maintenanceForm = ref({
  vehicle_id: '',
  vehicle_name: '',
  registration_number: '',
  title: '',
  description: '',
  maintenance_type: 'Routine Service',
  technician: '',
  cost: 0,
  maintenance_date: new Date().toISOString().substring(0, 10)
})

// Fetch all data
const loadAllData = async () => {
  loading.value = true
  try {
    const [sData, vData, dData, tData, mData] = await Promise.all([
      apiFetch('/fleet/dashboard'),
      apiFetch('/fleet/vehicles'),
      apiFetch('/fleet/drivers'),
      apiFetch('/fleet/trips'),
      apiFetch('/fleet/maintenance')
    ])
    stats.value = sData
    vehicles.value = vData
    drivers.value = dData
    trips.value = tData
    maintenanceLogs.value = mData
  } catch (err) {
    error.value = err.message || 'Failed to pull fleet operations records.'
  } finally {
    loading.value = false
  }
}

// Show feedback toast
const triggerToast = (msg, isSuccess = true) => {
  if (isSuccess) {
    successMessage.value = msg
    setTimeout(() => { successMessage.value = '' }, 4000)
  } else {
    error.value = msg
    setTimeout(() => { error.value = '' }, 4000)
  }
}

// Parse destination metadata
const parseDestination = (dest) => {
  if (!dest) return { name: '', date: '', priority: 'Normal', notes: '' }
  const scheduledMatch = dest.match(/\[Scheduled:\s*(.*?)\]/)
  const priorityMatch = dest.match(/\[Priority:\s*(.*?)\]/)
  const notesMatch = dest.match(/\(Notes:\s*(.*?)\)/)
  
  let name = dest
  if (scheduledMatch) name = name.replace(scheduledMatch[0], '')
  if (priorityMatch) name = name.replace(priorityMatch[0], '')
  if (notesMatch) name = name.replace(notesMatch[0], '')
  
  return {
    name: name.trim(),
    date: scheduledMatch ? new Date(scheduledMatch[1]).toLocaleString() : 'N/A',
    priority: priorityMatch ? priorityMatch[1] : 'Normal',
    notes: notesMatch ? notesMatch[1] : ''
  }
}

// Parse maintenance metadata
const parseMaintenanceDesc = (desc) => {
  if (!desc) return { notes: '', type: 'Routine Service', technician: 'N/A', cost: 0, date: '' }
  const lines = desc.split('\n')
  let notes = lines[0] || ''
  let type = 'Routine Service'
  let technician = 'N/A'
  let cost = 0
  let date = ''
  
  lines.forEach(line => {
    if (line.startsWith('Type: ')) type = line.replace('Type: ', '')
    else if (line.startsWith('Technician: ')) technician = line.replace('Technician: ', '')
    else if (line.startsWith('Cost: $')) cost = parseFloat(line.replace('Cost: $', '')) || 0
    else if (line.startsWith('Date: ')) date = line.replace('Date: ', '')
  })
  
  return { notes, type, technician, cost, date }
}

// Filter Computeds
const filteredVehicles = computed(() => {
  if (!vehicleSearch.value) return vehicles.value
  const query = vehicleSearch.value.toLowerCase()
  return vehicles.value.filter(v => 
    v.vehicle_name.toLowerCase().includes(query) ||
    v.registration_number.toLowerCase().includes(query) ||
    v.manufacturer.toLowerCase().includes(query) ||
    v.model.toLowerCase().includes(query) ||
    v.status.toLowerCase().includes(query)
  )
})

const filteredDrivers = computed(() => {
  if (!driverSearch.value) return drivers.value
  const query = driverSearch.value.toLowerCase()
  return drivers.value.filter(d => 
    d.driver_name.toLowerCase().includes(query) ||
    d.email.toLowerCase().includes(query) ||
    d.phone_number.toLowerCase().includes(query) ||
    d.status.toLowerCase().includes(query)
  )
})

const filteredTrips = computed(() => {
  if (!tripSearch.value) return trips.value
  const query = tripSearch.value.toLowerCase()
  return trips.value.filter(t => 
    t.source.toLowerCase().includes(query) ||
    t.destination.toLowerCase().includes(query) ||
    t.driver_name.toLowerCase().includes(query) ||
    t.status.toLowerCase().includes(query)
  )
})

const filteredMaintenance = computed(() => {
  if (!maintenanceSearch.value) return maintenanceLogs.value
  const query = maintenanceSearch.value.toLowerCase()
  return maintenanceLogs.value.filter(log => 
    log.vehicle_name.toLowerCase().includes(query) ||
    log.registration_number.toLowerCase().includes(query) ||
    log.title.toLowerCase().includes(query) ||
    log.status.toLowerCase().includes(query)
  )
})

const inMaintenanceVehicles = computed(() => vehicles.value.filter(v => v.status === 'IN_MAINTENANCE'))
const retiredVehicles = computed(() => vehicles.value.filter(v => v.status === 'RETIRED'))

// Driver availability filter
const availableDrivers = computed(() => 
  drivers.value.filter(d => d.status === 'AVAILABLE' && d.is_active === 1 && !d.active_trip_id)
)

// Vehicle availability filter
const availableVehicles = computed(() => 
  vehicles.value.filter(v => v.status === 'AVAILABLE' && !v.active_trip_id)
)

// Modal Handlers
const openAddVehicle = () => {
  vehicleForm.value = {
    vehicle_id: null,
    registration_number: '',
    vehicle_name: '',
    manufacturer: '',
    model: '',
    vehicle_type: 'TRUCK',
    year: new Date().getFullYear(),
    fuel_type: 'DIESEL',
    max_load_capacity: 0,
    acquisition_cost: 0,
    status: 'AVAILABLE'
  }
  showAddVehicleModal.value = true
}

const openEditVehicle = (vehicle) => {
  vehicleForm.value = { ...vehicle }
  showEditVehicleModal.value = true
}

const closeVehicleModal = () => {
  showAddVehicleModal.value = false
  showEditVehicleModal.value = false
}

const openLogMaintenance = (vehicle) => {
  maintenanceForm.value = {
    vehicle_id: vehicle.vehicle_id,
    vehicle_name: vehicle.vehicle_name,
    registration_number: vehicle.registration_number,
    title: '',
    description: '',
    maintenance_type: 'Routine Service',
    technician: '',
    cost: 0,
    maintenance_date: new Date().toISOString().substring(0, 10)
  }
  showMaintenanceModal.value = true
}

const closeMaintenanceModal = () => {
  showMaintenanceModal.value = false
}

const closeTripModal = () => {
  showAssignTripModal.value = false
  tripForm.value = {
    driver_id: '',
    vehicle_id: '',
    source: '',
    destination: '',
    cargo_weight: 0,
    planned_distance: 0,
    scheduled_time: '',
    priority: 'Normal',
    notes: ''
  }
}

// POST/PUT actions
const saveVehicle = async () => {
  try {
    if (showEditVehicleModal.value) {
      await apiFetch(`/fleet/vehicles/${vehicleForm.value.vehicle_id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicleForm.value)
      })
      triggerToast('Vehicle records updated successfully.')
    } else {
      await apiFetch('/fleet/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleForm.value)
      })
      triggerToast('New vehicle added to operational fleet.')
    }
    closeVehicleModal()
    await loadAllData()
  } catch (err) {
    triggerToast(err.message || 'Operation failed.', false)
  }
}

const assignTrip = async () => {
  try {
    await apiFetch('/fleet/trips', {
      method: 'POST',
      body: JSON.stringify(tripForm.value)
    })
    triggerToast('New trip assignment created and sent to driver.')
    closeTripModal()
    await loadAllData()
  } catch (err) {
    triggerToast(err.message || 'Assignment failed.', false)
  }
}

const logMaintenance = async () => {
  try {
    await apiFetch('/fleet/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceForm.value)
    })
    triggerToast('Active maintenance logged. Vehicle status locked to Maintenance.')
    closeMaintenanceModal()
    await loadAllData()
  } catch (err) {
    triggerToast(err.message || 'Logging repair failed.', false)
  }
}

const completeMaintenanceRecord = async (id) => {
  try {
    await apiFetch(`/fleet/maintenance/${id}/complete`, {
      method: 'PUT'
    })
    triggerToast('Maintenance finished. Vehicle status restored to Available.')
    await loadAllData()
  } catch (err) {
    triggerToast(err.message || 'Updating log failed.', false)
  }
}

onMounted(loadAllData)
</script>

<style scoped>
.fleet-dashboard {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.toast-banner {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.toast-banner.success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.toast-banner.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.tabs-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.tab-icon {
  font-size: 1.1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-icon {
  font-size: 1.25rem;
}

.alerts-list {
  list-style: none;
}

.alerts-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.alert-badge.success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.alert-badge.warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.alert-badge.error { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.recent-trips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-trip-item {
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.trip-route {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.trip-meta-info {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex-grow: 1;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9rem;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.01);
}

.data-table tbody tr {
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.65rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.available { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.badge.on_trip { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge.in_maintenance { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge.retired { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.badge.active { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge.completed { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.badge.pending_acceptance { background: rgba(167, 139, 250, 0.2); color: #c084fc; }
.badge.accepted { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge.in_progress { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge.completed_trip { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.priority-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.low { background: rgba(156, 163, 175, 0.2); color: #d1d5db; }
.priority-badge.normal { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.priority-badge.high { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.priority-badge.critical { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--accent);
  border-color: var(--accent);
}

.btn-action.secondary:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

/* Modals styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-align: left;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
