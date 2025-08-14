<script setup>
import { ref, watch, nextTick } from 'vue';
import { SendHorizonal } from 'lucide-vue-next';
import apiClient from '../api';
import socket from '../socket';

const props = defineProps({
  conversationId: { type: String, default: null }
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

watch(() => props.conversationId, async (newId) => {
  if (newId) {
    const response = await apiClient.get(`/conversations/${newId}/messages`);
    messages.value = response.data;
    scrollToBottom();
  } else {
    messages.value = [];
  }
}, { immediate: true });

socket.on('new_message', (newMessage) => {
  if (newMessage.conversationId === props.conversationId) {
    messages.value.push(newMessage);
    scrollToBottom();
  }
});

// --- HÀM MỚI ĐỂ GỬI TIN NHẮN ---
const sendMessage = async () => {
  // Không gửi nếu không có nội dung hoặc chưa chọn cuộc trò chuyện
  if (!newMessageText.value.trim() || !props.conversationId) return;

  try {
    await apiClient.post('/messages', {
      conversationId: props.conversationId,
      text: newMessageText.value,
    });
    // Xóa nội dung trong ô input sau khi gửi
    newMessageText.value = '';
    // Không cần thêm tin nhắn vào `messages.value` ở đây
    // vì server sẽ phát sự kiện `new_message` và listener ở trên sẽ xử lý
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    alert("Gửi tin nhắn thất bại!");
  }
};
</script>

<template>
  <div v-if="!conversationId" class="flex items-center justify-center h-full text-gray-500">
    Hãy chọn một cuộc trò chuyện để bắt đầu
  </div>
  <div v-else class="flex flex-col h-full">
    <header class="bg-gray-800 p-4 border-b border-gray-600">
      <h3 class="font-bold text-lg">Conversation ID: {{ conversationId }}</h3>
    </header>

    <div class="flex-1 p-4 space-y-4 overflow-y-auto">
      <div v-for="msg in messages" :key="msg.id" :class="msg.sender === 'USER' ? 'flex justify-start' : 'flex justify-end'">
        <div :class="msg.sender === 'USER' ? 'bg-gray-600' : 'bg-cyan-600'" class="rounded-lg p-3 max-w-lg">
          <p>{{ msg.text }}</p>
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