import { ref, onMounted, onUnmounted } from 'vue';
import socket from '../socket.js';

export function useWebSocket() {
  const isConnected = ref(false);
  const connectionError = ref(null);

  // Connect to WebSocket
  const connect = () => {
    try {
      socket.connect();
      isConnected.value = true;
      connectionError.value = null;
      
      // Set up event listeners
      socket.on('connect', () => {
        console.log('WebSocket connected');
        isConnected.value = true;
        connectionError.value = null;
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        isConnected.value = false;
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        connectionError.value = error.message;
        isConnected.value = false;
      });

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      connectionError.value = error.message;
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    try {
      socket.disconnect();
      isConnected.value = false;
    } catch (error) {
      console.error('Error disconnecting from WebSocket:', error);
    }
  };

  // Listen for ticket updates
  const onTicketUpdate = (callback) => {
    socket.on('ticket_updated', callback);
  };

  // Listen for new tickets
  const onNewTicket = (callback) => {
    socket.on('ticket_created', callback);
  };

  // Listen for ticket deletions
  const onTicketDelete = (callback) => {
    socket.on('ticket_deleted', callback);
  };

  // Listen for comment updates
  const onCommentUpdate = (callback) => {
    socket.on('comment_added', callback);
  };

  // Remove all listeners
  const removeAllListeners = () => {
    socket.off('ticket_updated');
    socket.off('ticket_created');
    socket.off('ticket_deleted');
    socket.off('comment_added');
  };

  // Emit ticket status change
  const emitTicketStatusChange = (ticketId, newStatus) => {
    socket.emit('ticket_status_changed', { ticketId, newStatus });
  };

  // Emit ticket assignment
  const emitTicketAssignment = (ticketId, agentId) => {
    socket.emit('ticket_assigned', { ticketId, agentId });
  };

  // Emit new comment
  const emitNewComment = (ticketId, comment) => {
    socket.emit('comment_added', { ticketId, comment });
  };

  // Cleanup on unmount
  onUnmounted(() => {
    removeAllListeners();
  });

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    onTicketUpdate,
    onNewTicket,
    onTicketDelete,
    onCommentUpdate,
    removeAllListeners,
    emitTicketStatusChange,
    emitTicketAssignment,
    emitNewComment
  };
}
