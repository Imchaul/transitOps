<template>
  <div style="max-width: 500px; margin: 3rem auto;" class="glass-card">
    <h2 style="text-align: center; margin-bottom: 2rem;">Create Account</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="form.email" type="email" placeholder="Email" class="input-field" required />
      <input v-model="form.password" type="password" placeholder="Password" class="input-field" required />
      
      <select v-model="form.role" class="input-field" required>
        <option value="" disabled>Select Role</option>
        <option value="Fleet Manager">Fleet Manager</option>
        <option value="Driver">Driver</option>
        <option value="Financial Analyst">Financial Analyst</option>
      </select>

      <!-- Conditional fields for Driver role -->
      <div v-if="form.role === 'Driver'">
        <input v-model="form.first_name" type="text" placeholder="First Name" class="input-field" required />
        <input v-model="form.last_name" type="text" placeholder="Last Name" class="input-field" required />
        <input v-model="form.license_number" type="text" placeholder="License Number" class="input-field" required />
        <input v-model="form.phone" type="text" placeholder="Phone Number" class="input-field" required />
      </div>
      
      <p v-if="error" style="color: #ef4444; margin-bottom: 1rem;">{{ error }}</p>
      
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      
      <p style="text-align: center; margin-top: 1.5rem; color: var(--text-muted);">
        Already have an account? <router-link to="/login" style="color: var(--accent);">Login</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api'

const router = useRouter()
const error = ref('')
const loading = ref(false)
const form = ref({
  email: '',
  password: '',
  role: '',
  first_name: '',
  last_name: '',
  license_number: '',
  phone: ''
})

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  try {
    const payload = {
      email: form.value.email,
      password: form.value.password,
      role: form.value.role
    }
    
    if (form.value.role === 'Driver') {
      payload.driver_info = {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        license_number: form.value.license_number,
        phone: form.value.phone
      }
    }

    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    alert('Registration successful! Please login.')
    router.push('/login')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
