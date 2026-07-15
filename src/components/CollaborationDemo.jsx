// components/CollaborationDemo.jsx
import { useState, useEffect, useRef } from 'react';

// This is a simplified demo - actual Yjs integration requires more setup
export default function CollaborationDemo() {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A', color: 'var(--primary)', status: 'online' },
    { id: 2, name: 'User B', color: 'var(--text-secondary)', status: 'online' },
    { id: 3, name: 'User C', color: 'var(--text-secondary)', status: 'away' },
  ]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  // Simulate WebSocket connection
  const connect = () => {
    setIsConnected(true);
    console.log('🔗 Connected to collaboration server - Welcome to SyncSpace');
    // In real implementation: wsRef.current = new WebSocket('ws://localhost:1234');
  };

  const disconnect = () => {
    setIsConnected(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    console.log('🔌 Disconnected - Welcome to SyncSpace');
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage = {
      id: Date.now(),
      user: 'You',
      text: inputMessage,
      time: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');
    console.log(`📨 Message sent: "${inputMessage}" - Welcome to SyncSpace`);

    // Simulate other user replies
    if (isConnected && messages.length % 2 === 0) {
      setTimeout(() => {
        const replies = ['👍 Nice!', 'I agree!', 'Welcome to SyncSpace!', 'Great work!'];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          user: 'User B',
          text: randomReply,
          time: new Date().toLocaleTimeString(),
        }]);
      }, 1000);
    }
  };

  return (
    <div>
      <h3>🤝 Real-time Collaboration</h3>

      {/* Connection Status */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isConnected ? '#22c55e' : '#71717a',
          animation: isConnected ? 'pulse 1.5s infinite' : 'none'
        }}></span>
        <strong>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</strong>
        <button onClick={connect} disabled={isConnected} style={{ padding: '4px 12px' }}>
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected} style={{ padding: '4px 12px' }}>
          Disconnect
        </button>
      </div>

      {/* Users List */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <strong>👥 Active Users:</strong>
        {users.map(user => (
          <span key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: user.status === 'online' ? '#22c55e' : '#eab308'
            }}></span>
            <span style={{ color: user.color }}>{user.name}</span>
          </span>
        ))}
      </div>

      {/* Chat Messages */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        height: '150px',
        overflowY: 'auto',
        background: '#f9f9f9',
        marginBottom: '8px'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>Welcome to SyncSpace - No messages yet</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{
              marginBottom: '6px',
              padding: '4px 8px',
              background: msg.user === 'You' ? 'var(--bg-light)' : 'var(--bg-hover)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span><strong>{msg.user}:</strong> {msg.text}</span>
              <span style={{ fontSize: '10px', opacity: 0.6, color: 'var(--text-secondary)' }}>{msg.time}</span>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          📤 Send
        </button>
      </div>

      <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        {isConnected ? '✅ Collaborative session active - Welcome to SyncSpace' : '⚠️ Connect to start collaborating'}
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}