import React from "react";
import { 
  FolderHeart, 
  Stethoscope, 
  ShieldCheck, 
  Wrench, 
  Network, 
  Users, 
  CalendarCheck, 
  Coins, 
  Building2, 
  UserRoundCheck, 
  MessageSquare, 
  TrendingUp,
  LogOut,
  Sliders
} from "lucide-react";

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ currentTab, onTabChange, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: "categories", label: "Category", icon: FolderHeart },
    { id: "services", label: "Services", icon: Stethoscope },
    { id: "admin-role", label: "Admin Role", icon: ShieldCheck },
    { id: "service-management", label: "Service Management", icon: Wrench },
    { id: "service-allocation", label: "Service Allocation", icon: Network },
    { id: "users", label: "Registration Users", icon: Users },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "collected-cash", label: "Collected Cash", icon: Coins },
    { id: "providers", label: "Providers", icon: Building2 },
    { id: "practitioners", label: "Practitioners", icon: UserRoundCheck },
    { id: "reviews", label: "Manage Reviews", icon: MessageSquare },
    { id: "earnings", label: "Manage Earnings", icon: TrendingUp }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-green flex items-center justify-center font-black text-sm text-white">
            N
          </div>
          <div>
            <h2 className="font-display font-black text-sm tracking-tight text-white leading-none">NIVORA</h2>
            <p className="text-[9px] font-bold text-primary-green tracking-widest leading-none mt-1">ADMIN PORTAL</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-primary-green text-white shadow-md shadow-primary-green/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-slate-500 text-[10px] space-y-3">
        <div className="flex items-center justify-between">
          <span>Security Level: High</span>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-2 bg-slate-800 hover:bg-red-950/30 hover:text-red-400 rounded-lg text-xs font-bold text-slate-400 transition-colors flex items-center justify-center space-x-1.5 border border-slate-700/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
}
