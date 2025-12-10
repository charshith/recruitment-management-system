<template>
  <div class="animate-pulse">
    <div class="bg-gray-200 rounded h-4 mb-2" :style="{ width: width }"></div>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  }
})
</script>

