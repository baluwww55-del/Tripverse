import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Sparkles } from 'lucide-react';
import { UserPreferences } from '../types';

interface TravelerProfileProps {
  prefForm: UserPreferences;
  setPrefForm: (form: UserPreferences) => void;
  savePreferences: (updated: UserPreferences) => void;
}

export default function TravelerProfile({
  prefForm,
  setPrefForm,
  savePreferences
}: TravelerProfileProps) {

  const handleSelectIntensity = (intensity: 'low' | 'medium' | 'high') => {
    setPrefForm({ ...prefForm, preferredActivityLevel: intensity });
  };

  const handleToggleStyle = (style: string) => {
    let updatedStyles = [...prefForm.travelStyle];
    if (updatedStyles.includes(style)) {
      updatedStyles = updatedStyles.filter(s => s !== style);
    } else {
      updatedStyles.push(style);
    }
    setPrefForm({ ...prefForm, travelStyle: updatedStyles });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences(prefForm);
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
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><User className="h-6 w-6" /></span>
          <span>Traveler Style Profile</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure physical limits, dietary rules, and holiday goals integrated with the AI agent ecosystem</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg max-w-2xl mx-auto space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Shield className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
          <span>Bespoke Specifications Rules</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase block ml-1">Traveler Name</label>
              <input 
                type="text" 
                value={prefForm.name}
                onChange={(e) => setPrefForm({ ...prefForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase block ml-1">Verified Representative Email</label>
              <input 
                type="email" 
                value={prefForm.email}
                onChange={(e) => setPrefForm({ ...prefForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase block ml-1">Client Budget Tier Selection</label>
            <select 
              value={prefForm.budgetLevel}
              onChange={(e) => setPrefForm({ ...prefForm, budgetLevel: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="budget">Thrifty Explorer ($300 - $1000 limit per holiday)</option>
              <option value="moderate">Bespoke Comfort ($1200 - $2500 limit per holiday)</option>
              <option value="luxury">Affluent Premium Experience ($3000 - $8000 limit per holiday)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase block ml-1">Dietary Requirements Check</label>
            <select 
              value={prefForm.dietary}
              onChange={(e) => setPrefForm({ ...prefForm, dietary: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="any">Standard Cuisine (No restriction)</option>
              <option value="vegetarian">Pure Vegetarian Traditional Selection</option>
              <option value="halal">Strict Halal Certified Cuisine</option>
              <option value="vegan">Vegan Botanicals (Dairy & meat free)</option>
              <option value="gluten-free">Strict Gluten-Free Safety Filter</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase block ml-1">Preferred Physical Intensity Limits</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button 
                  key={lvl}
                  type="button"
                  onClick={() => handleSelectIntensity(lvl)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shadow-sm border ${
                    prefForm.preferredActivityLevel === lvl 
                      ? 'active-gradient text-white border-blue-400' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {lvl} Activity
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase block ml-[2px]">Travel Concept priorities</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['culture', 'relax', 'adventure', 'shopping', 'foodie'].map((st) => {
                const isSelected = prefForm.travelStyle.includes(st);
                return (
                  <button 
                    key={st}
                    type="button"
                    onClick={() => handleToggleStyle(st)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {st === 'foodie' ? '🍽️ Culinary Glocal' :
                     st === 'culture' ? '🏛️ Art & Heritage' :
                     st === 'relax' ? '🧘 Mindfulness' :
                     st === 'adventure' ? '🧗 Expedition' :
                     st === 'shopping' ? '🛍️ Boutiques' : st}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full active-gradient text-white py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 transition"
            >
              Sync Personal Priorities to Memory
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
