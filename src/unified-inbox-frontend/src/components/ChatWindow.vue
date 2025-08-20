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
    const response = await apiClient.get(`/conversations/${newId}/messages`);
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
    await apiClient.post('/messages', {
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
  <div v-if="!conversation" class="flex items-center justify-center h-full text-gray-500">
    Hãy chọn một cuộc trò chuyện để bắt đầu
  </div>
  <div v-else class="flex flex-col h-full">
    <header class="bg-gray-800 p-4 border-b border-gray-600">
      <h3 class="font-bold text-lg truncate">
        {{ conversation.name || `Chat ID: ${conversation.platformChatId}` }}
      </h3>
    </header>

    <div ref="chatContainer" class="flex-1 p-4 space-y-4 overflow-y-auto">
      <div v-for="msg in messages" :key="msg.id" :class="isUserMessage(msg) ? 'flex justify-start' : 'flex justify-end'">
        <div :class="isUserMessage(msg) ? 'bg-gray-600' : 'bg-cyan-600'" class="rounded-lg p-3 max-w-lg">
          
          <!-- Tên người gửi -->
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold" :class="isUserMessage(msg) ? 'text-gray-300' : 'text-cyan-200'">
              {{ getSenderName(msg) }}
            </p>
            <span class="text-xs opacity-70" :class="isUserMessage(msg) ? 'text-gray-400' : 'text-cyan-300'">
              {{ formatTime(msg.createdAt) }}
            </span>
          </div>

          <!-- Nội dung tin nhắn -->
          <p class="text-sm">{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <footer class="bg-gray-800 p-4">
      <form @submit.prevent="sendMessage" class="flex items-center bg-gray-700 rounded-lg">
        <input 
          type="text" 
          placeholder="Nhập tin nhắn..." 
          class="flex-1 bg-transparent p-3 focus:outline-none"
          v-model="newMessageText"
        >
        <button type="submit" class="p-3 text-cyan-400 hover:text-cyan-300">
          <SendHorizonal />
        </button>
      </form>
    </footer>
  </div>
</template>