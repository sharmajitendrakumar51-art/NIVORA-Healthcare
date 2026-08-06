import React from "react";
import { ShieldCheck } from "lucide-react";

export interface InsurancePartner {
  name: string;
  desc: string;
  badge?: string;
}

export const defaultPartners: InsurancePartner[] = [
  { name: "Aditya Birla", desc: "HEALTH INSURANCE" },
  { name: "ICICI Lombard", desc: "GENERAL INSURANCE" },
  { name: "Star Health", desc: "ASSURE & CARE" },
  { name: "HDFC Ergo", desc: "GENERAL COVER" },
  { name: "Niva Bupa", desc: "HEARTBEAT HEALTH" },
  { name: "Manipal Cigna", desc: "CHOICE WELLNESS" },
  { name: "Reliance", desc: "GENERAL TRUST" }
];

interface InsuranceMarqueeProps {
  title?: string;
  subtitle?: string;
  partners?: InsurancePartner[];
}

export default function InsuranceMarquee({
  title = "Our Esteemed Insurance & Hospital Partners",
  subtitle = "Seamless direct billing & cash-less claims settlement across Dubai & UAE",
  partners = defaultPartners
}: InsuranceMarqueeProps) {
  // Duplicate array multiple times for continuous infinite loop without blank gaps
  const marqueeList = [...partners, ...partners, ...partners, ...partners];

  return (
    <div className="w-full py-8 overflow-hidden select-none">
      {(title || subtitle) && (
        <div className="text-center mb-6 px-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DHA & UAE Health Insurance Approved</span>
          </div>
          {title && (
            <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest font-display">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Marquee Wrapper with side gradient masks */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />

        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

        {/* Animated Track */}
        <div className="flex animate-infinite-marquee space-x-4 sm:space-x-6 items-center px-2">
          {marqueeList.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="w-44 sm:w-52 h-28 sm:h-32 bg-white rounded-2xl border border-slate-700/60 p-4 flex flex-col justify-center items-center text-center shadow-2xs hover:shadow-md hover:border-emerald-600 hover:-translate-y-1 transition-all duration-300 flex-shrink-0 cursor-pointer group relative overflow-hidden"
            >
              {/* Top/Corner Subtle Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/0 group-hover:via-emerald-500/80 to-transparent transition-all duration-500" />

              <span className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight font-display leading-tight group-hover:text-emerald-950 transition-colors">
                {partner.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-2 group-hover:text-emerald-600 transition-colors">
                {partner.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
