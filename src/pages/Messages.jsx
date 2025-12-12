import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../context/MessagingContext';
import { useWallet } from '../context/WalletContext';
import './Messages.css';

function Messages() {
  const { user } = useAuth();
  const { conversations, sendMessage, markAsRead, deleteConversation } = useMessaging();
  const { balance, transferMoney } = useWallet();
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId, conversations]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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

  const startConversation = (userId) => {
    setSelectedUserId(userId);
    setShowNewMessage(false);
    setSearchEmail('');
    setSearchResults([]);
    markAsRead(userId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedUserId) return;
    
    sendMessage(selectedUserId, messageText);
    setMessageText('');
  };

  const handleDeleteConversation = (userId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(userId);
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    if (amount > balance) {
      showNotification(`Insufficient balance. You have $${balance.toFixed(2)}`, 'error');
      return;
    }

    setTransferring(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = transferMoney(selectedUserId, amount);
    
    if (result.success) {
      const selectedUser = getOtherUser(selectedUserId);
      // Send a system message about the transfer
      sendMessage(selectedUserId, `💰 Transferred $${amount.toFixed(2)}`);
      setTransferAmount('');
      setShowTransfer(false);
      showNotification(`Successfully transferred $${amount.toFixed(2)} to ${selectedUser?.name}`, 'success');
    } else {
      showNotification(result.error, 'error');
    }

    setTransferring(false);
  };

  const getOtherUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId);
  };

  const getLastMessage = (messages) => {
    return messages[messages.length - 1];
  };

  const hasUnreadMessages = (userId) => {
    const messages = conversations[userId] || [];
    return messages.some(msg => msg.recipientId === user.id && !msg.read);
  };

  const conversationList = Object.keys(conversations);
  const selectedConversation = selectedUserId ? conversations[selectedUserId] : [];
  const selectedUser = selectedUserId ? getOtherUser(selectedUserId) : null;

  return (
    <>
      <Helmet>
        <title>Messages - FoodOrder</title>
        <meta name="description" content="Send and receive messages" />
      </Helmet>
      
      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
            <button 
              className="new-message-btn"
              onClick={() => setShowNewMessage(!showNewMessage)}
            >
              ✏️ New
            </button>
          </div>

          {showNewMessage && (
            <div className="new-message-search">
              <form onSubmit={handleSearch}>
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">🔍</button>
              </form>
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(u => (
                    <div 
                      key={u.id}
                      className="search-result-item"
                      onClick={() => startConversation(u.id)}
                    >
                      <div className="user-avatar">{u.name[0].toUpperCase()}</div>
                      <div className="user-info">
                        <p className="user-name">{u.name}</p>
                        <p className="user-email">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchEmail && searchResults.length === 0 && (
                <p className="no-results">No users found</p>
              )}
            </div>
          )}

          <div className="conversations-list">
            {conversationList.length === 0 ? (
              <div className="no-conversations">
                <p>💬 No messages yet</p>
                <p className="hint">Search for users to start chatting!</p>
              </div>
            ) : (
              conversationList.map(userId => {
                const otherUser = getOtherUser(userId);
                const lastMessage = getLastMessage(conversations[userId]);
                const unread = hasUnreadMessages(userId);
                
                if (!otherUser) return null;
                
                return (
                  <div
                    key={userId}
                    className={`conversation-item ${selectedUserId === userId ? 'active' : ''} ${unread ? 'unread' : ''}`}
                    onClick={() => startConversation(userId)}
                  >
                    <div className="user-avatar">{otherUser.name[0].toUpperCase()}</div>
                    <div className="conversation-preview">
                      <div className="conversation-header">
                        <p className="conversation-name">{otherUser.name}</p>
                        <p className="conversation-time">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="last-message">
                        {lastMessage.senderId === user.id ? 'You: ' : ''}
                        {lastMessage.content.substring(0, 40)}
                        {lastMessage.content.length > 40 ? '...' : ''}
                      </p>
                    </div>
                    {unread && <div className="unread-indicator"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="messages-main">
          {!selectedUserId ? (
            <div className="no-chat-selected">
              <h2>💬</h2>
              <p>Select a conversation or start a new one</p>
            </div>
          ) : (
            <>
              {notification.show && (
                <div className={`messages-notification ${notification.type}`}>
                  <span className="notification-icon">
                    {notification.type === 'success' ? '✓' : '⚠'}
                  </span>
                  <span className="notification-message">{notification.message}</span>
                </div>
              )}

              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="user-avatar large">{selectedUser?.name[0].toUpperCase()}</div>
                  <div>
                    <h3>{selectedUser?.name}</h3>
                    <p className="user-email-small">{selectedUser?.email}</p>
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteConversation(selectedUserId)}
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>

              <div className="chat-messages">
                {selectedConversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <p className="message-content">{msg.content}</p>
                      <p className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {showTransfer ? (
                <form onSubmit={handleTransfer} className="messages-transfer-form">
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
                    <p>To: {selectedUser?.name}</p>
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
                <div className="chat-input-container">
                  <button 
                    className="transfer-toggle-btn"
                    onClick={() => setShowTransfer(true)}
                    title="Transfer Money"
                  >
                    💰
                  </button>
                  <form onSubmit={handleSendMessage} className="chat-input-form">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="chat-input"
                    />
                    <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                      ➤
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Messages;