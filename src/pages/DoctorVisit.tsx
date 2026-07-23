import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Filter, Sparkles, CheckCircle, ChevronDown, RefreshCw } from "lucide-react";
import { Service, Category } from "../types";
import { getImageUrl } from "../utils/translations";

interface DoctorVisitProps {
  categories: Category[];
  services: Service[];
  onBookImmediate: (service: Service) => void;
  defaultCategoryName?: string;
}

export default function DoctorVisit({ categories, services, onBookImmediate, defaultCategoryName }: DoctorVisitProps) {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAge, setSelectedAge] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(600);

  // Sync category state based on navigation tabs
  useEffect(() => {
    if (location.state && (location.state as any).categoryId) {
      setSelectedCategory((location.state as any).categoryId);
      return;
    }

    if (defaultCategoryName) {
      const matched = categories.find(c => c.name.toLowerCase() === defaultCategoryName.toLowerCase());
      if (matched) {
        setSelectedCategory(matched.id);
        return;
      }
    }

    if (location.pathname.includes("lab-tests")) {
      const c = categories.find(cat => cat.name.toLowerCase() === "diagnostics");
      if (c) setSelectedCategory(c.id);
    } else if (location.pathname.includes("physiotherapy")) {
      const c = categories.find(cat => cat.name.toLowerCase() === "physiotherapy");
      if (c) setSelectedCategory(c.id);
    } else if (location.pathname.includes("doctor-visit")) {
      const c = categories.find(cat => cat.name.toLowerCase() === "dental care" || cat.name.toLowerCase() === "nurse care");
      if (c) setSelectedCategory(c.id);
    } else {
      setSelectedCategory("all");
    }
  }, [location.pathname, location.state, defaultCategoryName, categories]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedAge("all");
    setSelectedGender("all");
    setPriceRange(600);
    setSearchQuery("");
  };

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === "all" || srv.categoryId === selectedCategory;
    const matchesAge = selectedAge === "all" || srv.ageGroup === selectedAge;
    const matchesGender = selectedGender === "all" || srv.genderFocus === selectedGender || srv.genderFocus === "All Genders";
    const matchesPrice = srv.sellingPrice <= priceRange;
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesAge && matchesGender && matchesPrice && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850 font-display">Book Home Healthcare Services</h2>
          <p className="text-xs text-gray-400 mt-1">Showing {filteredServices.length} vetted, DHA-licensed diagnostic and rehab services</p>
        </div>
        
        {/* Local Search Input */}
        <div className="relative max-w-md w-full md:w-80">
          <input
            type="text"
            placeholder="Search within these services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Filter Sidebar */}
        <aside className="w-full md:w-64 bg-white border border-gray-150 rounded-2xl p-5 space-y-6 shrink-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2 font-bold text-slate-850">
              <Filter className="w-4 h-4 text-primary-green" />
              <span className="text-sm">Filter Options</span>
            </div>
            <button 
              onClick={resetFilters}
              className="text-[10px] font-bold text-red-500 hover:underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Category</label>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-slate-800">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "all"}
                  onChange={() => setSelectedCategory("all")}
                  className="text-primary-green focus:ring-primary-green"
                />
                <span>All Specialties</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-slate-800">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                    className="text-primary-green focus:ring-primary-green"
                  />
                  <span className="truncate">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Age Focus</label>
            <div className="space-y-1.5">
              {[
                { id: "all", label: "All Ages" },
                { id: "Pediatric", label: "Pediatric / Infants" },
                { id: "18+", label: "Adults (18+)" },
                { id: "Seniors", label: "Seniors / Elder" }
              ].map((age) => (
                <label key={age.id} className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-slate-800">
                  <input
                    type="radio"
                    name="age"
                    checked={selectedAge === age.id}
                    onChange={() => setSelectedAge(age.id)}
                    className="text-primary-green focus:ring-primary-green"
                  />
                  <span>{age.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Focus */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Gender Focus</label>
            <div className="space-y-1.5">
              {[
                { id: "all", label: "All Genders" },
                { id: "Male", label: "Male Focus Only" },
                { id: "Female", label: "Female Focus Only" }
              ].map((g) => (
                <label key={g.id} className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-slate-800">
                  <input
                    type="radio"
                    name="gender"
                    checked={selectedGender === g.id}
                    onChange={() => setSelectedGender(g.id)}
                    className="text-primary-green focus:ring-primary-green"
                  />
                  <span>{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              <span>Max Budget</span>
              <span className="text-primary-blue font-black font-mono">AED {priceRange}</span>
            </div>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
              <span>AED 30</span>
              <span>AED 600</span>
            </div>
          </div>

          {/* Safety disclaimer */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl">
            <h4 className="text-[11px] font-bold text-primary-blue uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Insurance Claims</span>
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Diagnostic reports contain direct insurance billing codes to simplify claim reimbursements.
            </p>
          </div>
        </aside>

        {/* Right Side: Services Grid */}
        <main className="flex-1 w-full">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                🔎
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-850">No Services Found</h3>
                <p className="text-xs text-gray-400 mt-1">Adjust your filters or query to explore other healthcare options.</p>
              </div>
              <button 
                onClick={resetFilters}
                className="bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((srv) => {
                const discountPct = Math.round(((srv.mrpPrice - srv.sellingPrice) / srv.mrpPrice) * 100);
                return (
                  <div 
                    key={srv.id}
                    className="bg-white rounded-xl border border-gray-150 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative h-44 bg-gray-100">
                        <img 
                          src={getImageUrl(srv.image)} 
                          alt={srv.name} 
                          className="w-full h-full object-cover"
                        />
                        {discountPct > 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Save {discountPct}%
                          </span>
                        )}
                        <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          {srv.ageGroup}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            {srv.categoryName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {srv.genderFocus}
                          </span>
                        </div>

                        <Link 
                          to={`/services/${srv.id}`} 
                          className="text-sm font-extrabold text-slate-850 hover:text-primary-blue transition line-clamp-1 block mt-1"
                        >
                          {srv.name}
                        </Link>
                        
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {srv.shortDescription}
                        </p>

                        {/* Vital signs required */}
                        {srv.vitalTrackingRequired && srv.vitalTrackingRequired.length > 0 && (
                          <div className="pt-1.5 flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] text-gray-400 font-bold mr-1">Vitals Logged:</span>
                            {srv.vitalTrackingRequired.map((v) => (
                              <span key={v} className="text-[9px] font-semibold text-slate-600 bg-gray-100 border border-gray-200 px-1 py-0.2 rounded">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing / Booking Footer */}
                    <div className="p-4 pt-0">
                      <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 line-through">AED {srv.mrpPrice}</span>
                          <span className="text-sm font-black text-slate-850">AED {srv.sellingPrice}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/services/${srv.id}`}
                            className="p-2 border border-gray-200 text-gray-500 hover:text-primary-blue hover:border-primary-blue rounded-lg text-xs font-semibold transition"
                          >
                            Details
                          </Link>
                          <button 
                            onClick={() => onBookImmediate(srv)}
                            className="bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
