import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { advisorAPI } from "../utils/api";
import { Link } from "react-router-dom";

export default function ChatAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm your **CarSense AI Advisor** 🚗✨\n\nI can help you find the perfect car! Tell me about:\n- 💰 Your budget\n- 🚙 Preferred type (SUV, sedan, hatchback)\n- ⛽ Fuel preference\n- 🎯 What matters most (safety, mileage, performance)\n\nOr just say *"I don't know what to buy"* — I'll guide you!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedCars, setRecommendedCars] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await advisorAPI.chat(userMessage, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
      if (res.data.recommendedCars?.length > 0) {
        setRecommendedCars(res.data.recommendedCars);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again! 🔧",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Best SUV under 20 lakhs",
    "Safest car for family",
    "Best electric car",
    "Budget car under 8 lakhs",
  ];

  // Simple markdown renderer for chat
  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        id="chat-toggle-btn"
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 z-50 flex items-center justify-center cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Advisor"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold px-1 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4">
            AI
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] max-w-[calc(100vw-32px)] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-950 border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Bot size={20} className="text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-white leading-none">CarSense AI Advisor</h3>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                  <Sparkles size={8} /> Online
                </span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.role === "user" ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-slate-400 border border-white/5"}`}>
                  {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none"
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3 max-w-[85%] self-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-white/5 text-slate-400 border border-white/5">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/5 rounded-tl-none flex gap-1 items-center justify-center h-8">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}

            {/* Recommended Cars Quick Links */}
            {recommendedCars.length > 0 && messages.length > 2 && (
              <div className="flex flex-col gap-1.5 pl-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick links:</span>
                <div className="flex flex-wrap gap-1.5">
                  {recommendedCars.map((car) => (
                    <Link
                      key={car._id}
                      to={`/car/${car._id}`}
                      className="bg-white/5 border border-white/5 text-[10px] font-bold px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {car.make} {car.model}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-5 pb-4 pt-1">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => {
                      inputRef.current?.form?.requestSubmit();
                    }, 50);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form className="flex items-center gap-2 border-t border-white/5 p-4 bg-slate-900" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="flex-grow bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
              placeholder="Ask about cars..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              id="chat-input"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              disabled={!input.trim() || loading}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
