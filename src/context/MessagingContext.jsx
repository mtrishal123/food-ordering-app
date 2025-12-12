import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const MessagingContext = createContext();

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadConversations = useCallback(() => {
    if (!user) return;
    
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const userConversations = allMessages.filter(
      msg => msg.senderId === user.id || msg.recipientId === user.id
    );
    
    // Group messages by conversation
    const grouped = {};
    userConversations.forEach(msg => {
      const otherId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      if (!grouped[otherId]) {
        grouped[otherId] = [];
      }
      grouped[otherId].push(msg);
    });
    
    // Sort messages in each conversation
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    setConversations(grouped);
    
    // Count unread messages
    const unread = userConversations.filter(
      msg => msg.recipientId === user.id && !msg.read
    ).length;
    setUnreadCount(unread);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const sendMessage = (recipientId, content) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const message = {
      id: Date.now().toString(),
      senderId: user.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('messages', JSON.stringify(allMessages));
    
    loadConversations();
    return { success: true, message };
  };

  const markAsRead = (conversationUserId) => {
    if (!user) return;
    
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = allMessages.map(msg => {
      if (msg.senderId === conversationUserId && msg.recipientId === user.id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    loadConversations();
  };

  const deleteConversation = (userId) => {
    if (!user) return;
    
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const filteredMessages = allMessages.filter(
      msg => !(
        (msg.senderId === user.id && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.recipientId === user.id)
      )
    );
    
    localStorage.setItem('messages', JSON.stringify(filteredMessages));
    loadConversations();
  };

  const value = {
    conversations,
    unreadCount,
    sendMessage,
    markAsRead,
    deleteConversation,
    loadConversations
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  
  return context;
}