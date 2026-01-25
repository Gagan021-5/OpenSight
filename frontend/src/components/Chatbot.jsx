import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Mic, MicOff, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api"; // 🟢 FIX: Import your configured API instance
import { useGlobal } from "../context/GlobalContext.jsx";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { userProfile, ageGroup } = useGlobal();

  const isKids = ageGroup === 'kid';

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, open]);

  // --- SPEECH RECOGNITION ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = isKids ? 1.2 : 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setTyping(true);

    try {
      // 🟢 FIX: Use 'api' instead of 'axios' and remove localhost URL
      // The 'api' instance already has the baseURL set to your Render backend
      const response = await api.post("/chat", {
        message: userInput,
        context: { 
            ageGroup, 
            condition: userProfile?.config?.condition,
            difficulty: userProfile?.config?.difficulty 
        },
      });

      const botMsg = { role: "assistant", text: response.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      speak(response.data.reply);
    } catch (e) {
      console.error("Chat Error:", e);
      let errorMessage = "I'm having trouble connecting. Please try again later.";
      if (e.response?.status === 503) {
        errorMessage = "I'm waking up! Give me a few seconds...";
      }
      setMessages((prev) => [...prev, { role: "assistant", text: errorMessage }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    // FIX: Lifted to bottom-24 on mobile to clear the navbar, standard bottom-6 on desktop
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col-reverse items-end gap-4 pointer-events-none">
      
      {/* --- TOGGLE BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : isKids ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-slate-900 hover:bg-slate-800'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
        ) : (
          <MessageCircle className={`w-6 h-6 md:w-8 md:h-8 ${isKids ? 'text-yellow-900' : 'text-white'}`} />
        )}
      </motion.button>

      {/* --- CHAT WINDOW --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`pointer-events-auto w-[90vw] sm:w-96 h-[55vh] sm:h-[550px] flex flex-col overflow-hidden rounded-[2rem] shadow-2xl border origin-bottom-right ${
                isKids ? 'bg-white border-yellow-300' : 'bg-white border-slate-200'
            }`}
          >
            {/* Header */}
            <div className={`shrink-0 px-5 py-3 md:px-6 md:py-4 flex items-center justify-between text-white shadow-md z-10 ${
                isKids 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gradient-to-r from-slate-900 to-indigo-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 md:p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-base md:text-lg leading-tight ${isKids ? 'font-nunito' : 'tracking-tight'}`}>
                    {isKids ? 'Captain Sight 🦸' : 'Dr. Sight AI'}
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-80 text-[10px] md:text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Online
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isKids ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl mb-4 flex items-center justify-center ${isKids ? 'bg-yellow-100 text-yellow-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Sparkles size={24} className="md:w-8 md:h-8" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">
                    {isKids 
                      ? "Hi! Ask me anything about your mission! 🚀" 
                      : "How can I assist with your vision therapy today?"
                    }
                  </p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 md:py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? isKids 
                            ? "bg-yellow-400 text-yellow-900 rounded-tr-sm"
                            : "bg-slate-900 text-white rounded-tr-sm"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-bounce ${isKids ? 'bg-yellow-400' : 'bg-slate-400'}`}
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
              <div className={`flex items-center gap-2 p-1.5 border rounded-2xl transition-colors focus-within:ring-2 ${
                  isKids 
                    ? 'border-yellow-200 bg-yellow-50/50 focus-within:border-yellow-400 focus-within:ring-yellow-100' 
                    : 'border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-indigo-100'
              }`}>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isListening ? "Listening..." : (isKids ? "Type here..." : "Ask Dr. Sight...")}
                  className="flex-1 px-3 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />

                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  className={`p-2.5 rounded-xl text-white shadow-md transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:shadow-none ${
                      isKids 
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' 
                        : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}