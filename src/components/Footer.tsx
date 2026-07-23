import React from "react";
import { Link } from "react-router-dom";
import { Shield, CreditCard, Heart, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-primary-green text-white pt-16 pb-8 px-4 md:px-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 bg-white rounded-lg transform rotate-6"></div>
              <div className="relative text-primary-green font-black text-xs">N</div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-md tracking-tight text-white leading-none">NIVORA</span>
              <span className="text-[9px] font-bold text-amber-200 tracking-widest leading-none mt-0.5">HEALTHCARE</span>
            </div>
          </div>
          <p className="text-xs text-green-50 leading-relaxed max-w-sm">
            Nivora Healthcare (formerly Elara Health Systems) is a DHA-licensed, clinical excellence-driven home health provider. We deliver lab tests, doctors, and physiotherapy directly to your living space.
          </p>
          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-amber-200 font-semibold bg-green-900/40 px-2.5 py-1 rounded-full border border-green-800">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>DHA Licensed</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-green-100 font-semibold bg-green-900/40 px-2.5 py-1 rounded-full border border-green-800">
              <Award className="w-3.5 h-3.5 text-green-300" />
              <span>ISO 9001:2015</span>
            </div>
          </div>
        </div>

        {/* Column 2: Clinical Quality */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest font-display">Clinical Quality</h4>
          <ul className="space-y-2.5 text-xs text-green-50">
            <li><a href="#standards" className="hover:underline hover:text-white transition">Clinical Standards</a></li>
            <li><a href="#advisory" className="hover:underline hover:text-white transition">Medical Advisory Board</a></li>
            <li><a href="#care" className="hover:underline hover:text-white transition">Quality Care Audits</a></li>
            <li><a href="#lab" className="hover:underline hover:text-white transition">Partner Laboratories</a></li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest font-display">Services</h4>
          <ul className="space-y-2.5 text-xs text-green-50">
            <li><Link to="/doctor-visit" className="hover:underline hover:text-white transition">Doctor Visit at Home</Link></li>
            <li><Link to="/physiotherapy" className="hover:underline hover:text-white transition">At-Home Physiotherapy</Link></li>
            <li><Link to="/lab-tests" className="hover:underline hover:text-white transition">Home Blood Collection</Link></li>
            <li><Link to="/health-care" className="hover:underline hover:text-white transition">Long Term Care Plan</Link></li>
          </ul>
        </div>

        {/* Column 4: Corporate */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest font-display">Corporate</h4>
          <ul className="space-y-2.5 text-xs text-green-50">
            <li><a href="#about" className="hover:underline hover:text-white transition">About Our Group</a></li>
            <li><a href="#careers" className="hover:underline hover:text-white transition">Careers at Nivora</a></li>
            <li><a href="#terms" className="hover:underline hover:text-white transition">Terms of Service</a></li>
            <li><a href="#privacy" className="hover:underline hover:text-white transition">Privacy & Patient Charter</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom section with payment options & copyright */}
      <div className="max-w-7xl mx-auto border-t border-green-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-green-100 gap-4">
        <div>
          <span>© 2026 Nivora Healthcare Ltd. All rights reserved. Registered under DHA Hospital License #LH-2104.</span>
        </div>
        
        {/* Payment Methods */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-green-50 select-none">
            <CreditCard className="w-4 h-4 text-green-300" />
            <span className="font-semibold text-[10px]">VISA ACCEPTABLE</span>
          </div>
          <div className="h-4 w-[1px] bg-green-800"></div>
          <span className="font-semibold text-[10px]">MASTERCARD</span>
          <div className="h-4 w-[1px] bg-green-800"></div>
          <span className="font-semibold text-[10px]">AMEX</span>
          <div className="h-4 w-[1px] bg-green-800"></div>
          <span className="font-semibold text-[10px]">APPLE PAY</span>
        </div>
      </div>
    </footer>
  );
}
