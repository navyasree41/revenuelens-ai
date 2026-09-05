import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  actionId?: string;
  invId?: string;
}

export const AIChatInvestigator: React.FC = () => {
  const { openInvestigationModal, investigations } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Good day! I am your AI Revenue Investigator. I monitor backend ledger events, payment traces, and checkout margins. Ask me anything about detected leaks, root causes, or recovery actions.',
      time: 'Just now',
    },
  ]);

  const quickPrompts = [
    'Why is discount stacking happening?',
    'Show me the highest impact leak',
    'How much revenue is recoverable today?',
    'What caused the COD anomaly?',
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let targetInvId: string | undefined;

      const lower = q.toLowerCase();

      if (lower.includes('discount') || lower.includes('stacking')) {
        reply =
          'Discount Stacking (INV-1042) was detected on checkout v4.1. Customers combined code WELCOME20 with FLASH15 due to missing client-side validation, causing an estimated ₹61,000 loss. I recommend enabling the single-coupon exclusivity rule.';
        targetInvId = 'INV-1042';
      } else if (lower.includes('highest') || lower.includes('impact') || lower.includes('most')) {
        reply =
          'The single highest estimated loss is Product A Wardrobing (INV-1041) at ₹82,000 across 28 customers. However, Discount Stacking (INV-1042) at ₹61,000 has the highest recoverable velocity (₹51,240 recoverable within 15 minutes).';
        targetInvId = 'INV-1042';
      } else if (lower.includes('recoverable') || lower.includes('today') || lower.includes('how much')) {
        reply =
          'Currently ₹1,72,000 is recoverable across all 5 categories. ₹86,400 has already been settled and recovered this cycle, maintaining a 71% recoverability rate.';
      } else if (lower.includes('cod') || lower.includes('failed') || lower.includes('pause')) {
        reply =
          'COD Return Spike (INV-1047) in Mumbai was paused by the Safety Guardrail. Forensic confidence was only 42% because only 8 orders were recorded. Per our responsible AI policy, no automated action was taken.';
        targetInvId = 'INV-1047';
      } else {
        reply = `I parsed your inquiry across 12,842 ledger entries. Our forensic models have active evidence corroborating ₹2.43L in potential margin leaks. You can inspect any investigation from the forensic docket.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: 'Just now',
          invId: targetInvId,
        },
      ]);
      setIsTyping(false);
    }, 650);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div id="ai-chat-investigator-container" className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0F172A]"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">Ask AI Investigator</span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
            v3.2
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className="w-96 sm:w-[420px] h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>AI Revenue Investigator</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Forensic Assistant · Live Context</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors font-medium shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.invId && (
                    <button
                      onClick={() => openInvestigationModal(m.invId!)}
                      className="mt-2.5 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open Docket #{m.invId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 text-slate-400 text-xs p-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about leak roots, settlement discrepancies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border-none text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
