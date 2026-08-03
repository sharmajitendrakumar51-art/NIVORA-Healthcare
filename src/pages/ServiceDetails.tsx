import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Calendar, 
  User, 
  Star, 
  Plus, 
  Minus, 
  CheckCircle, 
  Sparkles,
  PhoneCall
} from "lucide-react";
import { Service, CartItem } from "../types";
import { getImageUrl } from "../utils/translations";

interface ServiceDetailsProps {
  services: Service[];
  onAddToCart: (service: Service, qty: number) => void;
  onBookImmediate: (service: Service) => void;
}

export default function ServiceDetails({ services, onAddToCart, onBookImmediate }: ServiceDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-gray-400 mt-2">The requested clinical service does not exist.</p>
        <Link to="/" className="inline-block mt-4 bg-primary-blue text-white px-5 py-2 rounded-lg text-xs font-bold">
          Return Home
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(service, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountAmount = service.mrpPrice - service.sellingPrice;
  const discountPct = Math.round((discountAmount / service.mrpPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Back link */}
      <Link 
        to="/" 
        className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Healthcare Services</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2/3 Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
            {/* Image */}
            <div className="relative h-64 md:h-96 bg-gray-100">
              <img 
                src={getImageUrl(service.image)} 
                alt={service.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=500&q=80";
                }}
              />
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Save {discountPct}%
              </span>
              <span className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-lg">
                Category: {service.categoryName}
              </span>
            </div>

            {/* Title Block */}
            <div className="p-6 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-green uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  Verified DHA Care
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{service.rating} ({service.reviewsCount} verified reviews)</span>
                </div>
              </div>

              <h1 className="text-xl md:text-3xl font-black text-slate-850 font-display">
                {service.name}
              </h1>

              <p className="text-sm text-gray-500 leading-relaxed">
                {service.shortDescription}
              </p>
            </div>

            {/* Description Details */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Service Overview</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {service.longDescription}
                </p>
              </div>

              {/* What is included */}
              <div className="space-y-3.5 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">What is included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Licensed clinical practitioner home visit",
                    "Complete physiological screening & physical assessment",
                    "Sterilized diagnostics drawer / rehab toolkit setup",
                    "Dynamic vital recording (cardio, glucose, temperature)",
                    "Comprehensive report generation uploaded directly to portal",
                    "Free medical advisory phone consult post-visit"
                  ].map((inc, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary-green shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vital logs */}
              {service.vitalTrackingRequired && service.vitalTrackingRequired.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Biomarker / Vital Tracking Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.vitalTrackingRequired.map((v) => (
                      <span key={v} className="bg-gray-50 border border-gray-200 text-xs font-bold text-slate-700 px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                        <span>{v} Tracking</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient reviews */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Patient Experience Ratings</h3>
            <div className="border border-gray-100 rounded-xl p-4 flex items-center space-x-6 bg-gray-50/50">
              <div className="text-center shrink-0 border-r border-gray-100 pr-6">
                <p className="text-3xl font-black text-slate-850 font-display">4.9★</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1">Global Rating</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                "Outstanding home experience. The clinician was incredibly gentle, clean, and knowledgeable. We received our results within a few hours." — Verified Patient, Jumeirah Dubai.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1/3 Booking card Column */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-md sticky top-28">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display mb-4">Pricing & Checkout</h3>
            
            {/* Price section */}
            <div className="flex items-baseline space-x-3 pb-4 border-b border-gray-100">
              <span className="text-2xl font-black text-slate-850">AED {service.sellingPrice}</span>
              <span className="text-sm text-gray-400 line-through">AED {service.mrpPrice}</span>
              <span className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                Save AED {discountAmount}
              </span>
            </div>

            {/* Quick metrics */}
            <div className="py-4 space-y-3 text-xs text-gray-600 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Gender Focus</span>
                <span className="font-bold text-slate-800">{service.genderFocus}</span>
              </div>
              <div className="flex justify-between">
                <span>Age Group Compatibility</span>
                <span className="font-bold text-slate-800">{service.ageGroup}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Service Duration</span>
                <span className="font-bold text-slate-800">45 - 60 Mins</span>
              </div>
            </div>

            {/* Quantity Controller */}
            <div className="py-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Number of Members</span>
              <div className="flex items-center space-x-3.5 border border-gray-200 rounded-lg p-1 bg-gray-50">
                <button 
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-md bg-white border border-gray-150 text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-800 w-4 text-center select-none">{qty}</span>
                <button 
                  onClick={() => setQty(prev => prev + 1)}
                  className="p-1 rounded-md bg-white border border-gray-150 text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="py-2 flex items-baseline justify-between font-bold text-slate-850 mb-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">Estimated Total:</span>
              <span className="text-lg font-black">AED {service.sellingPrice * qty}</span>
            </div>

            {/* Checkout Action triggers */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-xl text-xs font-bold border transition duration-150 uppercase tracking-wider flex items-center justify-center space-x-2 ${
                  added 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : "bg-white border-primary-blue text-primary-blue hover:bg-primary-blue/5"
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${added ? "inline" : "hidden"}`} />
                <span>{added ? "Added to Cart!" : "Add to Cart Pack"}</span>
              </button>

              <button
                onClick={() => onBookImmediate(service)}
                className="w-full py-3 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition uppercase tracking-wider"
              >
                Book Immediate Slot
              </button>
            </div>

            {/* Expert Support Call */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400">Unsure which clinical panel fits your conditions?</p>
              <a 
                href="tel:+971501234567"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-green hover:underline mt-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Talk to our Medical Expert</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
