import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

interface AdminLoginProps {
  onAdminLoginSuccess: (adminData: any) => void;
}

export default function AdminLogin({ onAdminLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("nivora@gmail.com");
  const [password, setPassword] = useState("nivora");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.role === "Super Admin") {
        onAdminLoginSuccess({
          ...data.user,
          role: data.role,
          token: data.token
        });
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Unauthorized: These credentials do not belong to an active administrator.");
      }
    } catch (err) {
      setError("Failed to reach the administrative security gateways.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">
      
      {/* Decorative background grids */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-green/10 to-transparent blur-3xl pointer-events-none"></div>

      {/* Main Box */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6 relative z-10">
        
        {/* Upper Brand Info */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary-green flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary-green/25">
              N
            </div>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white mt-1.5">Welcome Admin!</h2>
          <p className="text-[11px] text-slate-400 font-medium">Enter your credentials to access the Nivora Healthcare Admin Panel</p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-semibold p-3.5 rounded-lg text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Authenticate Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green"
                placeholder="nivora@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-green hover:bg-primary-green-hover text-white rounded-lg text-xs font-semibold shadow-md shadow-primary-green/10 transition flex items-center justify-center space-x-2 uppercase tracking-widest cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{loading ? "Authenticating Gateway..." : "Authenticate"}</span>
          </button>
        </form>

        {/* Return to patient portal */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Patient Portal</span>
          </button>
        </div>

        {/* AES Secure Notice Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[9px] font-bold tracking-wider uppercase text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />
          <span>Secure 256-bit AES Encryption</span>
        </div>
      </div>
    </div>
  );
}
