<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ConversationList from './components/ConversationList.vue';
import ChatWindow from './components/ChatWindow.vue';
import RuleManager from './components/RuleManager.vue';
import socket from './socket';
import apiClient from './api'; // Import apiClient
import { playNotificationSound, stopNotificationSound, showBrowserNotification, initNotificationAudio } from './utils';

const systems = ref([]);
const conversations = ref([]);
const activeSystemId = ref(null);
const activeConversationId = ref(null);
const showRuleManager = ref(false);

const activeConversation = computed(() => {
  if (!activeConversationId.value) return null;
  return conversations.value.find(c => c.id === activeConversationId.value);
});

const audioUnlocked = ref(false);

const unlockAudio = () => {
  if (!audioUnlocked.value) {
    // Khởi tạo audio context
    initNotificationAudio();
    
    // Thử phát âm thanh để "mở khóa" audio context
    setTimeout(() => {
      playNotificationSound();
      // Dừng ngay sau một khoảng thời gian rất ngắn
      setTimeout(() => stopNotificationSound(), 100);
    }, 100);
    
    audioUnlocked.value = true;
    window.removeEventListener('click', unlockAudio);
    console.log("Audio context đã được mở khóa!");
  }
};

// Function test âm thanh
const testSound = () => {
  if (!audioUnlocked.value) {
    unlockAudio();
  } else {
    playNotificationSound();
    console.log('Đang test âm thanh...');
  }
};

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

  if (document.hidden) {
    // Chỉ phát âm thanh nếu đã được "mở khóa"
    if (audioUnlocked.value) {
      playNotificationSound();
    }
    showBrowserNotification(
      `Tin nhắn mới từ ${newMessage.conversation.name || 'khách'}`,
      newMessage.text
    );
  } else {
    // Nếu tab đang active, vẫn phát âm thanh nếu đã được mở khóa
    if (audioUnlocked.value) {
      playNotificationSound();
    }
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

onMounted(() => {
  // Mở khóa âm thanh khi người dùng click vào trang
  window.addEventListener('click', unlockAudio);

  // Hỏi quyền hiển thị thông báo
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // Tải danh sách cuộc trò chuyện lần đầu
  fetchConversations();

  // Kết nối và lắng nghe WebSocket
  socket.connect();
  socket.on('new_message', handleNewMessage);
});

onUnmounted(() => {
  window.removeEventListener('click', unlockAudio);
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
        @toggle-rules="showRuleManager = !showRuleManager"
      />
      
      <!-- Button test âm thanh -->
      <div class="p-4 border-t border-gray-700">
        <button 
          @click="testSound" 
          class="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-sm"
        >
          🔊 Test Âm thanh
        </button>
        <p class="text-xs text-gray-400 mt-2 text-center">
          {{ audioUnlocked ? '✅ Âm thanh đã sẵn sàng' : '⏳ Cần click để mở khóa' }}
        </p>
      </div>
    </aside>

    <div v-if="showRuleManager" class="flex-1 overflow-y-auto">
      <RuleManager :systemId="activeSystemId" />
    </div>

    <div v-else class="flex flex-1 overflow-hidden">
      <section class="w-96 bg-gray-700 flex-shrink-0 border-l border-r border-gray-600">
        <ConversationList 
          :conversations="conversations"
          :activeId="activeConversationId"
          @select-conversation="activeConversationId = $event"
        />
      </section>
      <main class="flex-1 flex flex-col">
        <ChatWindow 
          :conversation="activeConversation"
          @message-sent="fetchConversations(activeSystemId)"
        />
      </main>
    </div>
    
  </div>
</template>

<style>
/* Đảm bảo không có scrollbar không cần thiết */
html, body {
  overflow: hidden;
}
</style>