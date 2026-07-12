import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FleetDashboard from '../views/FleetDashboard.vue'
import DriverDashboard from '../views/DriverDashboard.vue'
import FinanceDashboard from '../views/FinanceDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/admin', name: 'admin', component: AdminDashboard, meta: { role: 'Admin' } },
    { path: '/fleet', name: 'fleet', component: FleetDashboard, meta: { role: 'Fleet Manager' } },
    { path: '/driver', name: 'driver', component: DriverDashboard, meta: { role: 'Driver' } },
    { path: '/finance', name: 'finance', component: FinanceDashboard, meta: { role: 'Financial Analyst' } }
  ]
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const userRole = localStorage.getItem('role')

  // Not logged in -> Redirect to login
  if (to.name !== 'login' && to.name !== 'register' && !token) {
    return next({ name: 'login' })
  }

  // Role validation
  if (to.meta.role && to.meta.role !== userRole) {
    // If they have a role, push them to their proper dashboard
    if (userRole === 'Admin') return next({ name: 'admin' })
    if (userRole === 'Fleet Manager') return next({ name: 'fleet' })
    if (userRole === 'Driver') return next({ name: 'driver' })
    if (userRole === 'Financial Analyst') return next({ name: 'finance' })
    
    // Fallback if no valid role
    return next({ name: 'login' })
  }

  next()
})

export default router
