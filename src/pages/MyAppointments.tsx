import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  FileText, 
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Activity,
  MessageSquare
} from "lucide-react";
import { Order } from "../types";
import { apiService, getAuthToken } from "../services/api";
import DoctorPatientChatModal from "../components/DoctorPatientChatModal";

interface MyAppointmentsProps {
  orders?: Order[];
  user?: any;
}

export default function MyAppointments({ orders: initialOrders = [], user }: MyAppointmentsProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "Razorpay" | "Cash on Appointment">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("Failed to fetch secure user orders via JWT:", err?.message || err);
      // Fallback: If user prop or stored user is provided, strictly filter initial orders by user ID or email
      const activeUser = user || (() => {
        const saved = localStorage.getItem("nivora_user");
        if (saved) { try { return JSON.parse(saved); } catch (e) {} }
        return null;
      })();

      if (activeUser && (activeUser.id || activeUser.email)) {
        const myFiltered = initialOrders.filter(
          (o) =>
            (activeUser.id && o.userId === activeUser.id) ||
            (activeUser.email && o.email && o.email.toLowerCase() === activeUser.email.toLowerCase()) ||
            (activeUser.email && o.customerEmail && o.customerEmail.toLowerCase() === activeUser.email.toLowerCase())
        );
        setOrders(myFiltered);
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, initialOrders]);

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    // Payment filter
    const matchesPayment = paymentFilter === "ALL" || o.paymentMethod === paymentFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "ALL" || (o.orderStatus || "Booked") === statusFilter;

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesPayment && matchesStatus;

    const patientName = (o.patientName || o.customerName || "").toLowerCase();
    const email = (o.email || o.customerEmail || "").toLowerCase();
    const phone = (o.phone || "").toLowerCase();
    const orderId = (o.id || "").toLowerCase();
    const servicesStr = (o.services || o.items || [])
      .map((s) => s.serviceName)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      patientName.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      orderId.includes(q) ||
      servicesStr.includes(q);

    return matchesPayment && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalBookings = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid").length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === "Pending").length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Title & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-primary-blue text-xs font-bold uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>NIVORA Healthcare Patient Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-slate-850 font-display">
              My Appointments & Orders
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Track and manage all your healthcare service bookings, payment receipts, and schedule updates in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary-blue" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/doctor-visit"
              className="px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Service</span>
            </Link>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
            <div className="text-xl font-black text-slate-850 mt-1">{totalBookings}</div>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paid Payments</span>
            <div className="text-xl font-black text-emerald-800 mt-1">{paidOrders}</div>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pay on Appointment</span>
            <div className="text-xl font-black text-amber-800 mt-1">{pendingOrders}</div>
          </div>
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Total Paid Amount</span>
            <div className="text-xl font-black text-blue-900 mt-1">₹{totalSpent}</div>
          </div>
        </div>

        {/* Controls, Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ID, patient name, email, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue/30 bg-gray-50/80"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
              {["ALL", "Booked", "Confirmed", "Completed", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    statusFilter === st ? "bg-white text-slate-850 shadow-xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Payment Filter */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setPaymentFilter("ALL")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  paymentFilter === "ALL" ? "bg-white text-slate-850 shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setPaymentFilter("Razorpay")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  paymentFilter === "Razorpay" ? "bg-white text-blue-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <CreditCard className="w-3 h-3 text-blue-600" />
                <span>Razorpay</span>
              </button>
              <button
                onClick={() => setPaymentFilter("Cash on Appointment")}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  paymentFilter === "Cash on Appointment" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Banknote className="w-3 h-3 text-emerald-600" />
                <span>Cash</span>
              </button>
            </div>
          </div>

        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
            <RefreshCw className="w-6 h-6 text-primary-blue animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">Loading your appointment records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || paymentFilter !== "ALL" || statusFilter !== "ALL"
                ? "No bookings match your selected search or filter criteria."
                : "You have not booked any healthcare appointments yet."}
            </p>
            <Link
              to="/doctor-visit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-primary-blue-hover transition mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Explore & Book Appointments</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const services = ord.services || ord.items || [];
              const patient = ord.patientName || ord.customerName || "Patient";
              const date = ord.appointmentDate || ord.date || "Scheduled";
              const time = ord.appointmentTime || "10:00 AM";

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Top Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-slate-850">{ord.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === "Confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.orderStatus === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : ord.orderStatus === "Cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            ● {ord.orderStatus || "Booked"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Created on {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ord.date || "Today"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Payment Status Pill */}
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          ord.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {ord.paymentMethod === "Razorpay" ? (
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{ord.paymentMethod || "Cash"} • {ord.paymentStatus}</span>
                      </span>

                      <button
                        onClick={() => setActiveChatOrder(ord)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        title="Open real-time chat with assigned doctor"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Chat with Doctor</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Middle Grid: Patient + Services + Schedule + Assigned Doctor */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    
                    {/* Column 1: Patient Details */}
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Patient Info</span>
                      <div className="font-bold text-slate-800 text-sm flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-primary-blue inline" />
                        <span>{patient}</span>
                      </div>
                      <div className="text-gray-600 flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400 inline" />
                        <span className="truncate">{ord.email || ord.customerEmail || "N/A"}</span>
                      </div>
                      <div className="text-gray-600 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400 inline" />
                        <span>{ord.phone || "N/A"}</span>
                      </div>
                    </div>

                    {/* Column 2: Assigned Doctor */}
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Doctor</span>
                      {ord.assignedDoctorName ? (
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={ord.assignedDoctorPhoto || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"}
                            alt={ord.assignedDoctorName}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-300 shadow-xs"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-xs truncate flex items-center space-x-1">
                              <span>{ord.assignedDoctorName}</span>
                            </div>
                            <p className="text-[10px] text-emerald-700 font-medium truncate">
                              {ord.assignedDoctorSpecialization || "Specialist"}
                            </p>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">
                              📞 {ord.assignedDoctorPhone || "N/A"}
                            </p>
                            <button
                              onClick={() => setActiveChatOrder(ord)}
                              className="mt-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md text-[10px] transition inline-flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title="Chat directly with your assigned specialist"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-200" />
                              <span>Chat Now</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-1 space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ⏳ Assignment Pending
                          </span>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            Admin will assign a DHA licensed specialist shortly.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Schedule & Slot */}
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Appointment Schedule</span>
                      <div className="font-bold text-slate-800 text-sm flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-green inline" />
                        <span>{date}</span>
                      </div>
                      <div className="text-gray-600 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400 inline" />
                        <span>{time} ({ord.timeSlot || "Standard Slot"})</span>
                      </div>
                      {ord.notes && (
                        <p className="text-[10px] text-gray-500 italic truncate">Notes: {ord.notes}</p>
                      )}
                    </div>

                    {/* Column 4: Healthcare Services & Amount */}
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Booked Services</span>
                        {services.map((s: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-semibold text-slate-800 text-xs py-0.5">
                            <span className="truncate max-w-[120px]">{s.serviceName}</span>
                            <span>₹{s.subtotal || s.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center font-bold">
                        <span className="text-slate-600">Total:</span>
                        <span className="text-base text-slate-900">₹{ord.totalAmount || ord.total}</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Selected Order Full Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm font-display">Appointment Receipt & Details</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Patient & Booking Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Patient & Schedule Record</h5>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Patient Name</span>
                    <span className="font-bold text-slate-900">{selectedOrder.patientName || selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Email</span>
                    <span className="font-semibold">{selectedOrder.email || selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Phone</span>
                    <span className="font-medium">{selectedOrder.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Schedule Date/Time</span>
                    <span className="font-medium">{selectedOrder.appointmentDate || selectedOrder.date} at {selectedOrder.appointmentTime || "10:00 AM"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Relation</span>
                    <span className="font-medium">{selectedOrder.relation || "Self"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">DOB / Gender</span>
                    <span className="font-medium">{selectedOrder.dateOfBirth || "N/A"} • {selectedOrder.gender || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Booked Healthcare Services</h5>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {(selectedOrder.services || selectedOrder.items || []).map((srv: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{srv.serviceName}</div>
                        <div className="text-[10px] text-gray-400">Qty: {srv.quantity || 1} • Price: ₹{srv.price}</div>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">₹{srv.subtotal || srv.price * (srv.quantity || 1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>Payment Status</span>
                  <span className="text-emerald-800 font-extrabold">{selectedOrder.paymentMethod}</span>
                </h5>

                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Total Amount</span>
                    <span className="font-black text-slate-900 text-sm">₹{selectedOrder.totalAmount || selectedOrder.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Payment Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>

                  {selectedOrder.razorpayOrderId && (
                    <div className="col-span-2 pt-1 border-t border-emerald-200/60 space-y-1 font-mono text-[10px]">
                      <div>
                        <span className="text-gray-500">Razorpay Order ID: </span>
                        <span className="font-bold text-slate-800">{selectedOrder.razorpayOrderId}</span>
                      </div>
                      {selectedOrder.razorpayPaymentId && (
                        <div>
                          <span className="text-gray-500">Razorpay Payment ID: </span>
                          <span className="font-bold text-slate-800">{selectedOrder.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Doctor-Patient Chat Modal */}
      {activeChatOrder && (
        <DoctorPatientChatModal
          isOpen={!!activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
          appointment={activeChatOrder}
          currentUserRole="patient"
          currentUserName={user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
        />
      )}

    </div>
  );
}
