import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Mic, MicOff, RefreshCw, Trash2, Shield, Heart } from 'lucide-react';
import { ChatMessage, UserPreferences } from '../types';

interface ConciergeChatProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isSendingChat: boolean;
  handleSendChat: (override?: string) => void;
  handleClearHistory: () => void;
  voiceActive: boolean;
  toggleVoiceInput: () => void;
  userPrefs: UserPreferences;
}

export default function ConciergeChat({
  chatHistory,
  chatInput,
  setChatInput,
  isSendingChat,
  handleSendChat,
  handleClearHistory,
  voiceActive,
  toggleVoiceInput,
  userPrefs
}: ConciergeChatProps) {

  const quickPrompts = [
    "Tell me the best luxury beach resorts in Goa.",
    "Draft a 4-day heritage tour structure for Jaipur Forts.",
    "What is the recommended tourist guide to Mysore Palace?",
    "Suggest cultural guidelines for visiting historical shrines in Varanasi."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><MessageSquare className="h-6 w-6" /></span>
            <span>AI Concierge Chatdesk</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Converse directly with multi-agent modules to calibrate routes, languages, or safety policies</p>
        </div>
        
        <button 
          onClick={handleClearHistory}
          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl font-bold cursor-pointer transition flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Reset Concierge Chat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left column: Active Agent Desks */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Standby Travel Experts</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">S</span>
                  <span className="text-xs font-bold text-slate-800">Smart Planner Agent</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">Assembles custom schedules, booking links, and hotel price indices.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">G</span>
                  <span className="text-xs font-bold text-slate-800">Bespoke Tour Guide</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">Prepares cultural guidelines, currency alerts, and security alerts.</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">P</span>
                  <span className="text-xs font-bold text-slate-800">Identity Memory Node</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">Auto-aligns questions to traveler styles ({userPrefs.travelStyle.join(', ')}).</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-200 text-xs text-slate-600">
            <div className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wide flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Preference Metrics</span>
            </div>
            <div className="space-y-1 pl-1 font-medium text-[11px]">
              <div>Style: <span className="font-semibold text-slate-900">{userPrefs.travelStyle.join(', ')}</span></div>
              <div>Budget: <span className="font-semibold text-slate-900 capitalize">{userPrefs.budgetLevel}</span></div>
              <div>Dietary: <span className="font-semibold text-slate-900">{userPrefs.dietary}</span></div>
            </div>
          </div>
        </div>

        {/* Right column: Main Interactive Messenger */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[520px] overflow-hidden">
          
          {/* Main Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatHistory.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={m.id} className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className={`w-8 h-8 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center text-white ${
                      m.agentType === 'planner' ? 'bg-blue-600' :
                      m.agentType === 'guide' ? 'bg-amber-500' :
                      m.agentType === 'user' ? 'bg-rose-500' : 'bg-slate-700'
                    }`}>
                      {m.agentType === 'planner' ? 'SP' :
                       m.agentType === 'guide' ? 'TG' :
                       m.agentType === 'user' ? 'IM' : 'AI'}
                    </div>
                  )}

                  <div className={`max-w-md p-4 rounded-3xl text-xs leading-relaxed ${
                    isAi 
                      ? 'bg-slate-100 border border-slate-200 text-slate-800 shadow-sm' 
                      : 'active-gradient text-white font-medium shadow-md'
                  }`}>
                    {isAi && (
                      <div className="text-[9px] uppercase tracking-widest text-[#2563EB] font-black mb-1">
                        {m.agentType === 'planner' ? 'Smart Planner Agent' :
                         m.agentType === 'guide' ? 'Bespoke Tour Guide' :
                         m.agentType === 'user' ? 'Identity Memory Agent' : 'Bespoke AI Coordinator'}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              );
            })}

            {isSendingChat && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  ⌛
                </div>
                <div className="max-w-md p-4 bg-slate-50 text-slate-500 text-xs rounded-3xl border border-slate-150">
                  Formulating agent callbacks...
                </div>
              </div>
            )}
          </div>

          {/* Quick inquiries slider */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 overflow-x-auto">
            <span className="text-[9px] text-[#2563EB] font-black uppercase px-1.5 py-1 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-blue-600 text-blue-600 animate-pulse" />
              <span>Suggested Inquiries:</span>
            </span>
            {quickPrompts.map((p, pIdx) => (
              <button 
                key={pIdx}
                onClick={() => handleSendChat(p)}
                className="bg-white hover:bg-slate-100 text-[10px] text-slate-700 font-semibold py-1 px-3 rounded-lg border border-slate-200 cursor-pointer whitespace-nowrap transition shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Inputs */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            <button 
              onClick={toggleVoiceInput}
              className={`p-3 rounded-xl cursor-pointer transition ${
                voiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="Speak with Butler"
            >
              {voiceActive ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChat();
              }}
              placeholder={voiceActive ? "Voice interpreter typing..." : "Type custom parameters, dictionary triggers or landmark queries..."}
              className="flex-1 bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              disabled={isSendingChat}
            />

            <button 
              onClick={() => handleSendChat()}
              disabled={isSendingChat || !chatInput.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer disabled:opacity-40 shadow transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
