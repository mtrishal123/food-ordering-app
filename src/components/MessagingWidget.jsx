import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../context/MessagingContext';
import { useWallet } from '../context/WalletContext';
import './MessagingWidget.css';

function MessagingWidget() {
  const { user } = useAuth();
  const { conversations, sendMessage, markAsRead, unreadCount } = useMessaging();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setShowSearch(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const results = users.filter(u => 
      u.email.toLowerCase().includes(searchEmail.toLowerCase()) && 
      u.id !== user.id
    );
    
    setSearchResults(results);
  };

  const openChat = (userId) => {
    const otherUser = getOtherUser(userId);
    if (!otherUser) return;
    
    if (activeChats.find(chat => chat.userId === userId)) {
      setMinimizedChats(minimizedChats.filter(id => id !== userId));
      return;
    }
    
    if (activeChats.length >= 3) {
      alert('Maximum 3 chats can be open at once');
      return;
    }
    
    setActiveChats([...activeChats, { userId, user: otherUser, messages: conversations[userId] || [] }]);
    markAsRead(userId);
    setShowSearch(false);
    setSearchEmail('');
    setSearchResults([]);
  };

  const closeChat = (userId) => {
    setActiveChats(activeChats.filter(chat => chat.userId !== userId));
    setMinimizedChats(minimizedChats.filter(id => id !== userId));
  };

  const minimizeChat = (userId) => {
    setMinimizedChats([...minimizedChats, userId]);
  };

  const maximizeChat = (userId) => {
    setMinimizedChats(minimizedChats.filter(id => id !== userId));
  };

  const getOtherUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId);
  };

  useEffect(() => {
    setActiveChats(prevActiveChats => 
      prevActiveChats.map(chat => ({
        ...chat,
        messages: conversations[chat.userId] || []
      }))
    );
  }, [conversations]);

  if (!user) return null;

  return (
    <>
      <div className="messaging-widget-toggle" onClick={toggleWidget}>
        <span className="widget-icon">💬</span>
        {unreadCount > 0 && <span className="widget-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="messaging-widget-panel">
          <div className="widget-header">
            <h3>Messaging</h3>
            <div className="widget-actions">
              <button onClick={() => setShowSearch(!showSearch)} className="widget-btn">
                ✏️
              </button>
              <button onClick={toggleWidget} className="widget-btn">✕</button>
            </div>
          </div>

          {showSearch && (
            <div className="widget-search">
              <form onSubmit={handleSearch}>
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="widget-search-input"
                />
                <button type="submit" className="widget-search-btn">🔍</button>
              </form>
              
              {searchResults.length > 0 && (
                <div className="widget-search-results">
                  {searchResults.map(u => (
                    <div 
                      key={u.id}
                      className="widget-search-item"
                      onClick={() => openChat(u.id)}
                    >
                      <div className="widget-avatar">{u.name[0].toUpperCase()}</div>
                      <div>
                        <p className="widget-user-name">{u.name}</p>
                        <p className="widget-user-email">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="widget-conversations">
            {Object.keys(conversations).length === 0 ? (
              <div className="widget-empty">
                <p>No messages yet</p>
                <p className="widget-hint">Click ✏️ to start a chat</p>
              </div>
            ) : (
              Object.keys(conversations).map(userId => {
                const otherUser = getOtherUser(userId);
                const messages = conversations[userId];
                const lastMessage = messages[messages.length - 1];
                const hasUnread = messages.some(msg => msg.recipientId === user.id && !msg.read);
                
                if (!otherUser) return null;
                
                return (
                  <div
                    key={userId}
                    className={`widget-conversation-item ${hasUnread ? 'unread' : ''}`}
                    onClick={() => openChat(userId)}
                  >
                    <div className="widget-avatar">{otherUser.name[0].toUpperCase()}</div>
                    <div className="widget-conversation-info">
                      <p className="widget-conversation-name">{otherUser.name}</p>
                      <p className="widget-conversation-preview">
                        {lastMessage.senderId === user.id ? 'You: ' : ''}
                        {lastMessage.content.substring(0, 30)}...
                      </p>
                    </div>
                    {hasUnread && <div className="widget-unread-dot"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="chat-windows-container">
        {activeChats.map((chat) => (
          <ChatWindow
            key={chat.userId}
            chat={chat}
            user={user}
            isMinimized={minimizedChats.includes(chat.userId)}
            onClose={() => closeChat(chat.userId)}
            onMinimize={() => minimizeChat(chat.userId)}
            onMaximize={() => maximizeChat(chat.userId)}
            onSendMessage={sendMessage}
          />
        ))}
      </div>
    </>
  );
}

function ChatWindow({ chat, user, isMinimized, onClose, onMinimize, onMaximize, onSendMessage }) {
  const [messageText, setMessageText] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const messagesEndRef = useRef(null);
  const { balance, transferMoney } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [chat.messages, isMinimized]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    onSendMessage(chat.userId, messageText);
    setMessageText('');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      alert(`Insufficient balance. You have $${balance.toFixed(2)}`);
      return;
    }

    setTransferring(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = transferMoney(chat.userId, amount);
    
    if (result.success) {
      // Send a system message about the transfer
      onSendMessage(chat.userId, `💰 Transferred $${amount.toFixed(2)}`);
      setTransferAmount('');
      setShowTransfer(false);
      alert(`Successfully transferred $${amount.toFixed(2)} to ${chat.user.name}`);
    } else {
      alert(result.error);
    }

    setTransferring(false);
  };

  return (
    <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-window-header">
        <div className="chat-window-user">
          <div className="widget-avatar small">{chat.user.name[0].toUpperCase()}</div>
          <span>{chat.user.name}</span>
        </div>
        <div className="chat-window-actions">
          <button onClick={isMinimized ? onMaximize : onMinimize} className="chat-window-btn">
            {isMinimized ? '□' : '_'}
          </button>
          <button onClick={onClose} className="chat-window-btn">✕</button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-window-messages">
            {chat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-window-message ${msg.senderId === user.id ? 'sent' : 'received'}`}
              >
                <div className="chat-window-bubble">
                  <p>{msg.content}</p>
                  <span className="chat-window-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showTransfer ? (
            <form onSubmit={handleTransfer} className="chat-window-transfer">
              <div className="transfer-header">
                <span>Transfer Money</span>
                <button 
                  type="button" 
                  onClick={() => setShowTransfer(false)}
                  className="transfer-close"
                >
                  ✕
                </button>
              </div>
              <div className="transfer-info">
                <p>To: {chat.user.name}</p>
                <p>Your Balance: ${balance.toFixed(2)}</p>
              </div>
              <div className="transfer-amount-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  autoFocus
                />
              </div>
              <div className="transfer-actions">
                <button 
                  type="button" 
                  onClick={() => setShowTransfer(false)}
                  className="transfer-btn cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="transfer-btn confirm"
                  disabled={transferring || !transferAmount}
                >
                  {transferring ? 'Processing...' : 'Transfer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="chat-window-input-container">
              <button 
                className="transfer-toggle-btn"
                onClick={() => setShowTransfer(true)}
                title="Transfer Money"
              >
                💰
              </button>
              <form onSubmit={handleSend} className="chat-window-input">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!messageText.trim()}>➤</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MessagingWidget;