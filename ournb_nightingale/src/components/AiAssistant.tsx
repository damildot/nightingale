import React, { useState, useRef, useEffect } from "react";
import { Neighborhood, ChatMessage, SyntheticPersona } from "../types";
import { MessageSquare, Send, Sparkles, User, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiAssistantProps {
  neighborhood: Neighborhood;
  sessionId: string;
  selectedPersona: SyntheticPersona | null;
}

export default function AiAssistant({
  neighborhood,
  sessionId,
  selectedPersona,
}: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When neighborhood changes, reset chat list and add welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: `Merhaba! Ben OURNB Yapay Zeka Mahalle Danışmanınızım. ${neighborhood.name} hakkında öğrenmek istediğiniz her şeyi sorabilirsiniz. Özellikle ulaşım, fiber internet altyapısı, kafeler, gürültü düzeyi veya yeşil alanlar hakkında merak ettiklerinizi sormaktan çekinmeyin!`,
      },
    ]);
  }, [neighborhood]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`/api/neighborhoods/${neighborhood.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      const aiReply: ChatMessage = { sender: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Üzgünüm, şu an bağlantıda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyiniz.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Quick helper questions in Turkish
  const getQuickQuestions = () => {
    if (selectedPersona) {
      switch (selectedPersona.persona_id) {
        case "PER_001":
          return [
            "İş yerine hızlı ulaşım ve toplu taşıma entegrasyonu nasıl?",
            "Fiber internet ve 3. nesil kahve dükkanı yoğunluğu nedir?",
          ];
        case "PER_002":
          return [
            "Laptopumu alıp sessizce çalışabileceğim kafeler var mı?",
            "Gün içi akustik gürültü ve internet stabilitesi nasıl?",
          ];
        case "PER_003":
          return [
            "Mahallenin genel güvenlik düzeyi ve yeşil alan oranı nasıl?",
            "Çocuklarım için iyi okullar ve parklar var mı?",
          ];
        case "PER_006":
          return [
            "Köpeğimle rahat yaşayabilir miyim? Pet-friendly kafeler var mı?",
            "Yakınlarda büyük köpek parkları veya veterinerler bulunuyor mu?",
          ];
        default:
          return [
            `${selectedPersona.segment} olarak bu mahalle benim için ne kadar uygun?`,
            "Sakin ve huzurlu bir yaşam sunuyor mu?",
          ];
      }
    }
    return [
      "Mithatpaşa caddesindeki trafik gürültüsü ne düzeyde?",
      "Ulaşım ve vapur/metro bağlantıları ne kadar pratik?",
      "Genel kiralık ev fiyatları ve yaşam maliyeti bütçemi zorlar mı?",
    ];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full min-h-0" id="ai-assistant-wrapper">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-indigo-50/40 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-gray-900 text-sm">
              Yapay Zeka Mahalle Danışmanı
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              Session: {sessionId.substring(0, 8)}...
            </p>
          </div>
        </div>
        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono uppercase">
          Aktif
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/30 scrollbar-thin" id="chat-messages-box">
        {messages.map((msg, idx) => {
          const isAi = msg.sender === "ai";
          return (
            <div
              key={idx}
              className={`flex gap-2.5 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isAi ? "bg-indigo-100 text-indigo-600" : "bg-gray-800 text-white"
                }`}
              >
                {isAi ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isAi
                    ? "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                    : "bg-gray-800 text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto" id="chat-loading-bubble">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="p-3 border-t border-gray-100 bg-white" id="chat-suggestions-box">
        <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block mb-1.5">
          Önerilen Hızlı Sorular
        </span>
        <div className="flex flex-col gap-1.5">
          {getQuickQuestions().map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-left text-[11px] text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50/40 p-2 rounded-lg border border-gray-100 transition-colors cursor-pointer truncate"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2 rounded-b-2xl" id="chat-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Mahalle hakkında sorun..."
          disabled={loading}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-400 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
