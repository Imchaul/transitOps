<template>
  <div>
    <h1>Admin Control Panel</h1>
    <p>Manage system users and assign roles.</p>
    <div class="glass-card" style="margin-top: 2rem;">
      <h3>Registered Users</h3>
      <div v-if="loading">Loading...</div>
      <table v-else style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 1rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="padding: 1rem;">Email</th>
            <th style="padding: 1rem;">Role</th>
            <th style="padding: 1rem;">Status</th>
            <th style="padding: 1rem;">Joined</th>
            <th style="padding: 1rem;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 1rem;">{{ user.email }}</td>
            <td style="padding: 1rem;"><span style="color: var(--accent);">{{ user.role }}</span></td>
            <td style="padding: 1rem;">
              <span :style="{ color: user.is_active === 1 ? '#10b981' : '#ef4444' }">
                {{ user.is_active === 1 ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td style="padding: 1rem;">{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td style="padding: 1rem;">
              <button 
                v-if="user.role !== 'Admin'"
                @click="toggleAccess(user.user_id)" 
                class="btn-primary" 
                :style="{ background: user.is_active === 1 ? '#ef4444' : '#10b981', padding: '0.5rem 1rem', width: 'auto' }"
              >
                {{ user.is_active === 1 ? 'Revoke Access' : 'Restore Access' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'

const users = ref([])
const loading = ref(true)

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await apiFetch('/admin/users')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const toggleAccess = async (userId) => {
  try {
    await apiFetch(`/admin/users/${userId}/toggle-access`, { method: 'PUT' })
    await loadUsers() // Reload the list to get updated status
  } catch (error) {
    alert(error.message)
  }
}

onMounted(loadUsers)
</script>
