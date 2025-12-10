<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ title }}</h3>
    <div class="h-64 sm:h-80">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  title: {
    type: String,
    default: 'Status Distribution'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  const labels = Object.keys(props.data)
  const values = Object.values(props.data)
  const colors = {
    'Applied': 'rgb(34, 197, 94)',
    'Not Fit': 'rgb(234, 179, 8)',
    'Duplicate': 'rgb(239, 68, 68)'
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(label => colors[label] || 'rgb(156, 163, 175)'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 13 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8
        }
      }
    }
  })
}

watch(() => props.data, () => {
  if (chartInstance) {
    const labels = Object.keys(props.data)
    const values = Object.values(props.data)
    const colors = {
      'Applied': 'rgb(34, 197, 94)',
      'Not Fit': 'rgb(234, 179, 8)',
      'Duplicate': 'rgb(239, 68, 68)'
    }
    
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = values
    chartInstance.data.datasets[0].backgroundColor = labels.map(label => colors[label] || 'rgb(156, 163, 175)')
    chartInstance.update()
  }
}, { deep: true })

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

