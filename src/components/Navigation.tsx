import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Plane, 
  Hotel, 
  MessageSquare, 
  LayoutDashboard, 
  Bookmark, 
  User, 
  Settings, 
  ShieldAlert, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userPrefsName: string;
  onLogout?: () => void;
}

export default function Navigation({ currentPage, onPageChange, userPrefsName, onLogout }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'landing', label: 'Home', icon: Compass },
    { id: 'planner', label: 'Smart Planner', icon: MapPin },
    { id: 'explore', label: 'Explore India', icon: Compass },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'chat', label: 'Concierge Chat', icon: MessageSquare },
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'saved', label: 'Saved Trips', icon: Bookmark },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Metrics', icon: ShieldAlert },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-900/5 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand section */}
          <div className="flex items-center" id="nav-brand-section">
            <button 
              onClick={() => onPageChange('landing')}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 hover:opacity-90 cursor-pointer transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Compass className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-indigo-700 bg-clip-text text-transparent">Tripverse</span>
                <span className="text-[9px] text-amber-600 tracking-widest uppercase font-semibold">Incredible India AI</span>
              </div>
            </button>
            
            {/* Desktop Center Links */}
            <div className="hidden xl:flex items-center space-x-1 ml-8">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'active-gradient text-white shadow-md border border-blue-400/20' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop center capsule for non-wide resolutions */}
            <div className="hidden lg:flex xl:hidden items-center space-x-1 ml-4">
              {menuItems.slice(0, 8).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'active-gradient text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User profile capsule and right actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => onPageChange('saved')}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                currentPage === 'saved' ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Saved Journeys"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all shadow-sm"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userPrefsName ? userPrefsName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-700 max-w-[80px] truncate">{userPrefsName || 'Guest'}</span>
            </button>
            <button
              onClick={() => onPageChange('settings')}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                currentPage === 'settings' ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-full cursor-pointer text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full glass border-b border-slate-200 shadow-2xl z-50">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold cursor-pointer transition-all ${
                    isActive 
                      ? 'active-gradient text-white shadow-lg border border-blue-500/20' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
