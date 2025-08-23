<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-slate-800">Create New Ticket</h2>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter ticket title"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Describe the issue or request"
          ></textarea>
        </div>



        <!-- Priority and Category Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Priority -->
          <div>
            <label for="priority" class="block text-sm font-medium text-slate-700 mb-2">
              Priority *
            </label>
            <select
              id="priority"
              v-model="form.priority"
              required
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-slate-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              v-model="form.category"
              required
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BILLING">Billing</option>
              <option value="GENERAL">General</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="BUG_REPORT">Bug Report</option>
            </select>
          </div>
        </div>

        <!-- System Selection -->
        <div>
          <label for="system" class="block text-sm font-medium text-slate-700 mb-2">
            System * ({{ systems.length }} available)
          </label>
          <select
            id="system"
            v-model="form.systemId"
            required
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select System ({{ systems.length }} available)</option>
            <option
              v-for="system in systems"
              :key="system.id"
              :value="system.id"
            >
              {{ system.name }}
            </option>
          </select>

        </div>

        <!-- Conversation (Optional) -->
        <div>
          <label for="conversation" class="block text-sm font-medium text-slate-700 mb-2">
            Related Conversation (Optional)
          </label>
          <select
            id="conversation"
            v-model="form.conversationId"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No conversation</option>
            <option
              v-for="conv in conversations"
              :key="conv.id"
              :value="conv.id"
            >
              {{ conv.name || conv.platformChatId }}
            </option>
          </select>
        </div>


        <!-- Assignee (Optional) -->
        <div>
          <label for="assignee" class="block text-sm font-medium text-slate-700 mb-2">
            Assign to (Optional)
          </label>
          <select
            id="assignee"
            v-model="form.assignedTo"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Unassigned</option>
            <option
              v-for="agent in agents"
              :key="agent.id"
              :value="agent.id"
            >
              {{ agent.name }} ({{ agent.role }})
            </option>
          </select>
        </div>

        <!-- AI Assisted Toggle -->
        <div class="flex items-center">
          <input
            id="aiAssisted"
            v-model="form.aiAssisted"
            type="checkbox"
            class="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label for="aiAssisted" class="ml-2 text-sm text-slate-700">
            AI Assisted Ticket
          </label>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Creating...' : 'Create Ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import apiClient from '../api.js';

// Props
const props = defineProps({
  systemId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['close', 'ticket-created']);

// Reactive state
const loading = ref(false);
const conversations = ref([]);
const agents = ref([]);
const systems = ref([]);

const form = ref({
  title: '',
  description: '',
  priority: '',
  category: '',
  systemId: props.systemId,
  conversationId: '',
  assignedTo: '',
  aiAssisted: false
});

// Methods
const fetchConversations = async () => {
  try {
    const response = await apiClient.get('/api/v1/conversations');
    if (response.data) {
      conversations.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
};

const fetchSystems = async () => {
  try {
    console.log('🔍 Fetching systems...');
    
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No auth token, skipping systems fetch');
      return;
    }
    
    const response = await apiClient.get('/api/v1/systems');
    console.log('📡 Systems API response:', response.data);
    
    if (response.data && response.data.status === 'success') {
      systems.value = response.data.data;
      console.log('✅ Systems loaded:', systems.value);
    } else {
      console.log('❌ Systems API error status:', response.data);
    }
  } catch (error) {
    console.error('❌ Error fetching systems:', error);
  }
};

const fetchAgents = async () => {
  try {
    console.log('🔍 Fetching agents...');
    const response = await apiClient.get('/api/v1/agents');
    console.log('📡 Agents API response:', response.data);
    
    if (response.data && response.data.status === 'success') {
      agents.value = response.data.data;
      console.log('✅ Agents loaded:', agents.value);
    } else {
      console.log('❌ Agents API error status:', response.data);
    }
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
  }
};



const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // Validate required fields
    if (!form.value.conversationId) {
      alert('Please select a conversation');
      return;
    }
    
    // Use conversationId from form
    const ticketData = {
      title: form.value.title,
      description: form.value.description,
      priority: form.value.priority,
      category: form.value.category,
      conversationId: form.value.conversationId,
      assignedTo: form.value.assignedTo || null,
      aiAssisted: form.value.aiAssisted
    };
    
    console.log('Creating ticket with data:', ticketData);
    
    const response = await apiClient.post('/api/v1/helpdesk/tickets', ticketData);
    
    console.log('Create ticket response:', response.data);
    
    if (response.data.status === 'success') {
      emit('ticket-created', response.data.data);
      
      // Reset form
      form.value = {
        title: '',
        description: '',
        priority: '',
        category: '',
        systemId: props.systemId,
        conversationId: '',
        assignedTo: '',
        aiAssisted: false
      };
    } else {
      throw new Error(response.data.message || 'Failed to create ticket');
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    alert('Error creating ticket: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchSystems();
  fetchConversations();
  fetchAgents();
});
</script>
