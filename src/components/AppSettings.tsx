import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Trash2, Database, AlertCircle } from 'lucide-react';

interface AppSettingsProps {
  handleClearHistory: () => void;
  savedTrips: any[];
  fetchSavedTrips: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}

export default function AppSettings({
  handleClearHistory,
  savedTrips,
  fetchSavedTrips,
  showNotification
}: AppSettingsProps) {

  const handleWipeTrips = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all archived travel itineraries?")) {
      return;
    }
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const trips = await res.json();
        for (const t of trips) {
          await fetch(`/api/trips/${t.id}`, { method: "DELETE" });
        }
        fetchSavedTrips();
        showNotification("All database travel records purged successfully.", "success");
      }
    } catch (e) {
      showNotification("Could not fully clear database.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><Settings className="h-6 w-6" /></span>
          <span>System Care Configurations</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure credentials flags, clear conversation trackers and reset telemetry caches</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg max-w-2xl mx-auto space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Shield className="h-4.5 w-4.5 text-blue-600" />
          <span>Tripverse Application Rules</span>
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-150">
            <div>
              <h5 className="font-bold text-slate-800 text-sm leading-snug">Server Side Environments API Token</h5>
              <p className="text-slate-500 text-[11px] mt-0.5 font-medium">`GEMINI_API_KEY` is securely injected in server-side queries</p>
            </div>
            <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase text-[9px]">ACTIVE STATUS</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-150">
            <div>
              <h5 className="font-bold text-slate-800 text-sm leading-snug">Autonomous Caching Engine</h5>
              <p className="text-slate-500 text-[11px] mt-0.5 font-medium">Caches regional hotel ratings and airport connections locally</p>
            </div>
            <span className="bg-blue-100 border border-blue-200 text-blue-800 font-extrabold px-3 py-1 rounded-full uppercase text-[9px]">CACHED IN MEMORY</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm leading-none flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-blue-600" />
              <span>Developer Storage Operations</span>
            </h4>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
              Manually reset chat logs or wipe out saved itineraries database files. Use with caution as this deletes stored memories permanently.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button 
                onClick={() => {
                  handleClearHistory();
                  showNotification("Conversational logs cleared successfully.", "success");
                }}
                className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset Chat History</span>
              </button>

              <button 
                onClick={handleWipeTrips}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Wipe Stored Trips ({savedTrips.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
