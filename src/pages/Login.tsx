import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Shield, Sparkles } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("jane.doe@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Unable to connect to the healthcare server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Head branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center font-black text-white text-base">
              N
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-850 font-display">Welcome Back to Nivora</h2>
          <p className="text-xs text-gray-400">Access your digital diagnostics, care plans, and health files</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3.5 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <Link to="/reset-password" className="text-xs text-primary-blue hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
          </button>
        </form>

        {/* Quick Social Bypass */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or Bypass With</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => {
              onLoginSuccess({ id: "USR-002", firstName: "Google", lastName: "Guest", email: "google.guest@example.com", phone: "+971 50 111 2222" });
              navigate("/");
            }}
            className="py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>Google Accounts</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              onLoginSuccess({ id: "USR-003", firstName: "Facebook", lastName: "Guest", email: "facebook.guest@example.com", phone: "+971 50 222 3333" });
              navigate("/");
            }}
            className="py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>Facebook Portal</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          New to Nivora Healthcare?{" "}
          <Link to="/register" className="text-primary-green hover:underline font-bold">
            Create an Account
          </Link>
        </p>

        {/* Security disclaimer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-[10px] text-gray-400">
          <Shield className="w-3.5 h-3.5 text-primary-green" />
          <span>Secure AES 256-bit encrypted medical portal</span>
        </div>
      </div>
    </div>
  );
}
