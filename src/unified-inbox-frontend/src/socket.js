import { io } from 'socket.io-client';

// URL của backend server
const URL = 'http://unified_inbox_backend:3000';

const socket = io(URL, {
  autoConnect: false // Chỉ kết nối khi chúng ta gọi socket.connect()
});

// In log các sự kiện để gỡ lỗi
socket.onAny((event, ...args) => {
  console.log(`[Socket event]: ${event}`, args);
});

export default socket;