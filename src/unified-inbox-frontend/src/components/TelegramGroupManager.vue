<template>
  <div class="telegram-group-manager">
    <!-- Header -->
    <div class="header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        🚀 Telegram Groups Management
      </h2>
      <p class="text-gray-600 mb-6">
        Quản lý các nhóm Telegram cho Admin, Customer và Supplier
      </p>
    </div>

    <!-- Groups List - ĐƯA LÊN TRÊN -->
    <div class="groups-list bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-700">
          📋 Danh Sách Nhóm ({{ filteredGroups.length }})
        </h3>
        
        <!-- Filter Controls -->
        <div class="flex space-x-4">
          <select
            v-model="filterType"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="ADMIN">👑 Admin</option>
            <option value="CUSTOMER">👥 Customer</option>
            <option value="SUPPLIER">🚚 Supplier</option>
          </select>
          
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">🟢 Hoạt động</option>
            <option value="false">🔴 Không hoạt động</option>
          </select>
        </div>
      </div>


      
      <!-- Groups Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhóm
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chat ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="group in filteredGroups" :key="group.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ group.groupName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ group.description || 'Không có mô tả' }}
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getGroupTypeBadgeClass(group.groupType)">
                  {{ getGroupTypeLabel(group.groupType) }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-mono">
                  {{ group.chatId }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ group.chatTitle || 'Không có tên' }}
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ group.isActive ? '🟢 Hoạt động' : '🔴 Không hoạt động' }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editGroup(group)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs"
                  >
                    ✏️ Sửa
                  </button>
                  
                  <button
                    @click="managePermissions(group)"
                    class="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md text-xs"
                  >
                    🔐 Permissions
                  </button>
                  
                  <button
                    @click="manageTopics(group)"
                    class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs"
                  >
                    📂 Topics ({{ group.group_topics?.length || 0 }})
                  </button>
                  
                  <button
                    @click="toggleGroupStatus(group)"
                    :class="group.isActive ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100' : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'"
                    class="px-3 py-1 rounded-md text-xs"
                  >
                    {{ group.isActive ? '🔴 Ẩn' : '🟢 Hiện' }}
                  </button>
                  
                  <button
                    @click="deleteGroup(group)"
                    class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredGroups.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📭</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Không có nhóm nào</h3>
        <p class="text-gray-500">Hãy thêm nhóm đầu tiên để bắt đầu!</p>
      </div>
    </div>

    <!-- Add New Group Form - ĐƯA XUỐNG DƯỚI -->
    <div class="add-group-section bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        ➕ Thêm Nhóm Mới
      </h3>
      
      <form @submit.prevent="addGroup" class="space-y-4">
        <div class="grid grid-cols-1 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên Nhóm *
            </label>
            <input
              v-model="newGroup.groupName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Admin Internal, Customer Support"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Loại Nhóm *
            </label>
            <select
              v-model="newGroup.groupType"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn loại nhóm</option>
              <option value="ADMIN">👑 Admin (Quản trị nội bộ)</option>
              <option value="CUSTOMER">👥 Customer (Khách hàng)</option>
              <option value="SUPPLIER">🚚 Supplier (Nhà cung cấp)</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chat ID *
            </label>
            <input
              v-model="newGroup.chatId"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="VD: -1001234567890"
            />
            <p class="text-xs text-gray-500 mt-1">
              Chat ID từ Telegram group (bắt đầu bằng -100)
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên Group trên Telegram
            </label>
            <input
              v-model="newGroup.chatTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Admin - Quản trị hệ thống"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            v-model="newGroup.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chức năng của nhóm này..."
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isAdding"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <span v-if="isAdding" class="animate-spin mr-2">⏳</span>
            {{ isAdding ? 'Đang thêm...' : 'Thêm Nhóm' }}
          </button>
        </div>
      </form>
    </div>



    <!-- Edit Group Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">✏️ Sửa Nhóm</h3>
          
          <form @submit.prevent="updateGroup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên Nhóm
              </label>
              <input
                v-model="editingGroup.groupName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Loại Nhóm
              </label>
              <select
                v-model="editingGroup.groupType"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">👑 Admin</option>
                <option value="CUSTOMER">👥 Customer</option>
                <option value="SUPPLIER">🚚 Supplier</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Chat ID
              </label>
              <input
                v-model="editingGroup.chatId"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                v-model="editingGroup.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Permission Management Modal -->
    <div v-if="showPermissionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">🔐 Quản Lý Permissions</h3>
            <button
              @click="showPermissionModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="text-2xl">×</span>
            </button>
          </div>
          
          <div v-if="selectedGroupForPermissions" class="space-y-6">
            <!-- Group Info -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">
                {{ selectedGroupForPermissions.groupName }}
              </h4>
              <p class="text-sm text-gray-600">
                Loại: {{ getGroupTypeLabel(selectedGroupForPermissions.groupType) }} | 
                Chat ID: {{ selectedGroupForPermissions.chatId }}
              </p>
            </div>

            <!-- Permission Templates -->
            <div>
              <h5 class="font-medium text-gray-700 mb-3">📋 Permission Templates</h5>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  v-for="template in permissionTemplates"
                  :key="template.role"
                  @click="applyPermissionTemplate(template.role)"
                  class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div class="flex items-center mb-2">
                    <span class="text-xl mr-2">{{ template.icon }}</span>
                    <span class="font-medium text-sm">{{ template.name }}</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ template.permissions.length }} permissions
                  </div>
                </button>
              </div>
            </div>

            <!-- Custom Permissions -->
            <div>
              <h5 class="font-medium text-gray-700 mb-3">⚙️ Custom Permissions</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="permission in availablePermissions" :key="permission.name" class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    :id="`perm-${permission.name}`"
                    type="checkbox"
                    :checked="groupPermissions.includes(permission.name)"
                    @change="togglePermission(permission.name)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label :for="`perm-${permission.name}`" class="text-sm font-medium text-gray-700">
                    {{ permission.name }}
                  </label>
                  <span class="text-xs text-gray-500 ml-auto">
                    {{ permission.description }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end space-x-3">
              <button
                @click="showPermissionModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Hủy
              </button>
              <button
                @click="saveGroupPermissions"
                :disabled="isSavingPermissions"
                class="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 rounded-md text-sm"
              >
                {{ isSavingPermissions ? '💾 Đang lưu...' : '💾 Lưu Permissions' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topic Management Modal -->
    <div v-if="showTopicModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">📂 Quản Lý Topics</h3>
            <button
              @click="showTopicModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="text-2xl">×</span>
            </button>
          </div>
          
          <div v-if="selectedGroupForTopics" class="space-y-6">
            <!-- Group Info -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">
                {{ selectedGroupForTopics.groupName }}
              </h4>
              <p class="text-sm text-gray-600">
                Loại: {{ getGroupTypeLabel(selectedGroupForTopics.groupType) }} | 
                Chat ID: {{ selectedGroupForTopics.chatId }}
              </p>
            </div>

            <!-- Add New Topic Form -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h5 class="font-medium text-gray-700 mb-3">➕ Thêm Topic Mới</h5>
              <form @submit.prevent="addTopic" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Tên Topic *
                    </label>
                    <input
                      v-model="newTopic.topicName"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="VD: Chăm sóc khách hàng"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      System *
                    </label>
                    <select
                      v-model="newTopic.systemId"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Chọn system</option>
                      <option v-for="system in availableSystems" :key="system.id" :value="system.id">
                        {{ system.name }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Topic ID (Telegram)
                    </label>
                    <input
                      v-model="newTopic.topicId"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Thread ID từ Telegram"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <input
                      v-model="newTopic.description"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Mô tả ngắn gọn"
                    />
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="isAddingTopic"
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {{ isAddingTopic ? '⏳ Đang thêm...' : '➕ Thêm Topic' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Existing Topics List -->
            <div>
              <h5 class="font-medium text-gray-700 mb-3">📋 Danh Sách Topics ({{ groupTopics.length }})</h5>
              <div v-if="groupTopics.length > 0" class="space-y-2">
                <div v-for="topic in groupTopics" :key="topic.id" class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h6 class="font-medium text-gray-900">{{ topic.topicName }}</h6>
                      <p class="text-sm text-gray-600 mt-1">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {{ topic.System?.name || 'Unknown System' }}
                        </span>
                        <span v-if="topic.topicId" class="ml-2 text-gray-500">
                          ID: {{ topic.topicId }}
                        </span>
                      </p>
                      <p v-if="topic.description" class="text-sm text-gray-500 mt-1">
                        {{ topic.description }}
                      </p>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="editTopic(topic)"
                        class="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        @click="deleteTopic(topic)"
                        class="text-red-600 hover:text-red-900 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                Chưa có topic nào. Hãy thêm topic đầu tiên!
              </div>
            </div>

            <!-- Close Button -->
            <div class="flex justify-end">
              <button
                @click="showTopicModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Topic Modal -->
    <div v-if="showEditTopicModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">✏️ Sửa Topic</h3>
          
          <form @submit.prevent="updateTopic" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên Topic
              </label>
              <input
                v-model="editingTopic.topicName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                System
              </label>
              <select
                v-model="editingTopic.systemId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="system in availableSystems" :key="system.id" :value="system.id">
                  {{ system.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Topic ID (Telegram)
              </label>
              <input
                v-model="editingTopic.topicId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                v-model="editingTopic.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showEditTopicModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isUpdatingTopic"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isUpdatingTopic ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="messageType === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'" class="fixed top-4 right-4 border px-4 py-3 rounded z-50">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import api from '../api.js';

export default {
  name: 'TelegramGroupManager',
  setup() {
    // Reactive data
    const groups = ref([]);
    const filterType = ref('');
    const filterStatus = ref('');
    const showEditModal = ref(false);
    const editingGroup = ref({});
    const isAdding = ref(false);
    const isUpdating = ref(false);
    const message = ref('');
    const messageType = ref('success');
    
    // Permission management
    const showPermissionModal = ref(false);
    const selectedGroupForPermissions = ref(null);
    const groupPermissions = ref([]);
    const isSavingPermissions = ref(false);

    // Topic management
    const showTopicModal = ref(false);
    const showEditTopicModal = ref(false);
    const selectedGroupForTopics = ref(null);
    const groupTopics = ref([]);
    const availableSystems = ref([]);
    const isAddingTopic = ref(false);
    const isUpdatingTopic = ref(false);
    const newTopic = ref({
      topicName: '',
      systemId: '',
      topicId: '',
      description: ''
    });
    const editingTopic = ref({});

    // New group form
    const newGroup = ref({
      groupName: '',
      groupType: '',
      chatId: '',
      description: '',
      chatTitle: ''
    });

    // Available permissions
    const availablePermissions = ref([
      { name: 'view_all', description: 'Xem tất cả dữ liệu' },
      { name: 'system_logs', description: 'Xem system logs' },
      { name: 'application_logs', description: 'Xem application logs' },
      { name: 'error_logs', description: 'Xem error logs' },
      { name: 'transaction_logs', description: 'Xem transaction logs' },
      { name: 'transaction_status', description: 'Xem trạng thái giao dịch' },
      { name: 'create_ticket', description: 'Tạo ticket mới' },
      { name: 'view_tickets', description: 'Xem danh sách tickets' },
      { name: 'assign_ticket', description: 'Assign ticket cho agent' },
      { name: 'manage_tickets', description: 'Quản lý tickets' },
      { name: 'system_management', description: 'Quản lý hệ thống' },
      { name: 'view_own', description: 'Chỉ xem dữ liệu của mình' }
    ]);

    // Permission templates
    const permissionTemplates = ref([
      {
        role: 'admin',
        name: '👑 Admin',
        icon: '👑',
        permissions: ['view_all', 'system_logs', 'application_logs', 'error_logs', 'transaction_logs', 'system_management']
      },
      {
        role: 'supplier',
        name: '🚚 Supplier',
        icon: '🚚',
        permissions: ['view_own', 'transaction_logs', 'transaction_status', 'create_ticket', 'view_tickets']
      },
      {
        role: 'customer',
        name: '👥 Customer',
        icon: '👥',
        permissions: ['view_own', 'transaction_status', 'create_ticket', 'view_tickets']
      },
      {
        role: 'agent',
        name: '👨‍💼 Agent',
        icon: '👨‍💼',
        permissions: ['view_own', 'view_tickets', 'assign_ticket', 'manage_tickets', 'create_ticket']
      }
    ]);

    // Computed properties
    const filteredGroups = computed(() => {
      let filtered = groups.value;
      
      if (filterType.value) {
        filtered = filtered.filter(group => group.groupType === filterType.value);
      }
      
      if (filterStatus.value !== '') {
        const isActive = filterStatus.value === 'true';
        filtered = filtered.filter(group => group.isActive === isActive);
      }
      
      return filtered;
    });

    // Methods
    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    const loadGroups = async () => {
      try {
        // Check if we have auth token
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showMessage('Không tìm thấy token đăng nhập', 'error');
          return;
        }
        
        const response = await api.get('/telegram-groups');
        
        if (response.data && response.data.success) {
          groups.value = response.data.data || [];
        } else {
          groups.value = [];
        }
        
        // Force reactivity update
        groups.value = [...groups.value];
        
      } catch (error) {
        console.error('Error loading groups:', error);
        
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          showMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
          // Clear invalid token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('agentProfile');
          window.location.href = '/login';
          return;
        }
        

        
        showMessage('Lỗi khi tải danh sách nhóm', 'error');
      }
    };

    const addGroup = async () => {
      try {
        isAdding.value = true;
        const response = await api.post('/telegram-groups', newGroup.value);
        
        // Reset form
        newGroup.value = {
          groupName: '',
          groupType: '',
          chatId: '',
          description: '',
          chatTitle: ''
        };
        
        // Reload groups
        await loadGroups();
        showMessage('Thêm nhóm thành công!', 'success');
      } catch (error) {
        console.error('Error adding group:', error);
        showMessage(error.response?.data?.error || 'Lỗi khi thêm nhóm', 'error');
      } finally {
        isAdding.value = false;
      }
    };

    const editGroup = (group) => {
      editingGroup.value = { ...group };
      showEditModal.value = true;
    };

    const updateGroup = async () => {
      try {
        console.log('🔄 Updating group:', editingGroup.value);
        isUpdating.value = true;
        
        // Chỉ gửi fields cần thiết, loại bỏ relations và computed fields
        const updateData = {
          groupName: editingGroup.value.groupName,
          groupType: editingGroup.value.groupType,
          chatId: editingGroup.value.chatId,
          description: editingGroup.value.description,
          chatTitle: editingGroup.value.chatTitle,
          memberCount: editingGroup.value.memberCount,
          isActive: editingGroup.value.isActive
        };
        
        console.log('📤 Sending update data:', updateData);
        const response = await api.put(`/telegram-groups/${editingGroup.value.id}`, updateData);
        console.log('✅ Update response:', response);
        
        showEditModal.value = false;
        await loadGroups();
        showMessage('Cập nhật nhóm thành công!', 'success');
      } catch (error) {
        console.error('❌ Error updating group:', error);
        console.error('❌ Error response:', error.response);
        showMessage(error.response?.data?.error || 'Lỗi khi cập nhật nhóm', 'error');
      } finally {
        isUpdating.value = false;
      }
    };

    const toggleGroupStatus = async (group) => {
      try {
        console.log('🔄 Toggling group status:', group.id, 'from', group.isActive, 'to', !group.isActive);
        
        await api.put(`/telegram-groups/${group.id}`, {
          isActive: !group.isActive
        });
        
        await loadGroups();
        showMessage(`${group.isActive ? 'Ẩn' : 'Hiện'} nhóm thành công!`, 'success');
      } catch (error) {
        console.error('❌ Error toggling group status:', error);
        showMessage('Lỗi khi thay đổi trạng thái nhóm', 'error');
      }
    };

    const deleteGroup = async (group) => {
      if (!confirm(`Bạn có chắc muốn xóa nhóm "${group.groupName}"?`)) {
        return;
      }
      
      try {
        await api.delete(`/telegram-groups/${group.id}`);
        await loadGroups();
        showMessage('Xóa nhóm thành công!', 'success');
      } catch (error) {
        console.error('Error deleting group:', error);
        showMessage('Lỗi khi xóa nhóm', 'error');
      }
    };

    // Permission management methods
    const managePermissions = async (group) => {
      selectedGroupForPermissions.value = group;
      groupPermissions.value = [];
      showPermissionModal.value = true;
      
      // Load current permissions for this group
      try {
        const response = await api.get(`/permissions/role/${group.groupType.toLowerCase()}`);
        if (response.data && response.data.success) {
          groupPermissions.value = response.data.data.permissions || [];
        }
      } catch (error) {
        console.error('Error loading group permissions:', error);
        // Use default permissions based on group type
        const template = permissionTemplates.value.find(t => t.role === group.groupType.toLowerCase());
        if (template) {
          groupPermissions.value = [...template.permissions];
        }
      }
    };

    const togglePermission = (permissionName) => {
      const index = groupPermissions.value.indexOf(permissionName);
      if (index > -1) {
        groupPermissions.value.splice(index, 1);
      } else {
        groupPermissions.value.push(permissionName);
      }
    };

    const applyPermissionTemplate = (role) => {
      const template = permissionTemplates.value.find(t => t.role === role);
      if (template) {
        groupPermissions.value = [...template.permissions];
        showMessage(`Đã áp dụng template ${template.name}`, 'success');
      }
    };

    const saveGroupPermissions = async () => {
      if (!selectedGroupForPermissions.value) return;

      try {
        isSavingPermissions.value = true;
        
        // Update group permissions via backend API
        await api.put(`/telegram-groups/${selectedGroupForPermissions.value.id}`, {
          permissions: groupPermissions.value
        });
        
        showMessage('Lưu permissions thành công!', 'success');
        showPermissionModal.value = false;
      } catch (error) {
        console.error('Error saving permissions:', error);
        showMessage('Lỗi khi lưu permissions', 'error');
      } finally {
        isSavingPermissions.value = false;
      }
    };

    const getGroupTypeLabel = (type) => {
      const labels = {
        'ADMIN': '👑 Admin',
        'CUSTOMER': '👥 Customer',
        'SUPPLIER': '🚚 Supplier'
      };
      return labels[type] || type;
    };

    const getGroupTypeBadgeClass = (type) => {
      const classes = {
        'ADMIN': 'bg-purple-100 text-purple-800',
        'CUSTOMER': 'bg-blue-100 text-blue-800',
        'SUPPLIER': 'bg-green-100 text-green-800'
      };
      return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[type] || 'bg-gray-100 text-gray-800'}`;
    };

    // Topic management methods
    const loadSystems = async () => {
      try {
        const response = await api.get('/systems');
        // API returns { status: 'success', data: [...] }
        if (response.data && response.data.status === 'success') {
          availableSystems.value = response.data.data || [];
        }
      } catch (error) {
        console.error('Error loading systems:', error);
        showMessage('Lỗi khi tải danh sách systems', 'error');
      }
    };

    const manageTopics = async (group) => {
      selectedGroupForTopics.value = group;
      groupTopics.value = group.group_topics || [];
      showTopicModal.value = true;
      
      // Reset new topic form
      newTopic.value = {
        topicName: '',
        systemId: '',
        topicId: '',
        description: ''
      };
      
      // Load systems if not already loaded
      if (availableSystems.value.length === 0) {
        await loadSystems();
      }
    };

    const addTopic = async () => {
      if (!selectedGroupForTopics.value) return;
      
      try {
        isAddingTopic.value = true;
        const response = await api.post('/group-topics', {
          ...newTopic.value,
          groupId: selectedGroupForTopics.value.id
        });
        
        if (response.data && response.data.success) {
          showMessage('Thêm topic thành công!', 'success');
          
          // Reset form
          newTopic.value = {
            topicName: '',
            systemId: '',
            topicId: '',
            description: ''
          };
          
          // Reload topics
          const topicsResponse = await api.get(`/group-topics?groupId=${selectedGroupForTopics.value.id}`);
          if (topicsResponse.data && topicsResponse.data.success) {
            groupTopics.value = topicsResponse.data.data || [];
          }
          
          // Reload groups to update the count
          await loadGroups();
        }
      } catch (error) {
        console.error('Error adding topic:', error);
        showMessage(error.response?.data?.error || 'Lỗi khi thêm topic', 'error');
      } finally {
        isAddingTopic.value = false;
      }
    };

    const editTopic = (topic) => {
      editingTopic.value = { ...topic };
      showEditTopicModal.value = true;
    };

    const updateTopic = async () => {
      try {
        isUpdatingTopic.value = true;
        const response = await api.put(`/group-topics/${editingTopic.value.id}`, {
          topicName: editingTopic.value.topicName,
          systemId: editingTopic.value.systemId,
          topicId: editingTopic.value.topicId,
          description: editingTopic.value.description
        });
        
        if (response.data && response.data.success) {
          showMessage('Cập nhật topic thành công!', 'success');
          showEditTopicModal.value = false;
          
          // Reload topics
          const topicsResponse = await api.get(`/group-topics?groupId=${selectedGroupForTopics.value.id}`);
          if (topicsResponse.data && topicsResponse.data.success) {
            groupTopics.value = topicsResponse.data.data || [];
          }
          
          // Reload groups
          await loadGroups();
        }
      } catch (error) {
        console.error('Error updating topic:', error);
        showMessage(error.response?.data?.error || 'Lỗi khi cập nhật topic', 'error');
      } finally {
        isUpdatingTopic.value = false;
      }
    };

    const deleteTopic = async (topic) => {
      if (!confirm(`Bạn có chắc muốn xóa topic "${topic.topicName}"?`)) {
        return;
      }
      
      try {
        await api.delete(`/group-topics/${topic.id}`);
        showMessage('Xóa topic thành công!', 'success');
        
        // Reload topics
        const topicsResponse = await api.get(`/group-topics?groupId=${selectedGroupForTopics.value.id}`);
        if (topicsResponse.data && topicsResponse.data.success) {
          groupTopics.value = topicsResponse.data.data || [];
        }
        
        // Reload groups to update the count
        await loadGroups();
      } catch (error) {
        console.error('Error deleting topic:', error);
        showMessage('Lỗi khi xóa topic', 'error');
      }
    };

    // Lifecycle
    onMounted(() => {
      loadGroups();
      loadSystems();
    });

    return {
      // Data
      groups,
      filterType,
      filterStatus,
      showEditModal,
      editingGroup,
      isAdding,
      isUpdating,
      message,
      messageType,
      newGroup,
      
      // Computed
      filteredGroups,
      
      // Methods
      showMessage,
      loadGroups,
      addGroup,
      editGroup,
      updateGroup,
      toggleGroupStatus,
      deleteGroup,
      getGroupTypeLabel,
      getGroupTypeBadgeClass,
      // Permission management
      managePermissions,
      togglePermission,
      applyPermissionTemplate,
      saveGroupPermissions,
      showPermissionModal,
      selectedGroupForPermissions,
      groupPermissions,
      isSavingPermissions,
      availablePermissions,
      permissionTemplates,
      // Topic management
      manageTopics,
      addTopic,
      editTopic,
      updateTopic,
      deleteTopic,
      showTopicModal,
      showEditTopicModal,
      selectedGroupForTopics,
      groupTopics,
      availableSystems,
      isAddingTopic,
      isUpdatingTopic,
      newTopic,
      editingTopic
    };
  }
};
</script>

<style scoped>
.telegram-group-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: auto !important;
  overflow: visible !important;
  position: static !important;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.add-group-section {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.groups-list {
  min-height: 400px;
  max-height: none !important;
  overflow: visible !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .telegram-group-manager {
    padding: 10px;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .add-group-section {
    padding: 1rem;
  }
  
  .groups-list {
    padding: 1rem;
  }
  
  /* Mobile table adjustments */
  .overflow-x-auto {
    font-size: 0.875rem;
  }
  
  .px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-4 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  /* Stack filter controls on mobile */
  .flex.space-x-4 {
    flex-direction: column;
    space-x: 0;
    gap: 0.5rem;
  }
  
  /* Adjust modal width on mobile */
  .w-96 {
    width: 90vw;
    max-width: 400px;
  }
}

@media (max-width: 640px) {
  .telegram-group-manager {
    padding: 5px;
  }
  
  .header h2 {
    font-size: 1.25rem;
  }
  
  .header p {
    font-size: 0.875rem;
  }
  
  /* Hide some table columns on very small screens */
  .hidden-xs {
    display: none;
  }
  
  /* Stack action buttons vertically on mobile */
  .flex.space-x-2 {
    flex-direction: column;
    space-x: 0;
    gap: 0.25rem;
  }
  
  .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Focus states for accessibility */
button:focus, input:focus, select:focus, textarea:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Hover effects */
.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.hover\:bg-green-700:hover {
  background-color: #15803d;
}

.hover\:bg-purple-700:hover {
  background-color: #7c3aed;
}

.hover\:bg-gray-700:hover {
  background-color: #374151;
}
</style>
