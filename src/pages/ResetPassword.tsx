import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Head branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center font-black text-white text-base">
              N
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-850 font-display">Reset Your Password</h2>
          <p className="text-xs text-gray-400">Request a recovery link for your Nivora health records</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Check Your Inbox</h4>
              <p className="text-xs text-gray-400">We've dispatched recovery steps to <span className="font-semibold text-slate-700">{email}</span></p>
            </div>
            <Link 
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-primary-blue hover:underline font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 uppercase tracking-widest disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Processing..." : "Dispatch Reset Link"}</span>
            </button>

            <div className="text-center">
              <Link 
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-gray-500 hover:text-primary-blue font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
