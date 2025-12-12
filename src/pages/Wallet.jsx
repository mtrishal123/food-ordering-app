import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../context/WalletContext';
import './Wallet.css';

function Wallet() {
  const { user } = useAuth();
  const { balance, addMoney, transferMoney, getTransactionHistory } = useWallet();
  
  const [addAmount, setAddAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [activeTab, setActiveTab] = useState('balance'); // balance, add, transfer, history
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAddMoney = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      showMessage('error', 'Please enter a valid amount');
      return;
    }

    if (amount > 10000) {
      showMessage('error', 'Maximum add limit is $10,000');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = addMoney(amount);
      if (result.success) {
        showMessage('success', `Successfully added $${amount.toFixed(2)} to your wallet!`);
        setAddAmount('');
      }
      setLoading(false);
    }, 1000); // Simulate processing
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      showMessage('error', 'Please enter a valid amount');
      return;
    }

    if (!recipientEmail.trim()) {
      showMessage('error', 'Please enter recipient email');
      return;
    }

    // Find recipient user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const recipient = users.find(u => u.email === recipientEmail);

    if (!recipient) {
      showMessage('error', 'User not found with this email');
      return;
    }

    if (recipient.id === user.id) {
      showMessage('error', 'Cannot transfer to yourself');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = transferMoney(recipient.id, amount);
      if (result.success) {
        showMessage('success', `Successfully transferred $${amount.toFixed(2)} to ${recipient.name}!`);
        setTransferAmount('');
        setRecipientEmail('');
      } else {
        showMessage('error', result.error);
      }
      setLoading(false);
    }, 1000);
  };

  const transactions = getTransactionHistory();

  return (
    <>
      <Helmet>
        <title>My Wallet - FoodOrder</title>
        <meta name="description" content="Manage your FoodOrder wallet" />
      </Helmet>
      
      <div className="wallet-container">
        <h1 className="page-title">My Wallet</h1>
        
        {message.text && (
          <div className={`wallet-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="wallet-balance-card">
          <div className="balance-icon">💰</div>
          <div className="balance-info">
            <p className="balance-label">Current Balance</p>
            <h2 className="balance-amount">${balance.toFixed(2)}</h2>
          </div>
        </div>

        <div className="wallet-tabs">
          <button 
            className={`wallet-tab ${activeTab === 'balance' ? 'active' : ''}`}
            onClick={() => setActiveTab('balance')}
          >
            Overview
          </button>
          <button 
            className={`wallet-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Money
          </button>
          <button 
            className={`wallet-tab ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            Transfer
          </button>
          <button 
            className={`wallet-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="wallet-content">
          {activeTab === 'balance' && (
            <div className="wallet-overview">
              <div className="overview-card">
                <h3>💳 Payment Options</h3>
                <p>Use your wallet balance to pay for orders instantly!</p>
                <ul>
                  <li>✓ Fast checkout</li>
                  <li>✓ Secure transactions</li>
                  <li>✓ Transfer to friends</li>
                </ul>
              </div>
              
              <div className="overview-card">
                <h3>📊 Recent Activity</h3>
                {transactions.length === 0 ? (
                  <p>No transactions yet</p>
                ) : (
                  <p>{transactions.length} transaction(s) this month</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="wallet-form-section">
              <h2>Add Money to Wallet</h2>
              <form onSubmit={handleAddMoney} className="wallet-form">
                <div className="form-group">
                  <label htmlFor="addAmount">Amount ($)</label>
                  <input
                    type="number"
                    id="addAmount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    min="1"
                    max="10000"
                    className="form-input"
                    required
                  />
                  <p className="form-hint">💡 This is fake money for demonstration</p>
                </div>

                <div className="quick-amounts">
                  <button type="button" onClick={() => setAddAmount('50')} className="quick-btn">$50</button>
                  <button type="button" onClick={() => setAddAmount('100')} className="quick-btn">$100</button>
                  <button type="button" onClick={() => setAddAmount('200')} className="quick-btn">$200</button>
                  <button type="button" onClick={() => setAddAmount('500')} className="quick-btn">$500</button>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary wallet-submit"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Add Money'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="wallet-form-section">
              <h2>Transfer Money</h2>
              <form onSubmit={handleTransfer} className="wallet-form">
                <div className="form-group">
                  <label htmlFor="recipientEmail">Recipient Email</label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@email.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="transferAmount">Amount ($)</label>
                  <input
                    type="number"
                    id="transferAmount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    min="1"
                    max={balance}
                    className="form-input"
                    required
                  />
                  <p className="form-hint">Available: ${balance.toFixed(2)}</p>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary wallet-submit"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Transfer Money'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="wallet-history">
              <h2>Transaction History</h2>
              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <p>📭 No transactions yet</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map((transaction) => {
                    const isReceived = transaction.to === user.id;
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const otherUser = users.find(u => u.id === (isReceived ? transaction.from : transaction.to));
                    
                    return (
                      <div key={transaction.id} className="transaction-item">
                        <div className="transaction-icon">
                          {isReceived ? '📥' : '📤'}
                        </div>
                        <div className="transaction-details">
                          <p className="transaction-type">
                            {isReceived ? 'Received from' : 'Sent to'} {otherUser?.name || 'Unknown User'}
                          </p>
                          <p className="transaction-date">
                            {new Date(transaction.date).toLocaleString()}
                          </p>
                        </div>
                        <div className={`transaction-amount ${isReceived ? 'positive' : 'negative'}`}>
                          {isReceived ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Wallet;