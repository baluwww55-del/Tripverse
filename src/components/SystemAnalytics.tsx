import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, RefreshCw, Layers, CheckCircle2, CloudLightning } from 'lucide-react';
import { AdminMetrics } from '../types';

interface SystemAnalyticsProps {
  adminMetrics: AdminMetrics | null;
  fetchAdminMetrics: () => void;
}

export default function SystemAnalytics({
  adminMetrics,
  fetchAdminMetrics
}: SystemAnalyticsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><ShieldAlert className="h-6 w-6" /></span>
            <span>Diagnostics & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live corporate endpoint telemetry logs, request latency counters and error rates</p>
        </div>
        
        <button 
          onClick={fetchAdminMetrics}
          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span>Sync Diagnostics</span>
        </button>
      </div>

      {!adminMetrics ? (
        <div className="bg-slate-100 p-12 text-center rounded-3xl text-sm font-semibold text-slate-500">
          Syncing diagnostics reports from Node.js database...
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 text-xs font-semibold">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 text-center">
              <span className="text-slate-400 uppercase text-[9px] font-black tracking-widest block">Inferences</span>
              <div className="text-xl font-extrabold text-slate-900">{adminMetrics.metrics.totalAPICalls} Hits</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 text-center">
              <span className="text-slate-400 uppercase text-[9px] font-black tracking-widest block">Response Latency</span>
              <div className="text-xl font-extrabold text-blue-600">{adminMetrics.metrics.averageLatencyMs} ms</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 text-center">
              <span className="text-slate-400 uppercase text-[9px] font-black tracking-widest block">Plan Volume</span>
              <div className="text-xl font-extrabold text-indigo-600">{adminMetrics.metrics.totalTripsCount} Trips</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 text-center">
              <span className="text-slate-400 uppercase text-[9px] font-black tracking-widest block">System Revenue</span>
              <div className="text-xl font-extrabold text-emerald-600">${adminMetrics.metrics.totalRevenues}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 text-center">
              <span className="text-slate-400 uppercase text-[9px] font-black tracking-widest block">System Error Rate</span>
              <div className="text-xl font-extrabold text-[#EF4444]">{adminMetrics.metrics.errorRatePercent}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Agent Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-blue-600" />
                <span>Agent Trigger Distribution</span>
              </h3>
              
              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Smart Planner Agent
                    </span>
                    <span className="text-slate-500">{adminMetrics.agentDistribution.planner} Triggers</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, Math.max(12, (adminMetrics.agentDistribution.planner / (adminMetrics.metrics.chatInteractionsCount || 1)) * 100))}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Tour Guide Agent
                    </span>
                    <span className="text-slate-500">{adminMetrics.agentDistribution.guide} Triggers</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, Math.max(12, (adminMetrics.agentDistribution.guide / (adminMetrics.metrics.chatInteractionsCount || 1)) * 100))}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> User Personal Agent
                    </span>
                    <span className="text-slate-500">{adminMetrics.agentDistribution.userPersona} Triggers</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, Math.max(12, (adminMetrics.agentDistribution.userPersona / (adminMetrics.metrics.chatInteractionsCount || 1)) * 100))}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* HTTP Query logs */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <CloudLightning className="h-4.5 w-4.5 text-blue-600" />
                <span>REST Query HTTP Endpoints Logs</span>
              </h3>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {adminMetrics.logs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">No API traces logged.</div>
                ) : (
                  adminMetrics.logs.map((l, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                          l.status >= 400 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {l.status}
                        </span>
                        <span className="text-slate-800 font-bold">{l.endpoint}</span>
                      </div>
                      <span className="text-blue-600 font-bold">{l.responseTimeMs}ms</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
