// Tạo một đối tượng Audio để có thể phát lại nhiều lần
let notificationSound = null;
let audioContext = null;

// Khởi tạo audio context và sound
const initAudio = () => {
  try {
    // Tạo audio context mới
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tạo audio element
    notificationSound = new Audio('/notification.mp3');
    notificationSound.preload = 'auto';
    
    // Đảm bảo audio được load
    notificationSound.addEventListener('canplaythrough', () => {
      console.log('Audio đã sẵn sàng phát');
    });
    
    notificationSound.addEventListener('error', (e) => {
      console.error('Lỗi khi load audio:', e);
    });
    
    console.log('Audio context đã được khởi tạo');
  } catch (error) {
    console.error('Không thể khởi tạo audio context:', error);
  }
};

export const playNotificationSound = () => {
  if (!notificationSound || !audioContext) {
    console.warn('Audio chưa được khởi tạo');
    return;
  }
  
  try {
    // Resume audio context nếu bị suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Reset thời gian về đầu để có thể phát lại ngay
    notificationSound.currentTime = 0;
    
    // Phát âm thanh
    const playPromise = notificationSound.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Âm thanh đang phát');
        })
        .catch(error => {
          console.warn("Không thể phát âm thanh:", error);
          // Thử khởi tạo lại audio nếu có lỗi
          if (error.name === 'NotAllowedError') {
            console.log('Cần user interaction để phát âm thanh');
          }
        });
    }
  } catch (error) {
    console.error('Lỗi khi phát âm thanh:', error);
  }
};

export const stopNotificationSound = () => {
  if (notificationSound) {
    notificationSound.pause();
    notificationSound.currentTime = 0;
  }
};

export const initNotificationAudio = () => {
  // Khởi tạo audio khi được gọi
  initAudio();
};

export const showBrowserNotification = (title, body) => {
  // Chỉ hiển thị nếu người dùng đã cấp quyền
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/favicon.ico' // Bạn có thể thay bằng logo của mình
    });
  }
};