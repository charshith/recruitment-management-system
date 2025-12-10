<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300 ease-in-out">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center mt-2">
          <span 
            class="text-xs font-semibold"
            :class="change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          >
            <span v-if="change >= 0">↑</span>
            <span v-else>↓</span>
            {{ Math.abs(change) }}%
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
        </div>
      </div>
      <div 
        class="rounded-full p-3"
        :class="iconBg"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColor" v-if="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  change: Number,
  icon: Object,
  iconBg: {
    type: String,
    default: 'bg-primary-100 dark:bg-primary-900/30'
  },
  iconColor: {
    type: String,
    default: 'text-primary-600 dark:text-primary-400'
  }
})
</script>

