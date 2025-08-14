<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ConversationList from './components/ConversationList.vue';
import ChatWindow from './components/ChatWindow.vue';
import socket from './socket';
import apiClient from './api'; // Import apiClient

const systems = ref([]);
const conversations = ref([]);
const activeSystemId = ref(null);
const activeConversationId = ref(null);

// Hàm để lấy danh sách cuộc trò chuyện từ API
const fetchConversations = async (systemId) => {
  if (!systemId) {
    conversations.value = [];
    return;
  }
  try {
    const response = await apiClient.get('/conversations', {
      params: { systemId: systemId }
    });
    conversations.value = response.data;
  } catch (err) {
    console.error("Lỗi khi tải cuộc trò chuyện:", err);
  }
};

watch(activeSystemId, (newId) => {
  // Khi hệ thống được chọn thay đổi, tải lại danh sách cuộc trò chuyện
  activeConversationId.value = null; // Bỏ chọn cuộc trò chuyện cũ
  fetchConversations(newId);
});

// Hàm xử lý khi có tin nhắn mới từ WebSocket
const handleNewMessage = (newMessage) => {
  console.log('Tin nhắn mới từ WebSocket!', newMessage);

  const conversationIndex = conversations.value.findIndex(
    (c) => c.id === newMessage.conversationId
  );

  if (conversationIndex !== -1) {
    // --- TRƯỜNG HỢP 1: CUỘC TRÒ CHUYỆN ĐÃ CÓ ---
    // (Logic này đã đúng, chúng ta giữ nguyên)

    const updatedConvo = conversations.value[conversationIndex];
    // Cập nhật tin nhắn cuối cùng để hiển thị trên list
    updatedConvo.messages = [newMessage]; 
    // Cập nhật thời gian để sắp xếp lại
    updatedConvo.updatedAt = newMessage.createdAt; 

    // Di chuyển cuộc trò chuyện này lên đầu danh sách
    conversations.value.splice(conversationIndex, 1);
    conversations.value.unshift(updatedConvo);

  } else {
    // --- TRƯỜNG HỢP 2: CUỘC TRÒ CHUYỆN HOÀN TOÀN MỚI ---
    // Nếu không tìm thấy, đây là một cuộc hội thoại mới.
    // Cách đơn giản và hiệu quả nhất là gọi lại API để tải lại toàn bộ danh sách.
    console.log('Phát hiện cuộc trò chuyện mới! Đang tải lại danh sách...');
    fetchConversations(activeSystemId.value);
  }
};

// Hàm xử lý khi người dùng chọn một cuộc trò chuyện
const selectConversation = (conversationId) => {
  activeConversationId.value = conversationId;
};

onMounted(() => {
  socket.connect();
  socket.on('new_message', handleNewMessage);
});

onUnmounted(() => {
  socket.disconnect();
  socket.off('new_message', handleNewMessage);
});
</script>

<template>
  <div class="h-screen w-screen bg-gray-900 text-white flex">

    <aside class="w-64 bg-gray-800 flex-shrink-0">
      <Sidebar 
        :activeSystemId="activeSystemId"
        @select-system="activeSystemId = $event"
      />
    </aside>

    <section class="w-96 bg-gray-700 flex-shrink-0 border-l border-r border-gray-600">
      <ConversationList
        :conversations="conversations"
        :activeId="activeConversationId"
        @select-conversation="activeConversationId = $event"
      />
    </section>

    <main class="flex-1 flex flex-col">
      <ChatWindow
        :conversationId="activeConversationId"
        @message-sent="fetchConversations(activeSystemId)"
      />
    </main>

  </div>
</template>

<style>
/* Đảm bảo không có scrollbar không cần thiết */
html, body {
  overflow: hidden;
}
</style>