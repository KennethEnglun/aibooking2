import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function Chat({ onBookingCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, newMsg]);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/booking/nlp`, {
        message: input,
      });
      setMessages((msgs) => [...msgs, newMsg, { role: 'system', content: '✅ 已建立預訂' }]);
      setInput('');
      onBookingCreated?.();
    } catch (err) {
      console.error(err);
      setMessages((msgs) => [...msgs, { role: 'system', content: '❌ 發生錯誤：' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div>
      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx}><strong>{m.role === 'user' ? '你' : '系統'}: </strong>{m.content}</div>
        ))}
      </div>
      <input
        className="chat-input"
        placeholder="請輸入預訂需求..."
        value={input}
        disabled={loading}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
      />
      <button onClick={sendMessage} disabled={loading}>送出</button>
    </div>
  );
}

export default Chat; 