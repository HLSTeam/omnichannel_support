<template>
  <span
    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    :class="categoryClasses"
    :title="categoryDescription"
  >
    {{ categoryLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const categoryLabel = computed(() => {
  const labels = {
    'TECHNICAL': 'Tech',
    'BILLING': 'Billing',
    'GENERAL': 'General',
    'FEATURE_REQUEST': 'Feature',
    'BUG_REPORT': 'Bug'
  };
  return labels[props.category] || props.category;
});

const categoryDescription = computed(() => {
  const descriptions = {
    'TECHNICAL': 'Technical support issue',
    'BILLING': 'Billing or payment related',
    'GENERAL': 'General inquiry or question',
    'FEATURE_REQUEST': 'Request for new feature',
    'BUG_REPORT': 'Report of software bug'
  };
  return descriptions[props.category] || props.category;
});

const categoryClasses = computed(() => {
  const classes = {
    'TECHNICAL': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'BILLING': 'bg-purple-50 text-purple-700 border border-purple-200',
    'GENERAL': 'bg-slate-50 text-slate-700 border border-slate-200',
    'FEATURE_REQUEST': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'BUG_REPORT': 'bg-rose-50 text-rose-700 border border-rose-200'
  };
  return classes[props.category] || 'bg-slate-50 text-slate-700 border border-slate-200';
});
</script>
