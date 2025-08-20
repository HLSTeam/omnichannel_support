// src/services/telegram.service.js
import axios from 'axios';

/**
 * Gửi tin nhắn tới một chat cụ thể qua Telegram Bot API.
 * @param {string} token - API Token của bot.
 * @param {number|string} chatId - ID của cuộc trò chuyện cần gửi tin nhắn đến.
 * @param {string} text - Nội dung tin nhắn.
 * @returns {Promise<object>} - Dữ liệu trả về từ Telegram API.
 */
const sendMessage = async (token, chatId, text) => {
  // Tạo URL để gọi API của Telegram
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    console.log(`Đang gửi tin nhắn tới chat ID ${chatId}: "${text}"`);
    
    // Gửi yêu cầu POST tới Telegram
    const response = await axios.post(apiUrl, {
      chat_id: chatId,
      text: text,
    });

    console.log('Gửi tin nhắn thành công!');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn Telegram:', error.response ? error.response.data : error.message);
    // Ném lỗi ra để nơi gọi nó có thể xử lý
    throw error;
  }
};

export default { sendMessage };

