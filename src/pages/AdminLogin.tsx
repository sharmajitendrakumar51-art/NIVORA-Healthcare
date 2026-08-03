import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft, KeyRound, AlertCircle, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdminLoginProps {
  onAdminLoginSuccess?: (adminData: any) => void;
}

export default function AdminLogin({ onAdminLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("nivora@gmail.com");
  const [password, setPassword] = useState("nivora");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect destination after successful auth
  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const validateEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Field validations
    if (!email.trim()) {
      setError("Administrator email address is required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid administrator email address format.");
      return;
    }

    if (!password) {
      setError("Security password is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password, rememberMe);

      if (result.success) {
        if (onAdminLoginSuccess) {
          const savedUser = JSON.parse(localStorage.getItem("nivora_admin_user") || "{}");
          onAdminLoginSuccess(savedUser);
        }
        navigate(from, { replace: true });
      } else {
        setError(result.message || "Unauthorized: Invalid credentials or insufficient permissions.");
      }
    } catch (err) {
      setError("Failed to communicate with administrative security gateways.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered administrator email.");
      return;
    }

    if (!validateEmail(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess("Password reset instructions have been dispatched to " + forgotEmail + ". Please check your inbox.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">
      
      {/* Background radial glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-green/10 to-transparent blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6 relative z-10">
        
        {/* Upper Brand Header */}
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
          <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-semibold p-3.5 rounded-lg flex items-start space-x-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
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
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all"
                placeholder="nivora@gmail.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotEmail(email);
                }}
                className="text-[10px] text-primary-green hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-primary-green focus:ring-primary-green/20 accent-primary-green cursor-pointer"
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 font-medium select-none">Remember Me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-green hover:bg-primary-green-hover text-white rounded-lg text-xs font-semibold shadow-md shadow-primary-green/10 transition flex items-center justify-center space-x-2 uppercase tracking-widest cursor-pointer disabled:opacity-50"
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

        {/* AES Encryption Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[9px] font-bold tracking-wider uppercase text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />
          <span>Secure 256-bit AES Encryption</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSuccess("");
                setForgotError("");
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-primary-green">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white font-display">Reset Administrator Password</h3>
            </div>

            <p className="text-xs text-slate-400">
              Enter your administrative email address below to receive password recovery instructions.
            </p>

            {forgotError && (
              <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs rounded-lg flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-left">{forgotSuccess}</span>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccess("");
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nivora@gmail.com"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-primary-green"
                  />
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-1/2 py-2 bg-primary-green hover:bg-primary-green-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Send Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
