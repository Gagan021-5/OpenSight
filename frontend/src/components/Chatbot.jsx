import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';
import { useTranslation } from 'react-i18next';
import api from '../utils/api'; // Use the configured api instance

export default function Chatbot() {
  const { userProfile, ageGroup, condition, language: userLang } = useGlobal(); // userLang might be from context or just i18n
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: i18n.language === 'hi' ? 'नमस्ते! मैं आपकी दृष्टि चिकित्सा में कैसे मदद कर सकता हूँ?' : 'Hi! How can I help with your vision therapy today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        ageGroup: ageGroup || 'adult',
        condition: condition || 'general',
        games: ['Snake', 'Tetris'], // Ideally fetch from user config or props
        language: i18n.language
      };

      const res = await api.post('/chat', {
        message: userMsg.text,
        context
      });

      const aiMsg = { role: 'assistant', text: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${ageGroup === 'kid' ? 'bg-yellow-400 text-slate-900' : 'bg-indigo-600 text-white'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[350px] md:max-w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${ageGroup === 'kid' ? 'bg-yellow-400' : 'bg-indigo-600'}`}>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${ageGroup === 'kid' ? 'text-slate-900' : 'text-white'}`} />
                <h3 className={`font-bold ${ageGroup === 'kid' ? 'text-slate-900' : 'text-white'}`}>
                  {ageGroup === 'kid' ? 'Vision Buddy' : 'Therapy Assistant'}
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full hover:bg-black/10 transition ${ageGroup === 'kid' ? 'text-slate-900' : 'text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-700">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'कुछ पूछें...' : 'Ask something...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
