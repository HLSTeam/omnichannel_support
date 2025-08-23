<template>
  <span
    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    :class="priorityClasses"
  >
    {{ priorityLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  priority: {
    type: String,
    required: true
  }
});

const priorityLabel = computed(() => {
  const labels = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  };
  return labels[props.priority] || props.priority;
});

const priorityClasses = computed(() => {
  const classes = {
    'LOW': 'bg-green-50 text-green-700 border border-green-200',
    'MEDIUM': 'bg-blue-50 text-blue-700 border border-blue-200',
    'HIGH': 'bg-orange-50 text-orange-700 border border-orange-200',
    'URGENT': 'bg-red-50 text-red-700 border border-red-200'
  };
  return classes[props.priority] || 'bg-slate-50 text-slate-700 border border-slate-200';
});
</script>
