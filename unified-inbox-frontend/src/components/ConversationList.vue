// src/components/ConversationList.vue
<script setup>
// Nhận props từ App.vue
defineProps({
  conversations: { type: Array, required: true },
  activeId: { type: String, default: null }
});
// Khai báo sự kiện sẽ được gửi lên component cha
const emit = defineEmits(['select-conversation']);
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
        <p class="font-bold">Chat ID: {{ convo.name }}</p>
        <p v-if="convo.messages && convo.messages.length > 0" class="text-sm text-gray-300 truncate">
          {{ convo.messages[0].text }}
        </p>
      </li>
    </ul>
  </div>
</template>