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
    
    <div class="dashboard-grid" style="margin-top: 2rem;">
      <div class="glass-card" style="position: relative; height: 350px;">
        <h3>Expenses by Type</h3>
        <Bar v-if="barChartData" :data="barChartData" :options="chartOptions" />
        <div v-else style="color: var(--text-muted); margin-top: 2rem;">No data available</div>
      </div>
      <div class="glass-card" style="position: relative; height: 350px;">
        <h3>Daily Expenses Trend</h3>
        <Line v-if="lineChartData" :data="lineChartData" :options="chartOptions" />
        <div v-else style="color: var(--text-muted); margin-top: 2rem;">No data available</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
)

const stats = ref({})
const barChartData = ref(null)
const lineChartData = ref(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#e2e8f0' } }
  },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
  }
}

onMounted(async () => {
  try {
    stats.value = await apiFetch('/finance/dashboard')
    
    const reports = await apiFetch('/finance/reports')
    if (reports && reports.length) {
      barChartData.value = {
        labels: reports.map(r => r.expense_type),
        datasets: [{
          label: 'Total Expenses ($)',
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          data: reports.map(r => r.total)
        }]
      }
    }
    
    const expenses = await apiFetch('/finance/expenses')
    if (expenses && expenses.length) {
      const expensesByDate = {}
      expenses.forEach(e => {
        const date = e.expense_date || 'Unknown'
        expensesByDate[date] = (expensesByDate[date] || 0) + e.amount
      })
      
      const sortedDates = Object.keys(expensesByDate).sort()
      lineChartData.value = {
        labels: sortedDates,
        datasets: [{
          label: 'Daily Expenses ($)',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          data: sortedDates.map(date => expensesByDate[date])
        }]
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.glass-card {
  padding: 1.5rem;
}
</style>
