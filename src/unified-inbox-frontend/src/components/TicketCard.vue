<template>
  <div
    :data-ticket-id="ticket.id"
    class="bg-white rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-all duration-200 border-l-4 shadow-sm hover:shadow-md border border-slate-200"
    :class="priorityBorderClass"
    draggable="true"
    @click="$emit('click', ticket)"
  >
    <!-- Priority Badge -->
    <div class="flex items-center justify-between mb-4">
      <PriorityBadge :priority="ticket.priority" />
      <CategoryTag :category="ticket.category" />
    </div>

    <!-- Title -->
    <h4 class="font-medium text-slate-800 mb-2 line-clamp-2 text-sm leading-tight">{{ ticket.title }}</h4>

    <!-- Description Preview -->
    <p class="text-slate-600 text-xs mb-3 line-clamp-2 leading-relaxed">{{ ticket.description }}</p>

    <!-- Meta Information -->
    <div class="space-y-2">
      <!-- Assignee -->
      <div class="flex items-center gap-2 mb-2">
        <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center">
          <UserIcon class="w-3 h-3 text-slate-500" />
        </div>
        <span class="text-xs text-slate-600">
          {{ ticket.assignedAgent?.name || 'Unassigned' }}
        </span>
      </div>

      <!-- System and Creator -->
      <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
        <div class="flex items-center gap-2">
          <span class="bg-slate-100 px-2 py-1 rounded-full">{{ ticket.system?.name || 'Unknown System' }}</span>
          <span>By {{ ticket.creator?.name || 'Unknown' }}</span>
        </div>
        <span>{{ formatRelativeDate(ticket.createdAt) }}</span>
      </div>

      <!-- Comments Count -->
      <div v-if="ticket.comments && ticket.comments.length > 0" class="flex items-center gap-1 text-xs text-slate-500 mb-2">
        <ChatBubbleLeftIcon class="w-3 h-3" />
        <span>{{ ticket.comments.length }} comment{{ ticket.comments.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- AI Assisted Badge -->
      <div v-if="ticket.aiAssisted" class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
        <SparklesIcon class="w-3 h-3" />
        <span>AI</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { UserIcon, ChatBubbleLeftIcon, SparklesIcon } from '@heroicons/vue/24/outline';
import PriorityBadge from './PriorityBadge.vue';
import CategoryTag from './CategoryTag.vue';
import { formatRelativeDate } from '../utils/dateUtils.js';

// Props
const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['click']);

// Computed properties
const priorityBorderClass = computed(() => {
  const classes = {
    'LOW': 'border-l-green-400',
    'MEDIUM': 'border-l-blue-400',
    'HIGH': 'border-l-orange-400',
    'URGENT': 'border-l-red-400'
  };
  return classes[props.ticket.priority] || 'border-l-slate-400';
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover effects */
.hover\:bg-gray-600:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Smooth transitions */
.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style>
