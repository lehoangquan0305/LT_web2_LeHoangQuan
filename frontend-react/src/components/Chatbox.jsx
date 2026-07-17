import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Chatbox() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Chào cậu nè! Tớ là trợ lý nhỏ của tiệm. Hôm nay cậu muốn tớ tìm quà gì hay hỗ trợ check đơn hàng nào không dọ? 🌸' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    // Thêm tin nhắn của User vào khung chat
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // 🌸 GỌI LÊN BOT SERVICE (NODE.JS - CỔNG 5005)
      const token = 
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('jwt') ||
    '';

console.log("===== CHATBOT AUTH =====");
console.log("USER:", user);
console.log("TOKEN:", token);
console.log("========================");


const response = await axios.post(
  'http://localhost:5005/api/chat',
  {
    message: userMsg,
    userId: user ? user.id : null,
    userToken: localStorage.getItem('shop_token') || ''
  }
);

      // Kiểm tra phản hồi từ Node.js
      if (response.data.success) {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now() + 1, sender: 'bot', text: response.data.message }
        ]);
      }
    } catch (error) {
      console.error("Lỗi giao tiếp với Bot:", error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, sender: 'bot', text: 'Úi, đầu óc mình hơi tưng tưng một tí, bạn nói lại được không nè? 🌸' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-pink-400 to-rose-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce cursor-pointer"
        >
          <span className="text-2xl">🌸</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-3xl border border-rose-100 shadow-xl flex flex-col overflow-hidden animate-fadeIn">
          
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 flex items-center justify-between border-b border-rose-100/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-lg">🐱</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-500">Tiệm Trợ Lý Dễ Thương</h4>
                <p className="text-[10px] text-slate-400 font-medium">Đang hoạt động nhẹ nhàng •‿•</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-rose-400 text-sm font-bold transition-colors cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-rose-50/10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-rose-400 text-white rounded-br-none' 
                      : 'bg-white text-slate-600 rounded-bl-none border border-rose-50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none border border-rose-50 px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-rose-100/50 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={user ? `Nhắn gì đó ngọt ngào đi ${user.name || 'cậu'}...` : "Nhắn gì đó ngọt ngào cho tớ đi..."}
              className="flex-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Gửi ✨
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

export default Chatbox;