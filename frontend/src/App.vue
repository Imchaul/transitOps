<template>
  <div id="app">
    <header class="nav-bar" v-if="!['login', 'register'].includes($route.name)">
      <h2>TransitOps Platform</h2>
      <button @click="logout" class="btn-primary" style="width: auto;">Logout</button>
    </header>
    <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>
