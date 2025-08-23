<script setup>
import { ref, watch, nextTick } from 'vue';
import { SendHorizonal } from 'lucide-vue-next';
import apiClient from '../api';
import socket from '../socket';

const props = defineProps({
  conversation: { type: Object, default: null }
});

const messages = ref([]);
const newMessageText = ref('');
const chatContainer = ref(null); // Ref để tham chiếu đến div chứa tin nhắn

// Hàm để cuộn xuống cuối
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// Helper function để format thời gian
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Helper function để lấy tên người gửi
const getSenderName = (message) => {
  // Debug: Log dữ liệu message thực tế
  console.log('Message data:', message);
  console.log('Message sender:', message.sender);
  console.log('Message user:', message.user);
  console.log('Message agent:', message.agent);
  console.log('Message customerName:', message.customerName);
  
  if (message.sender === 'AGENT') {
    // Ưu tiên tên agent từ message.agent.name
    if (message.agent?.name) {
      return message.agent.name;
    }
    // Fallback cho agent
    return 'Nhân viên hỗ trợ';
  } else if (message.sender === 'USER') {
    // Ưu tiên tên user từ message.user.name
    if (message.user?.name) {
      return message.user.name;
    }
    // Thử lấy từ customerName
    if (message.customerName) {
      return message.customerName;
    }
    // Fallback cho user
    return 'Khách hàng';
  }
  return 'Hệ thống';
};

// Helper function để xác định loại tin nhắn
const isAgentMessage = (message) => message.sender === 'AGENT';
const isUserMessage = (message) => message.sender === 'USER';

watch(() => props.conversation?.id, async (newId) => {
  if (newId) {
    const response = await apiClient.get(`/api/v1/conversations/${newId}/messages`);
    messages.value = response.data;
    scrollToBottom();
  } else {
    messages.value = [];
  }
}, { immediate: true });

socket.on('new_message', (newMessage) => {
  if (newMessage.conversationId === props.conversation?.id) {
    messages.value.push(newMessage);
    scrollToBottom();
  }
});

// --- HÀM MỚI ĐỂ GỬI TIN NHẮN ---
const sendMessage = async () => {
  // Không gửi nếu không có nội dung hoặc chưa chọn cuộc trò chuyện
  if (!newMessageText.value.trim() || !props.conversation?.id) return;
  try {
    await apiClient.post('/api/v1/messages', {
      conversationId: props.conversation.id,
      text: newMessageText.value,
    });
    newMessageText.value = '';
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    alert("Gửi tin nhắn thất bại!");
  }
};
</script>

<template>
  <div v-if="!conversation" class="flex items-center justify-center h-full text-slate-600">
    <div class="text-center">
      <div class="text-4xl mb-4">💬</div>
      <h3 class="text-lg font-semibold mb-2 text-slate-800">Chọn cuộc trò chuyện</h3>
      <p class="text-sm text-slate-600">Hãy chọn một cuộc trò chuyện để bắt đầu chat</p>
    </div>
  </div>
  <div v-else class="flex flex-col h-full min-h-0">
    <!-- Chat Messages Area - Scrollable -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-4 min-h-0">
      <!-- Empty state khi chưa có tin nhắn -->
      <div v-if="messages.length === 0" class="flex items-center justify-center min-h-[200px]">
        <div class="text-center text-slate-500">
          <div class="text-6xl mb-4">💬</div>
          <p class="text-lg font-medium">Chưa có tin nhắn nào</p>
          <p class="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
      
      <!-- Tin nhắn -->
      <div v-else class="space-y-4">
        <div v-for="msg in messages" :key="msg.id" :class="isUserMessage(msg) ? 'flex justify-start' : 'flex justify-end'">
          <div :class="isUserMessage(msg) ? 'bg-white border border-slate-200 shadow-sm' : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md'" class="rounded-2xl p-4 max-w-lg">
            
            <!-- Tên người gửi -->
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold" :class="isUserMessage(msg) ? 'text-slate-700' : 'text-blue-100'">
                {{ getSenderName(msg) }}
              </p>
              <span class="text-xs opacity-80" :class="isUserMessage(msg) ? 'text-slate-500' : 'text-blue-200'">
                {{ formatTime(msg.createdAt) }}
              </span>
            </div>

            <!-- Nội dung tin nhắn -->
            <p class="text-sm leading-relaxed" :class="isUserMessage(msg) ? 'text-slate-800' : 'text-white'">{{ msg.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Box - Always Fixed at Bottom -->
    <div class="flex-shrink-0 bg-white/95 backdrop-blur-sm p-4 border-t border-slate-200 shadow-xl">
      <form @submit.prevent="sendMessage" class="flex items-center bg-white border-2 border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
        <input 
          type="text" 
          placeholder="Nhập tin nhắn..." 
          class="flex-1 bg-transparent p-4 text-slate-800 placeholder-slate-400 focus:outline-none text-sm"
          v-model="newMessageText"
        >
        <button 
          type="submit" 
          :disabled="!newMessageText.trim()"
          class="p-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-r-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizonal class="w-5 h-5" />
        </button>
      </form>
    </div>
  </div>
</template>