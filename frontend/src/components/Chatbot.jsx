import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useGlobal } from "../context/GlobalContext";

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

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Initialize speech recognition
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

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    console.log('🔹 Chatbot: Sending message:', input);
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setTyping(true);
    try {
      console.log('🔹 Chatbot: Making request to backend...');
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userInput,
        context: { ageGroup, condition: userProfile?.config?.condition },
      });
      console.log('🔹 Chatbot: Backend response:', response.data);
      const botMsg = { role: "assistant", text: response.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      // Speak the bot response
      speak(response.data.reply);
    } catch (e) {
      console.error('🔴 Chatbot: Full error object:', e);
      console.error('🔴 Chatbot: Error response:', e.response?.data);
      console.error('🔴 Chatbot: Error status:', e.response?.status);
      const status = e.response?.status;
      const code = e.response?.data?.code;

      let errorMessage = "Sorry, something went wrong.";

      if (status === 401 && code === "HF_TOKEN_EXPIRED") {
        errorMessage =
          "The AI assistant is temporarily unavailable. Please try again later.";
      } else if (status === 503) {
        errorMessage =
          "The assistant is currently waking up. Please wait a moment ⏳";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: errorMessage },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      <div className="pointer-events-auto">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 grid place-items-center hover:bg-indigo-700 transition"
          aria-label={open ? "Close assistant" : "Open assistant"}
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mt-3 w-[320px] sm:w-[380px] md:w-[420px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden antialiased"
            >
              <div className="px-4 py-3 border-b border-gray-200 font-black text-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  Dr. Sight
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-gray-500">
                    Ask me anything about vision therapy!
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-black shadow-sm border border-gray-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-2xl text-sm flex items-center gap-1">
                      <span
                        className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
