import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, MapPin, ChevronDown, LogOut, FileText, ClipboardList, Activity, Calendar } from "lucide-react";
import { CartItem, Category } from "../types";
import { Language, City, languages, cities, getTranslation } from "../utils/translations";

interface HeaderProps {
  cart: CartItem[];
  user: any | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  city: City;
  setCity: (city: City) => void;
  categories?: Category[];
}

export default function Header({ 
  cart, 
  user, 
  onLogout, 
  onSearch, 
  language, 
  setLanguage, 
  city, 
  setCity,
  categories = []
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [othersDropdownOpen, setOthersDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    navigate("/");
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: getTranslation(language, "doctorVisit"), path: "/doctor-visit" },
    { label: getTranslation(language, "physiotherapy"), path: "/physiotherapy" },
    { label: getTranslation(language, "ivTherapy"), path: "/iv-therapy" },
    { label: getTranslation(language, "labTests"), path: "/lab-tests" },
    { label: getTranslation(language, "healthcare"), path: "/health-care" }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];
  const currentCityObj = cities.find(c => c.code === city) || cities[0];

  return (
    <header className="w-full bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
      {/* Top Special Offer & Utility Bar */}
      <div className="w-full bg-amber-100 text-amber-900 px-4 md:px-12 py-1 text-xs flex flex-col sm:flex-row items-center justify-between font-medium border-b border-amber-200/50">
        <div className="flex items-center space-x-1.5">
          <span className="bg-primary-green text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            {getTranslation(language, "promoLabel")}
          </span>
          <span className="text-[11px] sm:text-xs truncate">{getTranslation(language, "promoBanner")}</span>
        </div>
        <div className="flex items-center space-x-5 mt-0.5 sm:mt-0 relative">
          
          {/* Language Dropdown Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCityDropdownOpen(false);
              }}
              className="flex items-center space-x-1 cursor-pointer hover:text-amber-800 py-0.5 transition-colors focus:outline-none"
              id="language-select-btn"
            >
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>
            {langDropdownOpen && (
              <div 
                className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                id="language-dropdown-menu"
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center space-x-2 transition-colors ${
                      language === l.code 
                        ? "bg-slate-50 text-primary-blue font-bold" 
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span className="flex-grow">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Dropdown Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setCityDropdownOpen(!cityDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="flex items-center space-x-1 cursor-pointer hover:text-amber-800 py-0.5 transition-colors focus:outline-none"
              id="city-select-btn"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-green" />
              <span>{currentCityObj.name}</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>
            {cityDropdownOpen && (
              <div 
                className="absolute right-0 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                id="city-dropdown-menu"
              >
                <div className="px-3.5 py-1 border-b border-slate-100 mb-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Emirate</p>
                </div>
                {cities.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCity(c.code);
                      setCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex flex-col transition-colors ${
                      city === c.code 
                        ? "bg-slate-50 text-primary-blue font-bold" 
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-slate-800">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mid Navigation & Logo/Search bar */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-4 md:gap-6">
        {/* Logo - Nivora Healthcare stylized */}
        <Link to="/" className="flex items-center shrink-0 group py-0.5">
          <img src="/logo.png" alt="Nivora Healthcare" className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
        </Link>

        {/* Search Bar - Horizontally centered with optimal width */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={getTranslation(language, "searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 rounded-full pl-5 pr-11 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-all shadow-xs"
            />
            <button type="submit" className="absolute right-3.5 text-slate-400 hover:text-primary-blue transition-colors p-1" title="Search">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </form>

        {/* Action Widgets */}
        <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
          {/* My Appointments Direct Quick Link */}
          <Link 
            to="/orders" 
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-primary-blue text-xs font-bold transition-all border border-slate-200 shadow-2xs"
            title="My Appointments & Orders"
          >
            <Calendar className="w-3.5 h-3.5 text-primary-green" />
            <span className="hidden sm:inline">My Appointments</span>
          </Link>

          {/* Main User Cart */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors group">
            <ShoppingCart className="w-5 h-5 group-hover:text-primary-blue" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-primary-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Admin Quick Switch */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-1.5 p-1 pr-2.5 rounded-full border border-slate-200 hover:border-primary-blue bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-primary-green text-white font-bold text-xs flex items-center justify-center">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </div>
                <span className="text-xs font-semibold hidden sm:inline-block max-w-[80px] truncate">
                  {user.firstName || user.email || "User"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown list */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/orders" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary-blue transition-colors font-bold"
                  >
                    <Calendar className="w-4 h-4 text-primary-green" />
                    <span>My Appointments & Orders</span>
                  </Link>

                  <a 
                    href="#health-records" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary-blue transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{getTranslation(language, "myHealthRecords")}</span>
                  </a>

                  <a 
                    href="#care-plan" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary-blue transition-colors"
                  >
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span>{getTranslation(language, "carePlan")}</span>
                  </a>

                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left flex items-center space-x-3 px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-slate-50 mt-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>{getTranslation(language, "logout")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-primary-blue hover:bg-primary-blue/5 hover:border-primary-blue transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>{getTranslation(language, "signIn")}</span>
            </Link>
          )}

        </div>
      </div>

      {/* Main Categories Navigation Bar */}
      <div className="w-full bg-white border-t border-slate-100 py-0.5 overflow-x-auto scrollbar-none">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center md:space-x-8 space-x-5 min-w-max">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`text-[13px] font-bold tracking-tight py-2 px-1 relative transition-colors ${
                  isActive 
                    ? "text-primary-blue" 
                    : "text-slate-600 hover:text-primary-blue"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue rounded-full animate-in zoom-in-50 duration-200" />
                )}
              </Link>
            );
          })}

          {/* Dynamic "Others" dropdown */}
          <div className="relative">
            <button
              onClick={() => setOthersDropdownOpen(!othersDropdownOpen)}
              className="text-[13px] font-bold tracking-tight py-2 px-1 relative text-slate-600 hover:text-primary-blue flex items-center space-x-1 cursor-pointer focus:outline-none"
            >
              <span>{getTranslation(language, "others")}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {othersDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {categories.length === 0 ? (
                  <div className="px-4 py-1.5 text-xs text-slate-400">No other categories</div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setOthersDropdownOpen(false);
                        if (cat.name.toLowerCase() === "physiotherapy") {
                          navigate("/physiotherapy", { state: { categoryId: cat.id } });
                        } else if (cat.name.toLowerCase() === "diagnostics") {
                          navigate("/lab-tests", { state: { categoryId: cat.id } });
                        } else if (cat.name.toLowerCase() === "nurse care") {
                          navigate("/nurse-care", { state: { categoryId: cat.id } });
                        } else {
                          navigate("/doctor-visit", { state: { categoryId: cat.id } });
                        }
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary-blue transition-colors truncate block"
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
