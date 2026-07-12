<template>
  <div style="max-width: 400px; margin: 5rem auto;" class="glass-card">
    <h2 style="text-align: center; margin-bottom: 2rem;">TransitOps Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" class="input-field" required />
      <input v-model="password" type="password" placeholder="Password" class="input-field" required />
      
      <p v-if="error" style="color: #ef4444; margin-bottom: 1rem;">{{ error }}</p>
      
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Sign In' }}
      </button>
      
      <p style="text-align: center; margin-top: 1.5rem; color: var(--text-muted);">
        Don't have an account? <router-link to="/register" style="color: var(--accent);">Register</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    // Save JWT and role
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('role', res.role)
    
    // Redirect based on role
    if (res.role === 'Admin') router.push('/admin')
    else if (res.role === 'Fleet Manager') router.push('/fleet')
    else if (res.role === 'Driver') router.push('/driver')
    else if (res.role === 'Financial Analyst') router.push('/finance')
    else router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
