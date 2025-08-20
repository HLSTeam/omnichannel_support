// src/components/ConversationList.vue
<script setup>
// Nhận props từ App.vue
defineProps({
  conversations: { type: Array, required: true },
  activeId: { type: String, default: null }
});
// Khai báo sự kiện sẽ được gửi lên component cha
const emit = defineEmits(['select-conversation']);

// Helper function để lấy thông tin người gửi từ tin nhắn cuối cùng
const getLastMessageInfo = (conversation) => {
  if (!conversation.messages || conversation.messages.length === 0) {
    return { sender: null, text: null, time: null };
  }
  
  const lastMessage = conversation.messages[0]; // Tin nhắn cuối cùng
  
  // Debug: Log dữ liệu thực tế
  console.log('Conversation:', conversation.name || conversation.id);
  console.log('Last message:', lastMessage);
  console.log('Message sender:', lastMessage.sender);
  console.log('Message user:', lastMessage.user);
  console.log('Message customerName:', lastMessage.customerName);
  console.log('Conversation lastSenderName:', conversation.lastSenderName);
  
  // Ưu tiên sử dụng lastSenderName từ conversation (đã được cập nhật)
  let senderName = conversation.lastSenderName;
  
  // Nếu không có, thử lấy từ message
  if (!senderName && lastMessage) {
    if (lastMessage.sender === 'USER') {
      senderName = lastMessage.user?.name || lastMessage.customerName || 'Khách hàng';
    } else if (lastMessage.sender === 'AGENT') {
      senderName = lastMessage.agent?.name || 'Nhân viên hỗ trợ';
    } else {
      senderName = 'Hệ thống';
    }
  }
  
  return {
    sender: senderName,
    text: lastMessage.text,
    time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : null
  };
};

// Helper function để format tên conversation
const getConversationName = (conversation) => {
  // Ưu tiên tên conversation
  if (conversation.name) return conversation.name;
  
  // Thử lấy tên khách hàng
  if (conversation.customerName) return conversation.customerName;
  
  // Thử lấy tên user từ tin nhắn đầu tiên
  if (conversation.messages && conversation.messages.length > 0) {
    const firstMessage = conversation.messages[conversation.messages.length - 1]; // Tin nhắn đầu tiên
    if (firstMessage.user?.name) return firstMessage.user.name;
    if (firstMessage.customerName) return firstMessage.customerName;
  }
  
  // Fallback: Chat ID
  if (conversation.platformChatId) return `Chat ID: ${conversation.platformChatId}`;
  
  return 'Khách hàng';
};
</script>

<template>
  <div class="p-2 h-full overflow-y-auto">
    <h2 class="text-lg font-semibold mb-2 p-2">Cuộc trò chuyện</h2>

    <div v-if="conversations.length === 0" class="text-gray-400 text-center mt-8">
      Chưa có cuộc trò chuyện nào.
    </div>

    <ul v-else class="space-y-1">
      <li
        v-for="convo in conversations"
        :key="convo.id"
        @click="emit('select-conversation', convo.id)"
        :class="[
          'p-3 rounded-lg cursor-pointer transition-colors',
          activeId === convo.id ? 'bg-cyan-600' : 'hover:bg-gray-600'
        ]"
      >
        <!-- Tên conversation -->
        <div class="flex items-center justify-between mb-1">
          <p class="font-bold truncate text-white">
            {{ getConversationName(convo) }}
          </p>
          <span v-if="getLastMessageInfo(convo).time" class="text-xs text-gray-400">
            {{ getLastMessageInfo(convo).time }}
          </span>
        </div>

        <!-- Thông tin người gửi và tin nhắn -->
        <div v-if="getLastMessageInfo(convo).sender" class="space-y-1">
          <p class="text-sm text-cyan-400 font-medium">
            {{ getLastMessageInfo(convo).sender }}
          </p>
          <p v-if="getLastMessageInfo(convo).text" class="text-sm text-gray-300 truncate">
            {{ getLastMessageInfo(convo).text }}
          </p>
        </div>

        <!-- Fallback khi không có tin nhắn -->
        <p v-else class="text-sm text-gray-400 italic">
          Chưa có tin nhắn
        </p>
      </li>
    </ul>
  </div>
</template>