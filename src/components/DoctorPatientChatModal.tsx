import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  UserCheck, 
  Stethoscope, 
  Clock, 
  Wifi, 
  WifiOff, 
  MessageSquare,
  Sparkles,
  PhoneCall,
  Calendar,
  AlertCircle
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { DoctorPatientChatMessage, Order } from "../types";

interface DoctorPatientChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Order | any;
  currentUserRole?: "patient" | "doctor" | "admin";
  currentUserName?: string;
}

export default function DoctorPatientChatModal({
  isOpen,
  onClose,
  appointment,
  currentUserRole = "patient",
  currentUserName
}: DoctorPatientChatModalProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<DoctorPatientChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserTypingName, setOtherUserTypingName] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const appointmentId = appointment?.id || appointment?._id || "APP-UNKNOWN";
  const patientName = appointment?.patientName || appointment?.customerName || "Patient";
  const doctorName = appointment?.assignedDoctorName || appointment?.doctorName || "Dr. Nivora Specialist (DHA Licensed)";
  const doctorSpecialization = appointment?.assignedDoctorSpecialization || "DHA Specialist";
  const doctorPhone = appointment?.assignedDoctorPhone || "+971 50 888 1234";
  const serviceTitle = appointment?.services?.[0]?.serviceName || appointment?.items?.[0]?.serviceName || appointment?.serviceName || "Home Healthcare Service";
  const appointmentDate = appointment?.appointmentDate || appointment?.date || "Today";
  const appointmentTime = appointment?.appointmentTime || appointment?.time || "Scheduled Slot";

  const token = localStorage.getItem("nivora_token") || localStorage.getItem("token") || "";

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOtherUserTyping]);

  // Connect to Socket.IO
  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    setErrorMsg("");

    // Fallback initial load via REST API
    const loadInitialMessages = async () => {
      try {
        const res = await fetch(`/api/doctor-chat/messages/${encodeURIComponent(appointmentId)}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.warn("Failed to load initial chat history via HTTP REST:", err);
      }
    };

    loadInitialMessages();

    // Socket Connection
    const newSocket = io(window.location.origin, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setErrorMsg("");
      // Join Room
      newSocket.emit("join_appointment_chat", { appointmentId });
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket.io connection error:", err.message);
      setIsConnected(false);
      if (err.message.includes("Authentication")) {
        setErrorMsg("Please log in to participate in doctor-patient chat.");
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("chat_history", (data: { appointmentId: string; messages: DoctorPatientChatMessage[] }) => {
      if (data.appointmentId === appointmentId && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    });

    newSocket.on("receive_chat_message", (msg: DoctorPatientChatMessage) => {
      if (msg.appointmentId === appointmentId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Mark as read
        newSocket.emit("mark_messages_read", { appointmentId });
      }
    });

    newSocket.on("user_typing_status", (data: { appointmentId: string; isTyping: boolean; senderName: string; role: string }) => {
      if (data.appointmentId === appointmentId) {
        setIsOtherUserTyping(data.isTyping);
        setOtherUserTypingName(data.senderName);
      }
    });

    newSocket.on("user_status", (data: { userId: string; userName: string; status: string }) => {
      if (data.status === "online") {
        setIsOtherUserOnline(true);
      }
    });

    newSocket.on("messages_status_updated", (data: { appointmentId: string; status: 'read' }) => {
      if (data.appointmentId === appointmentId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, status: 'read' }))
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, appointmentId, token]);

  // Typing event trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (socket && isConnected) {
      socket.emit("typing_status", { appointmentId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_status", { appointmentId, isTyping: false });
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputMessage.trim();
    if (!textToSend) return;

    const myRole = currentUserRole;
    const myName = currentUserName || (myRole === "patient" ? patientName : "Doctor Specialist");

    const tempMsg: DoctorPatientChatMessage = {
      id: `TEMP-${Date.now()}`,
      appointmentId,
      patientName,
      doctorName,
      senderRole: myRole,
      senderId: myName,
      senderName: myName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");

    if (socket && isConnected) {
      socket.emit("send_chat_message", {
        appointmentId,
        patientName,
        doctorName,
        text: textToSend,
        senderRole: myRole
      });
      socket.emit("typing_status", { appointmentId, isTyping: false });
    } else {
      // HTTP Fallback
      try {
        const res = await fetch("/api/doctor-chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            appointmentId,
            patientName,
            doctorName,
            text: textToSend
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempMsg.id ? data.message : m))
            );
          }
        }
      } catch (err) {
        console.error("HTTP chat fallback error:", err);
      }
    }
  };

  const handleQuickResponse = (text: string) => {
    setInputMessage(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[750px] flex flex-col overflow-hidden border border-emerald-100">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3 sm:p-4 flex items-center justify-between shadow-md relative">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-emerald-600/60 border-2 border-white/30 flex items-center justify-center text-white shadow-inner">
                {currentUserRole === "patient" ? (
                  <Stethoscope className="w-6 h-6 text-emerald-200" />
                ) : (
                  <UserCheck className="w-6 h-6 text-emerald-200" />
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-emerald-800 ${isOtherUserOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-base sm:text-lg tracking-tight leading-tight">
                  {currentUserRole === "patient" ? doctorName : patientName}
                </h3>
                <span className="bg-emerald-600/50 text-emerald-100 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                  {currentUserRole === "patient" ? (doctorSpecialization || "DHA Specialist") : "Patient"}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-emerald-100/90 mt-0.5">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{serviceTitle}</span>
                </span>
                <span className="text-emerald-400/60">•</span>
                <span className="font-mono text-emerald-200">#{appointmentId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 bg-emerald-900/40 px-2.5 py-1 rounded-full text-xs text-emerald-200 border border-emerald-500/20">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Real-time</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Connecting...</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition"
              title="Close Chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* APPOINTMENT SUB-BAR */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{appointmentDate}</span>
            </span>
            <span className="flex items-center space-x-1 font-medium text-emerald-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{appointmentTime}</span>
            </span>
          </div>

          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
            Encrypted & Secure
          </span>
        </div>

        {/* ERROR WARNING IF ANY */}
        {errorMsg && (
          <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2 flex items-center space-x-2 border-b border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* WELCOME BANNER */}
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-center text-xs text-emerald-900 max-w-md mx-auto shadow-xs space-y-1">
            <div className="flex items-center justify-center space-x-1.5 font-semibold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Nivora Healthcare Direct Chat Channel</span>
            </div>
            <p className="text-emerald-700/80 text-[11px]">
              Discuss medical prep, arrival details, vitals, or questions directly with your assigned DHA healthcare team.
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 mx-auto text-emerald-300 mb-2 opacity-60" />
              <p className="font-medium text-slate-600">No messages yet</p>
              <p className="text-slate-400 mt-0.5">Start the conversation below to connect with your doctor.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe =
                (currentUserRole === "patient" && msg.senderRole === "patient") ||
                (currentUserRole !== "patient" && (msg.senderRole === "doctor" || msg.senderRole === "admin"));

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className={`text-[10px] font-medium text-slate-400 mb-0.5 px-1 flex items-center space-x-1`}>
                    <span>{msg.senderName || (isMe ? "You" : msg.senderRole)}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs text-sm leading-relaxed ${
                      isMe
                        ? "bg-emerald-700 text-white rounded-tr-none shadow-emerald-900/10"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-slate-200/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                    <div
                      className={`flex items-center justify-end space-x-1 text-[10px] mt-1 ${
                        isMe ? "text-emerald-200" : "text-slate-400"
                      }`}
                    >
                      {isMe && (
                        <span>
                          {msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-300 inline" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-200 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-300/80 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* TYPING INDICATOR */}
          {isOtherUserTyping && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{otherUserTypingName || "Specialist"} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Quick:</span>
          {currentUserRole === "patient" ? (
            <>
              <button
                type="button"
                onClick={() => handleQuickResponse("Hello Doctor, what time will the home visit team arrive?")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                ⏰ Arrival time?
              </button>
              <button
                type="button"
                onClick={() => handleQuickResponse("Should I fast before the lab test/vitals check?")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                🧪 Fasting instructions?
              </button>
              <button
                type="button"
                onClick={() => handleQuickResponse("I have shared my location pin. Please call when nearby.")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                📍 Location pin shared
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleQuickResponse("Hello! Our DHA medical team is en route to your location.")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                🚗 Medical team en route
              </button>
              <button
                type="button"
                onClick={() => handleQuickResponse("Your lab test reports have been verified and updated.")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                📋 Reports verified
              </button>
              <button
                type="button"
                onClick={() => handleQuickResponse("Please ensure the patient is resting comfortably.")}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full text-xs transition"
              >
                🩺 Patient care note
              </button>
            </>
          )}
        </div>

        {/* INPUT BAR */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={
              currentUserRole === "patient"
                ? "Type message for Doctor / Specialist..."
                : "Type message for Patient..."
            }
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm px-4 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white p-2.5 rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
