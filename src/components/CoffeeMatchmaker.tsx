import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ai, SYSTEM_PROMPT } from "../lib/gemini";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function CoffeeMatchmaker() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Soy tu barista virtual de Indigo Coffee. ¿Qué tipo de sabores te gustan en tu café?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Build the chat history for context
      const chatHistory = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Create a new chat session to maintain context if supported, 
      // but since we are using generateContent, we pass the entire history.
      const contents = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Entendido, actuaré como el barista." }] },
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      const textResponse = response.text || "Lo siento, tuve un problema preparando tu recomendación. ¿Podrías repetirlo?";
      setMessages((prev) => [...prev, { role: "model", content: textResponse }]);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      setMessages((prev) => [...prev, { role: "model", content: "Lo siento, tuve un problema de conexión. ¿Podemos intentarlo de nuevo?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-brand text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center border border-white/20"
        aria-label="Open Coffee Matchmaker"
      >
        <MessageCircle size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-indigo-brand p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={20} className="text-yellow-brand" />
                </div>
                <div>
                  <h3 className="font-extenda font-black text-xl uppercase tracking-tighter leading-none">Indigo Matchmaker</h3>
                  <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold mt-1">Tu Barista Virtual</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-warm">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-orange-brand/20 text-orange-brand" : "bg-indigo-brand/10 text-indigo-brand"}`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div 
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-orange-brand text-white rounded-tr-sm" 
                          : "bg-white border border-gray-100 text-gray-600 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-brand/10 flex items-center justify-center mt-1 text-indigo-brand">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-brand/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-brand/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-brand/40 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Dime cómo te gusta el café..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-brand/20 focus:border-indigo-brand transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-indigo-brand text-white p-3 rounded-2xl hover:bg-orange-brand transition-colors disabled:opacity-50 disabled:hover:bg-indigo-brand"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
