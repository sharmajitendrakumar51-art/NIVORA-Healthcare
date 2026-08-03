import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Dumbbell,
  Dribbble, 
  Settings, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle,
  FileSpreadsheet,
  Tablet,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Service, Category } from "../types";
import { Language, getTranslation, getImageUrl } from "../utils/translations";

interface HomeProps {
  categories: Category[];
  services: Service[];
  onBookImmediate: (service: Service) => void;
  searchQuery: string;
  language?: Language;
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2000&q=80",
    title: "Licensed Doctor Home Visit & Consultation",
    category: "Doctor Home Visit"
  },
  {
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=2000&q=80",
    title: "At-Home Diagnostics & Vital Biomarker Tests",
    category: "Diagnostics & Labs"
  },
  {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2000&q=80",
    title: "Personalized At-Home Physiotherapy & Pain Release",
    category: "Physiotherapy at Home"
  },
  {
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=2000&q=80",
    title: "DHA Certified Skilled Nursing Care",
    category: "Nursing Care at Home"
  },
  {
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=2000&q=80",
    title: "Compassionate Senior & Elderly Care Services",
    category: "Elderly Care"
  },
  {
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2000&q=80",
    title: "Sports Injury Rehabilitation & Specialized Recovery",
    category: "Sports Injuries"
  },
  {
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=2000&q=80",
    title: "Happy Family Receiving Home Healthcare Services",
    category: "Family Home Healthcare"
  },
  {
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1cdb?auto=format&fit=crop&w=2000&q=80",
    title: "Advanced Medical Equipment & Certified Healthcare Professionals",
    category: "Modern Medical Equipment"
  }
];

export default function Home({ 
  categories, 
  services, 
  onBookImmediate, 
  searchQuery,
  language = "en"
}: HomeProps) {
  const navigate = useNavigate();

  // Categories mapping to custom beautiful icons
  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "physiotherapy": return <Activity className="w-5 h-5 text-amber-600" />;
      case "diagnostics": return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case "nurse care": return <Heart className="w-5 h-5 text-emerald-600" />;
      case "elder care": return <Heart className="w-5 h-5 text-rose-600" />;
      case "dental care": return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case "cardiology": return <Heart className="w-5 h-5 text-red-600" />;
      case "mental health": 
      case "mental wellness": return <Sparkles className="w-5 h-5 text-purple-600" />;
      case "exercise & fitness":
      case "exercise & gym":
      case "fitness & wellness": return <Dumbbell className="w-5 h-5 text-indigo-600" />;
      case "sports injury": return <Flame className="w-5 h-5 text-orange-600" />;
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

  const getServiceCategory = (s: Service) => {
    if (s.categoryId) {
      const matchById = categories.find(c => c.id === s.categoryId);
      if (matchById) return matchById;
    }
    if (s.categoryName) {
      const matchByName = categories.find(c => c.name.trim().toLowerCase() === s.categoryName.trim().toLowerCase());
      if (matchByName) return matchByName;
    }
    return null;
  };

  const PREFERRED_HOMEPAGE_ORDER = [
    "cardiology",
    "physiotherapy",
    "exercise & fitness",
    "exercise & gym",
    "fitness & wellness",
    "nurse care",
    "elder care",
    "mental health",
    "mental wellness",
    "diagnostics"
  ];

  const sortedCategoriesForHomepage = [...categories].sort((a, b) => {
    const nameA = a.name.trim().toLowerCase();
    const nameB = b.name.trim().toLowerCase();
    let idxA = PREFERRED_HOMEPAGE_ORDER.indexOf(nameA);
    let idxB = PREFERRED_HOMEPAGE_ORDER.indexOf(nameB);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  // Render a section for each category
  const renderCategorySection = (category: Category) => {
    const categoryServices = filteredServices.filter(s => {
      const resolvedCat = getServiceCategory(s);
      return resolvedCat ? resolvedCat.id === category.id : s.categoryId === category.id;
    }).slice(0, 4);
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
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {getServiceCategory(srv)?.name || srv.categoryName}
                  </h3>
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
      {/* 1. HERO BANNER WITH PREMIUM SWIPER CAROUSEL */}
      <section className="relative bg-slate-950 text-white py-8 sm:py-10 md:py-12 lg:py-14 min-h-[460px] sm:min-h-[500px] md:min-h-[540px] lg:min-h-[580px] flex items-center overflow-hidden group">
        {/* Background Swiper Carousel Slider */}
        <div className="absolute inset-0 z-0">
          <Swiper
            modules={[Autoplay, EffectFade, Navigation, Pagination, Keyboard]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1200}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            loop={true}
            keyboard={{ enabled: true }}
            navigation={{
              prevEl: ".hero-swiper-prev",
              nextEl: ".hero-swiper-next"
            }}
            pagination={{
              el: ".hero-swiper-pagination",
              clickable: true
            }}
            className="w-full h-full hero-swiper"
          >
            {heroSlides.map((slide, index) => (
              <SwiperSlide key={index} className="relative w-full h-full overflow-hidden">
                <img
                  src={slide.image}
                  alt=""
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    // Fallback to first high-res doctor visit photo if any photo fails to load
                    (e.currentTarget as HTMLImageElement).src = heroSlides[0].image;
                  }}
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle dark gradient overlay to ensure text readability while keeping images bright & visible */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-slate-950/15 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Swiper Custom Navigation Buttons */}
        <button 
          className="hero-swiper-prev absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/60 hover:bg-emerald-800/90 text-white border border-white/20 hover:border-emerald-400 flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button 
          className="hero-swiper-next absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/60 hover:bg-emerald-800/90 text-white border border-white/20 hover:border-emerald-400 flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Swiper Custom Pagination Dots */}
        <div className="hero-swiper-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center space-x-1" />

        {/* Abstract design nodes imitating Elara branding */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary-green/15 rounded-full blur-3xl z-1 pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-blue/15 rounded-full blur-2xl z-1 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center w-full my-auto">
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
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary-green/5 transition overflow-hidden">
                {cat.image && (cat.image.startsWith("http") || cat.image.startsWith("/uploads") || cat.image.startsWith("data:")) ? (
                  <img 
                    src={getImageUrl(cat.image)} 
                    alt={cat.name} 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                ) : (
                  getCategoryIcon(cat.name)
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-primary-green transition">
                {cat.name}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">At home slots</p>
            </div>
          ))}
        </div>
      </section>

      {sortedCategoriesForHomepage.map(category => renderCategorySection(category))}

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
