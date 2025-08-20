<script setup>
import { ref, watch } from 'vue';
import apiClient from '../api';
import { Trash2 } from 'lucide-vue-next';

const props = defineProps({
  systemId: String
});

const rules = ref([]);
const newRule = ref({ keyword: '', response: '' });

const fetchRules = async (systemId) => {
  if (!systemId) return;
  const response = await apiClient.get('/rules', { params: { systemId } });
  rules.value = response.data;
};

watch(() => props.systemId, fetchRules, { immediate: true });

const createRule = async () => {
  try {
    await apiClient.post('/rules', { ...newRule.value, systemId: props.systemId });
    newRule.value = { keyword: '', response: '' }; // Reset form
    fetchRules(props.systemId); // Tải lại danh sách
  } catch (error) {
    alert(error.response?.data?.error || 'Không thể tạo luật.');
  }
};

const deleteRule = async (ruleId) => {
  if (confirm('Bạn có chắc chắn muốn xóa luật này?')) {
    await apiClient.delete(`/rules/${ruleId}`);
    fetchRules(props.systemId);
  }
};
</script>
<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Quản lý Bot Trả lời Tự động</h2>

    <form @submit.prevent="createRule" class="bg-gray-700 p-4 rounded-lg mb-6 space-y-4">
      <input v-model="newRule.keyword" type="text" placeholder="Nhập từ khóa (ví dụ: giá)" class="w-full bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
      <textarea v-model="newRule.response" placeholder="Nhập câu trả lời của bot..." rows="3" class="w-full bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
      <button type="submit" class="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg font-semibold">Thêm Luật mới</button>
    </form>

    <div class="space-y-2">
      <div v-for="rule in rules" :key="rule.id" class="flex items-center justify-between bg-gray-800 p-3 rounded">
        <div>
          <p class="font-semibold text-cyan-400">{{ rule.keyword }}</p>
          <p class="text-gray-300 whitespace-pre-wrap">{{ rule.response }}</p>
        </div>
        <button @click="deleteRule(rule.id)" class="text-red-500 hover:text-red-400 p-2">
          <Trash2 />
        </button>
      </div>
    </div>
  </div>
</template>