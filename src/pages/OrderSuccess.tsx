import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, User, Phone, Mail, FileText, ArrowRight, Home, CreditCard } from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const orderData = location.state?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Success Icon Header */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-slate-850 font-display mb-2">
          Appointment Booked Successfully!
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
          Thank you for choosing NIVORA Healthcare. Your appointment order has been registered and confirmed.
        </p>

        {orderData && (
          <div className="bg-slate-50/80 rounded-xl p-6 text-left border border-slate-200/80 mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-200 gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Order Reference</span>
                <p className="text-lg font-mono font-bold text-slate-800">{orderData.id}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  orderData.paymentStatus === 'Paid' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {orderData.paymentMethod} • {orderData.paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">Patient Name</span>
                <span className="font-semibold text-slate-800 text-sm flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-primary-blue inline mr-1" />
                  {orderData.patientName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Appointment Schedule</span>
                <span className="font-semibold text-slate-800 text-sm flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-primary-green inline mr-1" />
                  {orderData.appointmentDate} at {orderData.appointmentTime}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Contact Email</span>
                <span className="font-medium text-slate-800 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 inline mr-1" />
                  {orderData.email}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Contact Phone</span>
                <span className="font-medium text-slate-800 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 inline mr-1" />
                  {orderData.phone || "N/A"}
                </span>
              </div>
            </div>

            {/* Service details */}
            {orderData.services && orderData.services.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs font-semibold uppercase text-gray-500 block mb-2">Booked Healthcare Service</span>
                {orderData.services.map((srv: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{srv.serviceName}</h4>
                      <p className="text-xs text-gray-500">Qty: {srv.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-850 text-base">₹{srv.subtotal || srv.price}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-gray-200 text-slate-850">
              <span>Total Amount</span>
              <span className="text-lg text-primary-blue">₹{orderData.totalAmount || orderData.total}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>View All My Appointments</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4 text-gray-500" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
