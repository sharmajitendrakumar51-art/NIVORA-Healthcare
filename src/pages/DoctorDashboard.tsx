import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Check, 
  UserCheck, 
  Activity, 
  Award, 
  MapPin, 
  Search,
  LogOut
} from "lucide-react";
import { Order, Doctor } from "../types";
import DoctorPatientChatModal from "../components/DoctorPatientChatModal";

interface DoctorDashboardProps {
  doctorUser?: any;
  onLogout?: () => void;
}

export default function DoctorDashboard({ doctorUser, onLogout }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const currentDoctor: Doctor = doctorUser || {
    id: "DOC-101",
    fullName: "Dr. Alexander Wright",
    email: "alexander.wright@nivora.org",
    phone: "+971 50 888 1234",
    specialization: "General Practitioner & Family Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experience: "12 Years",
    availability: "Mon - Sat (08:00 AM - 06:00 PM)",
    status: "Active",
    profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  };

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/doctor/appointments?doctorId=${currentDoctor.id}&email=${encodeURIComponent(currentDoctor.email)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      }
    } catch (err) {
      console.error("Error fetching doctor assigned appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [doctorUser]);

  const handleAcceptAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/doctor/appointments/${encodeURIComponent(id)}/accept`, {
        method: "PUT",
        headers
      });

      if (res.ok) {
        setActionSuccess(`Appointment ${id} successfully accepted!`);
        setTimeout(() => setActionSuccess(""), 4000);
        fetchDoctorAppointments();
      }
    } catch (err) {
      console.error("Failed to accept appointment:", err);
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/doctor/appointments/${encodeURIComponent(id)}/complete`, {
        method: "PUT",
        headers
      });

      if (res.ok) {
        setActionSuccess(`Appointment ${id} marked as Completed.`);
        setTimeout(() => setActionSuccess(""), 4000);
        fetchDoctorAppointments();
      }
    } catch (err) {
      console.error("Failed to complete appointment:", err);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === "ALL" || app.orderStatus === statusFilter || (app as any).status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const patientName = (app.patientName || app.customerName || "").toLowerCase();
    const email = (app.email || app.customerEmail || "").toLowerCase();
    const id = (app.id || "").toLowerCase();
    const phone = (app.phone || "").toLowerCase();

    return matchesStatus && (patientName.includes(q) || email.includes(q) || id.includes(q) || phone.includes(q));
  });

  const totalAssigned = appointments.length;
  const confirmedCount = appointments.filter((a) => a.orderStatus === "Confirmed" || (a as any).status === "Confirmed").length;
  const completedCount = appointments.filter((a) => a.orderStatus === "Completed" || (a as any).status === "Completed").length;
  const pendingCount = appointments.filter((a) => a.orderStatus === "Pending" || (a as any).status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Doctor Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 pointer-events-none transform skew-x-12"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-5">
              <img
                src={currentDoctor.profilePhoto || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"}
                alt={currentDoctor.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                    DHA Licensed Physician
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h1 className="text-2xl font-black font-display mt-1 text-white">{currentDoctor.fullName}</h1>
                <p className="text-xs text-emerald-200 font-medium">{currentDoctor.specialization} • {currentDoctor.qualification || "MD"}</p>
                <div className="flex items-center space-x-4 text-[11px] text-slate-300 mt-2">
                  <span>✉️ {currentDoctor.email}</span>
                  <span>📞 {currentDoctor.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-stretch md:self-auto justify-end">
              <button
                onClick={fetchDoctorAppointments}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-2 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refresh Appointments</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 border border-rose-700/50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Success Alert Banner */}
        {actionSuccess && (
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-md flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Assigned</p>
              <h3 className="text-xl font-black text-slate-850 font-display">{totalAssigned}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Confirm</p>
              <h3 className="text-xl font-black text-slate-850 font-display">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirmed Visits</p>
              <h3 className="text-xl font-black text-slate-850 font-display">{confirmedCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completed Visits</p>
              <h3 className="text-xl font-black text-slate-850 font-display">{completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
            {["ALL", "Pending", "Confirmed", "Completed", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Visits" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Appointments List */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">Loading doctor assigned visits...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-2">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Assigned Patient Appointments</h3>
            <p className="text-xs text-gray-500">
              There are currently no patient visits assigned matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((app) => {
              const services = app.services || app.items || [];
              const patientName = app.patientName || app.customerName || "Patient";
              const date = app.appointmentDate || app.date || "Scheduled";
              const time = app.appointmentTime || "10:00 AM";
              const currentStatus = app.orderStatus || (app as any).status || "Pending";

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-sm text-slate-900">{app.id}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          currentStatus === "Confirmed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : currentStatus === "Completed"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : currentStatus === "Cancelled"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        ● {currentStatus}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {currentStatus === "Pending" && (
                        <button
                          onClick={() => handleAcceptAppointment(app.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Assignment</span>
                        </button>
                      )}

                      {currentStatus !== "Completed" && currentStatus !== "Cancelled" && (
                        <button
                          onClick={() => handleCompleteAppointment(app.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveChatOrder(app)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Chat Patient</span>
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Patient Info */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Patient Details</span>
                      <p className="font-bold text-slate-900 text-sm">{patientName}</p>
                      <p className="text-gray-600">✉️ {app.email || app.customerEmail || "N/A"}</p>
                      <p className="text-gray-600">📞 {app.phone || "N/A"}</p>
                      {app.dateOfBirth && <p className="text-[11px] text-slate-500">DOB: {app.dateOfBirth}</p>}
                    </div>

                    {/* Schedule */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Visit Schedule</span>
                      <p className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 inline" />
                        <span>{date}</span>
                      </p>
                      <p className="text-gray-600 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400 inline" />
                        <span>{time} ({app.timeSlot || "Standard Slot"})</span>
                      </p>
                      {app.notes && <p className="text-[10px] text-gray-500 italic">Notes: {app.notes}</p>}
                    </div>

                    {/* Services & Fee */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assigned Care Services</span>
                        {services.map((s: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-semibold text-slate-800 py-0.5">
                            <span>{s.serviceName}</span>
                            <span>₹{s.subtotal || s.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold">
                        <span>Total Consultation:</span>
                        <span className="text-emerald-700 text-sm">₹{app.totalAmount || app.total}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Live Chat Modal */}
      {activeChatOrder && (
        <DoctorPatientChatModal
          isOpen={Boolean(activeChatOrder)}
          onClose={() => setActiveChatOrder(null)}
          appointment={activeChatOrder}
          currentUserRole="doctor"
          currentUserName={currentDoctor.fullName}
        />
      )}
    </div>
  );
}
