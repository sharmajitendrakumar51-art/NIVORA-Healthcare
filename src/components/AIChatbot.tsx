import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Send, 
  Sparkles, 
  Calendar, 
  Stethoscope, 
  Phone, 
  Clock, 
  Heart, 
  AlertTriangle, 
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { sendChatMessage, ChatMessage, ActionButton } from "../services/aiService";
import { Service } from "../types";

interface AIChatbotProps {
  onBookImmediate?: (service?: Service) => void;
  services?: Service[];
}

const QUICK_ACTIONS: ActionButton[] = [
  { label: "📅 Book Appointment", action: "book" },
  { label: "👨‍⚕️ Find a Doctor", action: "navigate", payload: "/doctor-visit" },
  { label: "🏥 Our Services", action: "navigate", payload: "/doctor-visit" },
  { label: "📞 Contact Us", action: "contact" },
  { label: "🕒 Working Hours", action: "quick_reply", payload: "What are your working hours and clinic timings?" },
  { label: "💡 Health Tips", action: "quick_reply", payload: "Can you share a daily health tip?" },
  { label: "🚨 Emergency Help", action: "quick_reply", payload: "Emergency contact information" }
];

export default function AIChatbot({ onBookImmediate, services = [] }: AIChatbotProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: "welcome-1",
      sender: "bot",
      text: "Hello 👋 Welcome to Nivora Healthcare. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: QUICK_ACTIONS
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto scroll to bottom when messages update or typing state changes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMaximized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: userTime
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setIsTyping(true);

    // Prepare message history for Gemini API
    const historyPayload = messages.slice(-6).map(m => ({
      role: (m.sender === 'bot' ? 'model' : 'user') as 'model' | 'user',
      parts: [{ text: m.text }]
    }));

    try {
      const response = await sendChatMessage(textToSend, historyPayload);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: botTime,
        actionButtons: response.actionButtons && response.actionButtons.length > 0 ? response.actionButtons : undefined
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "I apologize, I'm having trouble connecting right now. Please select 'Book Appointment' or contact our 24/7 care desk at 9660394618 or email sharmarjitendrakumar2007@gmail.com.",
          timestamp: botTime,
          isError: true,
          actionButtons: [
            { label: "📅 Book Appointment", action: "book" },
            { label: "📞 Contact Support", action: "contact" }
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionButtonClick = (button: ActionButton) => {
    if (button.action === "book") {
      if (onBookImmediate) {
        onBookImmediate(services[0] || undefined);
      } else {
        navigate("/doctor-visit");
      }
    } else if (button.action === "navigate") {
      if (button.payload) {
        navigate(button.payload);
      }
    } else if (button.action === "contact") {
      const footerElement = document.querySelector("footer");
      if (footerElement) {
        footerElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "tel:9660394618";
      }
    } else if (button.action === "quick_reply") {
      if (button.payload) {
        handleSend(button.payload);
      }
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: "Hello 👋 Welcome to Nivora Healthcare. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: QUICK_ACTIONS
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 font-sans">
      {/* Floating Launcher Button when closed or minimized */}
      {(!isOpen || isMinimized) && (
        <motion.button
          id="nivora-ai-chatbot-launcher"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleOpen}
          className="relative group flex items-center space-x-2.5 bg-gradient-to-r from-primary-green via-emerald-700 to-primary-blue text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl border border-white/20 transition-all duration-300 focus:outline-hidden"
          aria-label="Open Nivora AI Chatbot"
        >
          <div className="relative flex items-center justify-center w-7 h-7 bg-white/20 rounded-full backdrop-blur-xs">
            <Bot className="w-4 h-4 text-white animate-pulse" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-0.5 -right-0.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold font-display tracking-tight leading-none text-white">Nivora AI Assistant</span>
            <span className="text-[10px] text-emerald-100 leading-none mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Online • Ask anything
            </span>
          </div>

          {/* Unread badge indicator */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
            </span>
          )}
        </motion.button>
      )}

      {/* Main Chatbot Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            id="nivora-ai-chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 ${
              isMaximized
                ? "fixed inset-4 md:inset-10 z-50 w-auto h-auto max-w-none max-h-none"
                : "w-[calc(100vw-2rem)] sm:w-[410px] h-[540px] max-h-[82vh]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-green via-emerald-800 to-primary-blue text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 backdrop-blur-xs">
                  <Bot className="w-5 h-5 text-emerald-200" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary-green rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-display font-bold text-sm text-white leading-none">Nivora AI Health Assistant</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <p className="text-[10px] text-emerald-100 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    DHA Licensed Home Care Assistant
                  </p>
                </div>
              </div>

              {/* Window controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Reset Conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggleMinimize}
                  className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggleMaximize}
                  className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title={isMaximized ? "Restore Size" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Banner info */}
            <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-100/60 flex items-center justify-between text-[11px] text-emerald-800 shrink-0">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Ask about home doctors, lab tests, timings & booking</span>
              </div>
              <span className="font-semibold text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded-sm text-emerald-900">24/7 AI</span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3 max-w-[85%] text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-primary-green to-emerald-800 text-white rounded-2xl rounded-tr-xs"
                        : "bg-white border border-gray-200/80 text-gray-800 rounded-2xl rounded-tl-xs"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-primary-green mb-1">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        <span>Nivora Health Care AI</span>
                      </div>
                    )}
                    {msg.text}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {/* Quick Action Buttons attached to Bot message */}
                  {msg.sender === "bot" && msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionButtonClick(btn)}
                          className="text-[11px] font-semibold bg-white text-primary-green hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs transition flex items-center space-x-1 group"
                        >
                          <span>{btn.label}</span>
                          <ChevronRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-gray-200/80 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Nivora AI is typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Scroll Bar */}
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Quick:</span>
              {QUICK_ACTIONS.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionButtonClick(btn)}
                  className="text-[10px] font-medium bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 px-2.5 py-1 rounded-full whitespace-nowrap transition border border-gray-200/60 shrink-0"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about doctors, lab tests, booking..."
                className="flex-1 bg-gray-100 text-gray-800 text-xs px-3.5 py-2.5 rounded-full border border-gray-200 focus:outline-hidden focus:border-primary-green focus:bg-white transition"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 bg-gradient-to-r from-primary-green to-emerald-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition shadow-xs shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
