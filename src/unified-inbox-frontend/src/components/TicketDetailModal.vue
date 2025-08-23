<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-slate-200">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">{{ ticket.title }}</h2>
          <div class="flex items-center gap-3 mt-2">
            <PriorityBadge :priority="ticket.priority" />
            <CategoryTag :category="ticket.category" />
            <span class="text-sm text-slate-500">#{{ ticket.id }}</span>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Ticket Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">Description</h3>
            <p class="text-slate-700 whitespace-pre-wrap">{{ ticket.description }}</p>
          </div>

          <!-- Comments Section -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">Comments</h3>
            
            <!-- Comments List -->
            <div class="space-y-3 mb-4">
              <div
                v-for="comment in ticket.comments"
                :key="comment.id"
                class="bg-white rounded-lg p-3 border border-slate-200"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-slate-800">{{ comment.user?.name || 'Unknown' }}</span>
                  <span class="text-xs text-slate-500">{{ formatRelativeDate(comment.createdAt) }}</span>
                </div>
                <p class="text-slate-700">{{ comment.content }}</p>
              </div>
            </div>

            <!-- Add Comment Form -->
            <form @submit.prevent="addComment" class="space-y-3">
              <textarea
                v-model="newComment"
                rows="3"
                placeholder="Add a comment..."
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="!newComment.trim() || addingComment"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {{ addingComment ? 'Adding...' : 'Add Comment' }}
                </button>
              </div>
            </form>
          </div>

          <!-- History Section -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">History</h3>
            <div class="space-y-2">
              <div
                v-for="history in ticket.history"
                :key="history.id"
                class="flex items-center gap-3 text-sm"
              >
                <span class="text-slate-500">{{ formatRelativeDate(history.createdAt) }}</span>
                <span class="text-slate-800">{{ history.user?.name || 'Unknown' }}</span>
                <span class="text-slate-600">changed</span>
                <span class="text-blue-600">{{ history.field }}</span>
                <span class="text-slate-600">from</span>
                <span class="text-slate-500">{{ history.oldValue || 'null' }}</span>
                <span class="text-slate-600">to</span>
                <span class="text-green-600">{{ history.newValue || 'null' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h3>
            <div class="space-y-3">
              <!-- Status Change -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  v-model="ticket.status"
                  @change="updateStatus"
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <!-- Priority Change -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  v-model="ticket.priority"
                  @change="updatePriority"
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <!-- System Change -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">System</label>
                <select
                  v-model="ticket.systemId"
                  @change="updateSystem"
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option
                    v-for="system in systems"
                    :key="system.id"
                    :value="system.id"
                  >
                    {{ system.name }}
                  </option>
                </select>
              </div>

              <!-- Assignee Change -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
                <select
                  v-model="ticket.assignedTo"
                  @change="updateAssignee"
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
            </div>
          </div>

          <!-- Ticket Info -->
          <div class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Ticket Information</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Created:</span>
                <span class="text-white">{{ formatReadableDate(ticket.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Updated:</span>
                <span class="text-white">{{ formatReadableDate(ticket.updatedAt) }}</span>
              </div>
              <div v-if="ticket.resolvedAt" class="flex justify-between">
                <span class="text-gray-400">Resolved:</span>
                <span class="text-white">{{ formatReadableDate(ticket.resolvedAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Creator:</span>
                <span class="text-white">{{ ticket.creator?.name || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">System:</span>
                <span class="text-white">{{ ticket.system?.name || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">AI Assisted:</span>
                <span class="text-white">{{ ticket.aiAssisted ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>

          <!-- Conversation Info -->
          <div v-if="ticket.conversation" class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Related Conversation</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Name:</span>
                <span class="text-white">{{ ticket.conversation.name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Type:</span>
                <span class="text-white">{{ ticket.conversation.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import PriorityBadge from './PriorityBadge.vue';
import CategoryTag from './CategoryTag.vue';
import { formatRelativeDate, formatReadableDate } from '../utils/dateUtils.js';
import apiClient from '../api.js';

// Props
const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['close', 'ticket-updated']);

// Reactive state
const newComment = ref('');
const addingComment = ref(false);
const agents = ref([]);
const systems = ref([]);

// Methods
const fetchAgents = async () => {
  try {
    const response = await apiClient.get('/api/v1/agents');
    if (response.data) {
      agents.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching agents:', error);
  }
};

const fetchSystems = async () => {
  try {
    const response = await apiClient.get('/api/v1/systems');
    if (response.data && response.data.data) {
      systems.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching systems:', error);
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    addingComment.value = true;
    
    console.log('Adding comment to ticket:', props.ticket.id);
    
    const response = await apiClient.post(`/api/v1/helpdesk/tickets/${props.ticket.id}/comments`, {
      content: newComment.value.trim(),
      userId: 'current-user-id' // This should come from auth context
    });

    console.log('Add comment response:', response.data);

    if (response.data.status === 'success') {
      // Add comment to local state
      if (!props.ticket.comments) {
        props.ticket.comments = [];
      }
      props.ticket.comments.push(response.data.data);
      newComment.value = '';
      
      // Emit update
      emit('ticket-updated', props.ticket);
    } else {
      throw new Error(response.data.message || 'Failed to add comment');
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Error adding comment: ' + (error.response?.data?.message || error.message));
  } finally {
    addingComment.value = false;
  }
};

const updateStatus = async () => {
  try {
    const response = await apiClient.post(`/api/v1/helpdesk/tickets/${props.ticket.id}/status`, {
      status: props.ticket.status
    });

    if (response.data.status === 'success') {
      emit('ticket-updated', response.data.data);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    // Revert on error
    // This would need to be handled by the parent component
  }
};

const updatePriority = async () => {
  try {
    const response = await apiClient.post(`/api/v1/helpdesk/tickets/${props.ticket.id}/priority`, {
      priority: props.ticket.priority
    });

    if (response.data.status === 'success') {
      emit('ticket-updated', response.data.data);
    }
  } catch (error) {
    console.error('Error updating priority:', error);
  }
};

const updateAssignee = async () => {
  try {
    const response = await apiClient.post(`/api/v1/helpdesk/tickets/${props.ticket.id}/assign`, {
      agentId: props.ticket.assignedTo
    });

    if (response.data.status === 'success') {
      emit('ticket-updated', response.data.data);
    }
  } catch (error) {
    console.error('Error updating assignee:', error);
  }
};

const updateSystem = async () => {
  try {
    const response = await apiClient.put(`/api/v1/helpdesk/tickets/${props.ticket.id}`, {
      systemId: props.ticket.systemId
    });

    if (response.data.status === 'success') {
      emit('ticket-updated', response.data.data);
    }
  } catch (error) {
    console.error('Error updating system:', error);
  }
};

// Lifecycle
onMounted(() => {
  fetchAgents();
  fetchSystems();
});
</script>
