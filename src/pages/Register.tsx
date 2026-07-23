import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Phone, User, Shield } from "lucide-react";

interface RegisterProps {
  onRegisterSuccess: (user: any) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onRegisterSuccess(data.user);
        navigate("/");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Unable to connect to the healthcare server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-150 rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Head branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center font-black text-white text-base">
              N
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-850 font-display">Create Your Health Account</h2>
          <p className="text-xs text-gray-400">Join Nivora to coordinate clinical home care seamlessly</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3.5 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="tel"
                placeholder="+971 50 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Registering..." : "Create Account"}</span>
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-green hover:underline font-bold">
            Sign In
          </Link>
        </p>

        {/* Security disclaimer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-[10px] text-gray-400">
          <Shield className="w-3.5 h-3.5 text-primary-green" />
          <span>HIPAA compliant storage of health data</span>
        </div>
      </div>
    </div>
  );
}
