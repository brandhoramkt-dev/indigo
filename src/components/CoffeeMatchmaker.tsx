import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ai, getSystemPrompt } from "../lib/gemini";
import { useTranslation } from "react-i18next";
import { useFirestoreCollection } from "../lib/hooks";
import { Product, CartItem } from "../types";
import React from "react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface CoffeeMatchmakerProps {
  onAddToCart?: (item: CartItem) => void;
}

export default function CoffeeMatchmaker({ onAddToCart }: CoffeeMatchmakerProps) {
  const { t, i18n } = useTranslation();
  const { data: products } = useFirestoreCollection<Product>("products");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: t("matchmaker.greeting", "¡Hola! Soy tu barista virtual de Indigo Coffee. ¿Qué tipo de sabores te gustan en tu café?") }
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

      const systemPrompt = getSystemPrompt(i18n.language, products);

      // Create a new chat session to maintain context if supported, 
      // but since we are using generateContent, we pass the entire history.
      const contents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido, actuaré como el barista." }] },
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      const textResponse = response.text || t("matchmaker.error", "Lo siento, tuve un problema preparando tu recomendación. ¿Podrías repetirlo?");
      setMessages((prev) => [...prev, { role: "model", content: textResponse }]);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      setMessages((prev) => [...prev, { role: "model", content: t("matchmaker.networkError", "Lo siento, tuve un problema de conexión. ¿Podemos intentarlo de nuevo?") }]);
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
                  <h3 className="font-extenda font-black text-xl uppercase tracking-tighter leading-none">{t("matchmaker.title", "Indigo Matchmaker")}</h3>
                  <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold mt-1">{t("matchmaker.subtitle", "Tu Barista Virtual")}</p>
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
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        (() => {
                          const content = msg.content;
                          const productMatch = content.match(/\[PRODUCT:([^\]]+)\]/);
                          const productId = productMatch ? productMatch[1] : null;
                          const cleanText = content.replace(/\[PRODUCT:.*?\]/g, '').trim();

                          const parts = cleanText.split(/(\*\*.*?\*\*)/g);
                          const renderedText = parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={i}>{part}</span>;
                          });

                          const recommendedProduct = productId ? products.find(p => p.id === productId) : null;

                          return (
                            <div className="flex flex-col gap-2">
                              <div>{renderedText}</div>
                              {recommendedProduct && onAddToCart && (
                                <button 
                                  onClick={() => onAddToCart({ 
                                    ...recommendedProduct, 
                                    uniqueId: Math.random().toString(36), 
                                    finalPrice: recommendedProduct.price 
                                  })}
                                  className="mt-3 text-[10px] md:text-xs bg-indigo-brand text-white hover:bg-orange-brand transition-colors px-4 py-3 rounded-xl w-full font-bold uppercase tracking-widest active:scale-95 flex flex-col items-center justify-center gap-1"
                                >
                                  <span>{t("menu.addSpecific", { name: recommendedProduct.name.toUpperCase(), defaultValue: `AGREGAR ${recommendedProduct.name.toUpperCase()}` })}</span>
                                  <span className="text-white/80">Bs {recommendedProduct.price}</span>
                                </button>
                              )}
                            </div>
                          );
                        })()
                      )}
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
                  placeholder={t("matchmaker.placeholder", "Dime cómo te gusta el café...")}
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
