import React from "react";
import { Bell, Globe, Search, UserCheck } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  adminUser: any;
}

export default function AdminHeader({ title, adminUser }: AdminHeaderProps) {
  const getDisplayTitle = (tab: string) => {
    switch (tab) {
      case "categories": return "Category List & Creation";
      case "services": return "Services List & Creation";
      case "admin-role": return "Super Admin Role Management";
      case "service-management": return "Service Parameters & Status";
      case "service-allocation": return "Provider Service Allocation";
      case "users": return "Registered Patients & Users";
      case "bookings": return "Active Patient Bookings";
      case "collected-cash": return "Collected Cash Reports";
      case "providers": return "Partner Diagnostic Labs & Clinics";
      case "practitioners": return "DHA-Licensed Practitioners";
      case "reviews": return "Patient Experience Reviews";
      case "earnings": return "Clinical Earnings Report";
      default: return "Nivora Admin Console";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 font-display capitalize leading-tight">
          {getDisplayTitle(title)}
        </h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5">Nivora Group Hospital Management • Secure Session</p>
      </div>

      {/* Action panel */}
      <div className="flex items-center space-x-6">
        {/* Language picker */}
        <div className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-gray-500 hover:text-primary-blue bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-colors">
          <Globe className="w-3.5 h-3.5" />
          <span>EN</span>
        </div>

        {/* Alerts / Notifications */}
        <button className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-slate-800 transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center space-x-3 border-l border-gray-250 pl-6">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 leading-none">
              {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Super Administrator"}
            </span>
            <span className="text-[10px] text-primary-green font-bold uppercase tracking-wider mt-1 leading-none">
              {adminUser ? adminUser.role : "Super Admin"}
            </span>
          </div>
          <div className="relative">
            <img
              src={adminUser?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"}
              alt="Admin Avatar"
              className="w-9 h-9 rounded-lg border border-gray-200 object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
