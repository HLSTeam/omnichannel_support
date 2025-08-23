<template>
  <div class="min-h-full bg-slate-50 text-slate-800 p-4">
    <!-- Header - Trello Style -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">Helpdesk Tickets</h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-slate-500">{{ totalTickets }} tickets</span>
        <button
          @click="showCreateModal = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <PlusIcon class="w-4 h-4" />
          Add Card
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar - Trello Style -->
    <div class="mb-6 flex items-center gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search cards..."
          class="w-full px-4 py-2 pl-10 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
        <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      </div>

      <!-- System Filter -->
      <select
        v-model="selectedSystem"
        class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
      >
        <option value="">All Systems</option>
        <option
          v-for="system in availableSystems"
          :key="system.id"
          :value="system.id"
        >
          {{ system.name }}
        </option>
      </select>

      <!-- Priority Filter -->
      <select
        v-model="selectedPriority"
        class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
      >
        <option value="">All Categories</option>
        <option value="TECHNICAL">Technical</option>
        <option value="BILLING">Billing</option>
        <option value="GENERAL">General</option>
        <option value="FEATURE_REQUEST">Feature Request</option>
        <option value="BUG_REPORT">Bug Report</option>
      </select>
    </div>

    <!-- Kanban Board - Trello Style -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
      <!-- To Do Column -->
      <KanbanColumn
        title="To Do"
        :tickets="filteredTickets.filter(t => t.status === 'OPEN')"
        status="OPEN"
        @drop="handleDrop"
        @ticket-click="openTicketModal"
      />

      <!-- In Progress Column -->
      <KanbanColumn
        title="In Progress"
        :tickets="filteredTickets.filter(t => t.status === 'IN_PROGRESS')"
        status="IN_PROGRESS"
        @drop="handleDrop"
        @ticket-click="openTicketModal"
      />

      <!-- Review Column -->
      <KanbanColumn
        title="Review"
        :tickets="filteredTickets.filter(t => t.status === 'REVIEW')"
        status="REVIEW"
        @drop="handleDrop"
        @ticket-click="openTicketModal"
      />

      <!-- Done Column -->
      <KanbanColumn
        title="Done"
        :tickets="filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED')"
        status="DONE"
        @drop="handleDrop"
        @ticket-click="openTicketModal"
      />
    </div>

    <!-- Create Ticket Modal -->
    <CreateTicketModal
      v-if="showCreateModal"
      :systemId="props.systemId"
      @close="showCreateModal = false"
      @ticket-created="handleTicketCreated"
    />

    <!-- Ticket Detail Modal -->
    <TicketDetailModal
      v-if="selectedTicket"
      :ticket="selectedTicket"
      @close="selectedTicket = null"
      @ticket-updated="handleTicketUpdated"
    />

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-lg flex items-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="text-white">Loading tickets...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline';
import KanbanColumn from './KanbanColumn.vue';
import TicketCard from './TicketCard.vue';
import CreateTicketModal from './CreateTicketModal.vue';
import TicketDetailModal from './TicketDetailModal.vue';
import apiClient from '../api.js';
import { useWebSocket } from '../composables/useWebSocket.js';

// Props
const props = defineProps({
  systemId: {
    type: String,
    required: true
  }
});

// Reactive state
const tickets = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedSystem = ref('');
const selectedPriority = ref('');
const selectedCategory = ref('');
const showCreateModal = ref(false);
const selectedTicket = ref(null);
const systemName = ref('');
const availableSystems = ref([]);

// WebSocket integration
const { connect, disconnect } = useWebSocket();

// Computed properties
const totalTickets = computed(() => tickets.value.length);

const filteredTickets = computed(() => {
  let filtered = tickets.value;

  // System filter (optional)
  if (selectedSystem.value) {
    filtered = filtered.filter(ticket => ticket.systemId === selectedSystem.value);
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(ticket =>
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query)
    );
  }

  // Priority filter
  if (selectedPriority.value) {
    filtered = filtered.filter(ticket => ticket.priority === selectedPriority.value);
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(ticket => ticket.category === selectedCategory.value);
  }

  return filtered;
});

// Methods
const fetchSystemInfo = async () => {
  try {
    const response = await apiClient.get('/api/v1/systems');
    if (response.data && response.data.status === 'success') {
      availableSystems.value = response.data.data;
      
      // Find system by systemId or use first one
      const system = response.data.data.find(s => s.id === props.systemId) || response.data.data[0];
      if (system) {
        systemName.value = system.name;
      }
    }
  } catch (error) {
    console.error('Error fetching system info:', error);
    systemName.value = 'Unknown System';
  }
};

const fetchTickets = async () => {
  try {
    loading.value = true;
    console.log('Fetching tickets for systemId:', props.systemId);
    
    const response = await apiClient.get('/api/v1/helpdesk/tickets');
    
    console.log('Tickets response:', response.data);
    
    if (response.data.status === 'success') {
      tickets.value = response.data.data || [];
    } else {
      console.error('API returned error:', response.data);
      tickets.value = [];
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    tickets.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDrop = async (ticketId, newStatus) => {
  try {
    // Optimistic update
    const ticketIndex = tickets.value.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const oldStatus = tickets.value[ticketIndex].status;
    tickets.value[ticketIndex].status = newStatus;

    // API call to update status (using real API)
    const response = await apiClient.post(`/api/v1/helpdesk/tickets/${ticketId}/status`, {
      status: newStatus
    });

    if (response.data.status !== 'success') {
      // Revert on failure
      tickets.value[ticketIndex].status = oldStatus;
      throw new Error('Failed to update ticket status');
    }

    // Update ticket data with response
    tickets.value[ticketIndex] = response.data.data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    // Show error notification
  }
};

const openTicketModal = (ticket) => {
  selectedTicket.value = ticket;
};

const handleTicketCreated = (newTicket) => {
  tickets.value.unshift(newTicket);
  showCreateModal.value = false;
};

const handleTicketUpdated = (updatedTicket) => {
  const index = tickets.value.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    tickets.value[index] = updatedTicket;
  }
  selectedTicket.value = null;
};

// WebSocket event handlers
const handleTicketUpdate = (updatedTicket) => {
  const index = tickets.value.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    tickets.value[index] = updatedTicket;
  }
};

const handleNewTicket = (newTicket) => {
  tickets.value.unshift(newTicket);
};

// Lifecycle
onMounted(async () => {
  await fetchSystemInfo();
  await fetchTickets();
  
  // Connect to WebSocket for real-time updates
  connect();
  
  // Set up WebSocket event listeners
  // This would be handled by the useWebSocket composable
});

onUnmounted(() => {
  disconnect();
});

// Auto-refresh every 30 seconds as fallback
setInterval(() => {
  if (!loading.value) {
    fetchTickets();
  }
}, 30000);
</script>

<style scoped>
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
