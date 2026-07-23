import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Dribbble, 
  Settings, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle,
  FileSpreadsheet,
  Tablet,
  ChevronRight,
  MapPin,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Category } from "../types";
import { Language, getTranslation, getImageUrl } from "../utils/translations";

interface HomeProps {
  categories: Category[];
  services: Service[];
  onBookImmediate: (service: Service) => void;
  searchQuery: string;
  language?: Language;
}

const heroImages = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=80", // Expert Doctor Home Visit
  "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=1600&q=80", // At-Home Diagnostics and Labs
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80", // At-Home Physiotherapy / Rehabilitation
];

export default function Home({ 
  categories, 
  services, 
  onBookImmediate, 
  searchQuery,
  language = "en"
}: HomeProps) {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Auto-play interval for background image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Categories mapping to custom beautiful icons
  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "physiotherapy": return <Activity className="w-5 h-5 text-amber-600" />;
      case "diagnostics": return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case "nurse care": return <Heart className="w-5 h-5 text-emerald-600" />;
      case "elder care": return <Heart className="w-5 h-5 text-rose-600" />;
      case "dental care": return <Stethoscope className="w-5 h-5 text-teal-600" />;
      default: return <Sparkles className="w-5 h-5 text-primary-green" />;
    }
  };

  // Filter services by popular groupings
  const filteredServices = searchQuery
    ? services.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  // Render a section for each category
  const renderCategorySection = (category: Category) => {
    const categoryServices = filteredServices.filter(s => s.categoryId === category.id).slice(0, 4);
    if (categoryServices.length === 0) return null;

    return (
      <section key={category.id} className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-850 font-display">{category.name}</h2>
            <p className="text-xs text-gray-400 mt-1">{category.description}</p>
          </div>
          <Link to={`/doctor-visit`} onClick={() => { /* You might need a way to pass category */ }} className="text-xs font-bold text-primary-blue hover:underline">
            View All {category.name}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categoryServices.map((srv) => (
            <div 
              key={srv.id}
              className="bg-white rounded-xl border border-gray-150 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col"
            >
              <div className="relative h-40 bg-gray-100 shrink-0">
                <img 
                  src={getImageUrl(srv.image)} 
                  alt={srv.name} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Save {Math.round(((srv.mrpPrice - srv.sellingPrice) / srv.mrpPrice) * 100)}%
                </span>
                {srv.rating >= 4.9 && (
                  <span className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <span>★</span>
                    <span>{srv.rating}</span>
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{srv.categoryName}</h3>
                  <Link to={`/services/${srv.id}`} className="text-sm font-extrabold text-slate-850 hover:text-primary-blue transition line-clamp-1 mt-1 block">
                    {srv.name}
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1.5">
                    {srv.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 line-through">AED {srv.mrpPrice}</span>
                    <span className="text-sm font-black text-slate-850">AED {srv.sellingPrice}</span>
                  </div>
                  <button 
                    onClick={() => onBookImmediate(srv)}
                    className="bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const partners = [
    { name: "Aditya Birla", desc: "Health Insurance" },
    { name: "ICICI Lombard", desc: "General Insurance" },
    { name: "Star Health", desc: "Assure & Care" },
    { name: "HDFC Ergo", desc: "General Cover" },
    { name: "Niva Bupa", desc: "Heartbeat Health" },
    { name: "Manipal Cigna", desc: "Choice Wellness" },
    { name: "Reliance", desc: "General Trust" }
  ];

  return (
    <div className="w-full pb-16 space-y-12">
      {/* 1. HERO BANNER */}
      <section className="relative bg-slate-950 text-white py-16 md:py-24 overflow-hidden">
        {/* Background Image Slideshow with smooth cross-fading */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.28, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={heroImages[currentBgIndex]}
                alt="Nivora Healthcare Experience"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Deep professional overlays to guarantee text legibility & elegant look */}
          <div className="absolute inset-0 bg-slate-950/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>

        {/* Abstract design nodes imitating Elara branding */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary-green/15 rounded-full blur-3xl z-1"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-blue/15 rounded-full blur-2xl z-1"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-amber-300 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getTranslation(language, "heroBadge")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display leading-tight tracking-tight">
              {getTranslation(language, "heroTitle")}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg">
              {getTranslation(language, "heroSub")}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link 
                to="/lab-tests" 
                className="bg-primary-blue hover:bg-primary-blue-hover text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg transition-all text-center flex items-center justify-center space-x-2"
              >
                <span>{getTranslation(language, "bookNow")}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <a 
                href="#all-services" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-6 py-3 rounded-lg text-sm font-bold text-center transition"
              >
                {getTranslation(language, "viewAllServices")}
              </a>
            </div>

            {/* Quick trust counts */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-xl md:text-2xl font-bold font-display text-amber-400">20k+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Patients Treated</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold font-display text-amber-400">120+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Licensed Doctors</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold font-display text-amber-400">4.9★</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">User Experience</p>
              </div>
            </div>
          </div>

          {/* Dynamic visual representation of services screen */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center space-x-1.5 text-[10px] text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>Active Clinicians On Duty</span>
              </div>
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">Available Specialities</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-primary-green transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold">PT</div>
                    <div>
                      <h4 className="text-xs font-bold text-white">At-Home Physiotherapy</h4>
                      <p className="text-[10px] text-slate-400">Pain release & Rehab</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-primary-green transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 font-bold">LB</div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Diagnostics & Labs</h4>
                      <p className="text-[10px] text-slate-400">85+ Vital Biomarkers</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-primary-green transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-950 flex items-center justify-center text-teal-400 font-bold">DR</div>
                    <div>
                      <h4 className="text-xs font-bold text-white">General Practitioners</h4>
                      <p className="text-[10px] text-slate-400">Physician Home Visit</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Patient Trust Box */}
              <div className="mt-4 bg-slate-800 p-2.5 rounded-lg border border-slate-750 flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" className="w-6 h-6 rounded-full border border-slate-800 object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" className="w-6 h-6 rounded-full border border-slate-800 object-cover" />
                </div>
                <div className="text-[10px] text-slate-300">
                  {getTranslation(language, "trustedByFamilies")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS (IF QUERY ACTIVE) */}
      {searchQuery && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-primary-green font-bold uppercase tracking-wider mb-1">
                <span>🔎</span>
                <span>Active Search Filter</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-850 font-display">Search Results for "{searchQuery}"</h2>
              <p className="text-xs text-gray-400 mt-1">Found {filteredServices.length} healthcare match(es)</p>
            </div>
            <button 
              onClick={() => navigate("/doctor-visit")}
              className="text-xs font-bold text-primary-blue hover:underline"
            >
              Explore Full Catalog
            </button>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-3xl">🔍</span>
              <h3 className="text-sm font-bold text-slate-850">No Medical Services Match</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No services matched "{searchQuery}". Try searching for common care terms such as "blood", "physio", "dressing", or "thyroid".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredServices.map((srv) => (
                <div 
                  key={srv.id}
                  className="bg-white rounded-xl border border-gray-150 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="relative h-40 bg-gray-100 shrink-0">
                    <img 
                      src={getImageUrl(srv.image)} 
                      alt={srv.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Save {Math.round(((srv.mrpPrice - srv.sellingPrice) / srv.mrpPrice) * 100)}%
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{srv.categoryName}</h3>
                      <Link to={`/services/${srv.id}`} className="text-sm font-extrabold text-slate-850 hover:text-primary-blue transition line-clamp-1 mt-1 block">
                        {srv.name}
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1.5">
                        {srv.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 line-through">AED {srv.mrpPrice}</span>
                        <span className="text-sm font-black text-slate-850">AED {srv.sellingPrice}</span>
                      </div>
                      <button 
                        onClick={() => onBookImmediate(srv)}
                        className="bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8" id="all-services">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-850 font-display">Popular Categories</h2>
            <p className="text-xs text-gray-400 mt-1">Directly launch diagnostics or rehabilitative clinical care</p>
          </div>
          <Link to="/lab-tests" className="text-xs font-bold text-primary-blue hover:underline flex items-center space-x-1">
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => {
                if (cat.name.toLowerCase() === "physiotherapy") navigate("/physiotherapy", { state: { categoryId: cat.id } });
                else if (cat.name.toLowerCase() === "diagnostics") navigate("/lab-tests", { state: { categoryId: cat.id } });
                else if (cat.name.toLowerCase() === "nurse care") navigate("/nurse-care", { state: { categoryId: cat.id } });
                else navigate("/doctor-visit", { state: { categoryId: cat.id } });
              }}
              className="bg-white p-4 rounded-xl border border-gray-150 hover:border-primary-green hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary-green/5 transition">
                {getCategoryIcon(cat.name)}
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-primary-green transition">
                {cat.name}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">At home slots</p>
            </div>
          ))}
          
          {/* Missing dynamic categories from screenshot */}
          <div 
            onClick={() => navigate("/physiotherapy")}
            className="bg-white p-4 rounded-xl border border-gray-150 hover:border-primary-green hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary-green/5 transition">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-primary-green transition">
              Exercise & Gym
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">Personal trainers</p>
          </div>
        </div>
      </section>

      {categories.map(category => renderCategorySection(category))}

      {/* 5. HOW IT WORKS SECTION (Simulated Screen) */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl font-bold text-slate-850 font-display">How Nivora Home Care Works</h2>
            <p className="text-xs text-gray-500">
              A frictionless process coordinating licensed clinical experts, secure test reporting, and ongoing wellness audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 relative overflow-hidden">
              <span className="absolute -top-4 -right-4 font-display font-black text-6xl text-gray-50 select-none">1</span>
              <h3 className="text-sm font-bold text-slate-850 relative z-10">Select & Book Service</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Choose from over 85 blood panels, physicians, or rehabilitative sessions, select your home location, and set your preferred timing slot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 relative overflow-hidden">
              <span className="absolute -top-4 -right-4 font-display font-black text-6xl text-gray-50 select-none">2</span>
              <h3 className="text-sm font-bold text-slate-850 relative z-10">Clinician Arrives</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                A DHA-licensed, background-verified clinician arrives equipped with sterilized sample drawers or specific kinetics equipment within 60 mins.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 relative overflow-hidden">
              <span className="absolute -top-4 -right-4 font-display font-black text-6xl text-gray-50 select-none">3</span>
              <h3 className="text-sm font-bold text-slate-850 relative z-10">Secure Portal Delivery</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                View real-time sample processing stages, and download your clinical summaries or biometric charts from your secure, HIPAA-compliant patient dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR ESTEEMED PARTNERS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-200 pt-12">
        <div className="text-center mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Our Esteemed Insurance & Hospital Partners</h3>
          <p className="text-[11px] text-gray-400 mt-1">Seamless direct billing and claims settlement</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {partners.map((pt, i) => (
            <div 
              key={i}
              className="bg-white px-4 py-5.5 rounded-xl border border-gray-150 text-center flex flex-col justify-center items-center shadow-xs select-none hover:border-amber-300 transition"
            >
              <span className="text-xs font-extrabold text-slate-800 tracking-tight font-display">
                {pt.name}
              </span>
              <span className="text-[8px] font-bold text-primary-green uppercase tracking-wider mt-1">
                {pt.desc}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
