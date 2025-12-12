import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      loadBalance();
    } else {
      setBalance(0);
    }
  }, [user]);

  const loadBalance = () => {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '{}');
    const userBalance = wallets[user.id] || 0;
    setBalance(userBalance);
  };

  const saveBalance = (newBalance) => {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '{}');
    wallets[user.id] = newBalance;
    localStorage.setItem('wallets', JSON.stringify(wallets));
    setBalance(newBalance);
  };

  const addMoney = (amount) => {
    const newBalance = balance + parseFloat(amount);
    saveBalance(newBalance);
    return { success: true, newBalance };
  };

  const deductMoney = (amount) => {
    const amountNum = parseFloat(amount);
    if (balance < amountNum) {
      return { success: false, error: 'Insufficient balance' };
    }
    const newBalance = balance - amountNum;
    saveBalance(newBalance);
    return { success: true, newBalance };
  };

  const transferMoney = (recipientId, amount) => {
    const amountNum = parseFloat(amount);
    
    if (balance < amountNum) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Deduct from sender
    const newSenderBalance = balance - amountNum;
    saveBalance(newSenderBalance);

    // Add to recipient
    const wallets = JSON.parse(localStorage.getItem('wallets') || '{}');
    const recipientBalance = wallets[recipientId] || 0;
    wallets[recipientId] = recipientBalance + amountNum;
    localStorage.setItem('wallets', JSON.stringify(wallets));

    // Record transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      id: Date.now().toString(),
      from: user.id,
      to: recipientId,
      amount: amountNum,
      date: new Date().toISOString(),
      type: 'transfer'
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    return { success: true, newBalance: newSenderBalance };
  };

  const getTransactionHistory = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.filter(t => t.from === user.id || t.to === user.id);
  };

  const value = {
    balance,
    addMoney,
    deductMoney,
    transferMoney,
    getTransactionHistory,
    loadBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}