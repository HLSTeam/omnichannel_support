<template>
  <div class="bg-slate-100 rounded-lg p-3 h-full flex flex-col border border-slate-200">
    <!-- Column Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">{{ title }}</h3>
        <span class="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{{ tickets.length }}</span>
      </div>
    </div>

          <!-- Drop Zone -->
      <div
        class="flex-1 overflow-y-auto rounded transition-all duration-200"
        @dragover.prevent
        @drop="handleDrop"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        :class="{
          'bg-blue-50 border-2 border-blue-300 border-dashed': isDragOver,
          'bg-slate-50': !isDragOver
        }"
      >
      <!-- Tickets Container -->
      <div class="space-y-3 p-2">
        <TransitionGroup
          name="ticket"
          tag="div"
          class="space-y-3"
        >
          <TicketCard
            v-for="ticket in tickets"
            :key="ticket.id"
            :ticket="ticket"
            :draggable="true"
            @click="$emit('ticket-click', ticket)"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
          />
        </TransitionGroup>

        <!-- Empty State -->
        <div
          v-if="tickets.length === 0"
          class="text-center py-6 text-slate-400"
        >
          <div class="w-8 h-8 mx-auto mb-2 bg-slate-200 rounded-full flex items-center justify-center">
            <DocumentIcon class="w-4 h-4 text-slate-400" />
          </div>
          <p class="text-xs">No cards</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DocumentIcon } from '@heroicons/vue/24/outline';
import TicketCard from './TicketCard.vue';

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  tickets: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['drop', 'ticket-click']);

// Reactive state
const isDragOver = ref(false);

// Methods
const handleDragStart = (event) => {
  event.dataTransfer.setData('text/plain', JSON.stringify({
    ticketId: event.target.dataset.ticketId,
    fromStatus: props.status
  }));
};

const handleDragEnd = () => {
  isDragOver.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;

  try {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const { ticketId, fromStatus } = data;

    // Don't allow dropping in the same column
    if (fromStatus === props.status) {
      return;
    }

    // Validate status transitions
    if (!isValidStatusTransition(fromStatus, props.status)) {
      // Show error notification
      console.warn(`Invalid status transition from ${fromStatus} to ${props.status}`);
      return;
    }

    // Emit drop event
    emit('drop', ticketId, props.status);
  } catch (error) {
    console.error('Error handling drop:', error);
  }
};

const isValidStatusTransition = (fromStatus, toStatus) => {
  const validTransitions = {
    'OPEN': ['IN_PROGRESS', 'CLOSED'],
    'IN_PROGRESS': ['REVIEW', 'OPEN', 'CLOSED'],
    'REVIEW': ['RESOLVED', 'IN_PROGRESS'],
    'RESOLVED': ['CLOSED', 'IN_PROGRESS'],
    'CLOSED': [] // No transitions from CLOSED
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
};

// Drag over handling
const handleDragEnter = (event) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};
</script>

<style scoped>
/* Ticket transition animations */
.ticket-enter-active,
.ticket-leave-active {
  transition: all 0.3s ease;
}

.ticket-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.ticket-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.ticket-move {
  transition: transform 0.3s ease;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
