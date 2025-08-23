<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ConversationList from './components/ConversationList.vue';
import ChatWindow from './components/ChatWindow.vue';

import KanbanBoard from './components/KanbanBoard.vue';
import socket from './socket';
import apiClient from './api'; // Import apiClient
import { showBrowserNotification } from './utils';

const systems = ref([]);
const conversations = ref([]);
const activeSystemId = ref(null);
const activeConversationId = ref(null);
const currentView = ref('chat'); // 'chat' hoặc 'helpdesk'

const activeConversation = computed(() => {
  if (!activeConversationId.value) return null;
  return conversations.value.find(c => c.id === activeConversationId.value);
});



// Hàm để lấy danh sách cuộc trò chuyện từ API
const fetchConversations = async (systemId) => {
  if (!systemId) {
    conversations.value = [];
    return;
  }
  try {
    console.log('Fetching conversations for systemId:', systemId);
          const response = await apiClient.get('/api/v1/conversations', {
      params: { systemId: systemId }
    });
    console.log('Conversations response:', response.data);
    conversations.value = response.data;
  } catch (err) {
    console.error("Lỗi khi tải cuộc trò chuyện:", err);
    conversations.value = [];
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

  if (document.hidden) {
    showBrowserNotification(
      `Tin nhắn mới từ ${newMessage.conversation.name || 'khách'}`,
      newMessage.text
    );
  }

  const conversationIndex = conversations.value.findIndex(
    (c) => c.id === newMessage.conversationId
  );

  if (conversationIndex !== -1) {
    // --- TRƯỜNG HỢP 1: CUỘC TRÒ CHUYỆN ĐÃ CÓ ---
    const updatedConvo = conversations.value[conversationIndex];
    
    // Cập nhật tin nhắn cuối cùng để hiển thị trên list
    updatedConvo.messages = [newMessage]; 
    
    // Cập nhật thời gian để sắp xếp lại
    updatedConvo.updatedAt = newMessage.createdAt; 
    
    // Cập nhật thông tin người gửi tin nhắn cuối
    if (newMessage.sender === 'USER') {
      updatedConvo.lastSenderName = newMessage.user?.name || newMessage.customerName || 'Khách hàng';
    } else if (newMessage.sender === 'AGENT') {
      updatedConvo.lastSenderName = newMessage.agent?.name || 'Nhân viên hỗ trợ';
    }

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

// Hàm xử lý khi chuyển đổi view
const toggleChat = () => {
  currentView.value = 'chat';
};

const toggleHelpdesk = () => {
  currentView.value = 'helpdesk';
};

onMounted(async () => {
  // Hỏi quyền hiển thị thông báo
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // Load systems
  try {
    const response = await apiClient.get('/api/v1/systems');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      systems.value = response.data.data;
      // Tự động chọn hệ thống đầu tiên
      if (response.data.data.length > 0) {
        activeSystemId.value = response.data.data[0].id;
      }
    }
  } catch (err) {
    console.error('Error loading systems:', err);
  }

  // Tải danh sách cuộc trò chuyện lần đầu
  fetchConversations();

  // Kết nối và lắng nghe WebSocket
  socket.connect();
  socket.on('new_message', handleNewMessage);
});

onUnmounted(() => {
  socket.disconnect();
  socket.off('new_message', handleNewMessage);
});
</script>

<template>
  <div class="h-screen w-screen bg-slate-50 text-slate-800 flex">
    
    <aside class="w-64 bg-white flex-shrink-0 shadow-lg border-r border-slate-200">
      <Sidebar 
        @toggle-chat="toggleChat"
        @toggle-kanban="toggleHelpdesk"
      />
    </aside>

    <!-- Helpdesk View -->
    <div v-if="currentView === 'helpdesk'" class="flex-1 overflow-y-auto">
      <KanbanBoard :systemId="activeSystemId" />
    </div>

    <!-- Chat View -->
    <div v-else class="flex-1 bg-slate-50 flex flex-col min-h-0">
      <!-- Systems Tabs Header -->
      <div v-if="systems.length > 0" class="w-full bg-white border-b border-slate-200 px-4 py-4 shadow-sm flex-shrink-0">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-semibold text-slate-800">Kênh Chat</h1>
          </div>
          <div class="text-sm text-slate-500">
            {{ systems.length }} hệ thống
          </div>
        </div>
        <div class="flex space-x-2 overflow-x-auto">
          <button
            v-for="system in systems"
            :key="system.id"
            @click="activeSystemId = system.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border shadow-sm',
              activeSystemId === system.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            ]"
          >
            {{ system.name }}
          </button>
        </div>
      </div>
      
      <!-- Chat Interface -->
      <div v-if="activeSystemId" class="flex flex-1 p-4 gap-4 min-h-0">
        <!-- Conversations Panel -->
        <div class="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex-shrink-0">
            <h2 class="text-lg font-semibold text-white">Cuộc trò chuyện</h2>
            <p class="text-blue-100 text-sm mt-1">
              {{ conversations.length }} cuộc trò chuyện
            </p>
          </div>
          <div class="flex-1 overflow-y-auto min-h-0">
            <ConversationList 
              :conversations="conversations"
              :activeId="activeConversationId"
              @select-conversation="activeConversationId = $event"
            />
          </div>
        </div>
        
        <!-- Chat Panel -->
        <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
          <div class="bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-4 flex-shrink-0">
            <h2 class="text-lg font-semibold text-white">Tin nhắn</h2>
            <p class="text-slate-200 text-sm mt-1">
              {{ activeConversation ? activeConversation.name : 'Chọn cuộc trò chuyện' }}
            </p>
          </div>
          <div class="flex-1 overflow-hidden min-h-0">
            <ChatWindow 
              :conversation="activeConversation"
              @message-sent="fetchConversations(activeSystemId)"
            />
          </div>
        </div>
      </div>
      
      <!-- No System Selected -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center bg-white rounded-xl p-12 shadow-sm border border-slate-200">
          <div class="text-6xl mb-6">💬</div>
          <h3 class="text-2xl font-bold mb-4 text-slate-800">Chọn hệ thống để bắt đầu chat</h3>
          <p class="text-lg text-slate-600 mb-6">Click vào một tab hệ thống ở trên để hiển thị các cuộc trò chuyện</p>
          <div class="text-4xl">👇</div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style>
/* Đảm bảo không có scrollbar không cần thiết */
html, body {
  overflow: hidden;
}
</style>