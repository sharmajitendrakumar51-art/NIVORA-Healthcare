import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, CreditCard, ChevronRight, ShoppingCart, ShoppingBag, ShieldCheck } from "lucide-react";
import { CartItem } from "../types";
import { getImageUrl } from "../utils/translations";

interface CartProps {
  cart: CartItem[];
  onUpdateQty: (serviceId: string, delta: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onProceedToCheckout: () => void;
}

export default function Cart({ cart, onUpdateQty, onRemoveItem, onProceedToCheckout }: CartProps) {
  const subtotal = cart.reduce((acc, item) => acc + (item.service.sellingPrice * item.quantity), 0);
  const loyaltyDiscount = subtotal * 0.10; // 10% discount
  const grandTotal = subtotal - loyaltyDiscount;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mx-auto border border-gray-100">
          <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-850 font-display">Your Order Review is Empty</h2>
          <p className="text-xs text-gray-400 mt-1">Explore our clinical at-home diagnostic panels, nurse services, or physiotherapy sessions.</p>
        </div>
        <Link 
          to="/lab-tests" 
          className="inline-flex bg-primary-blue hover:bg-primary-blue-hover text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition"
        >
          Explore Healthcare Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-850 font-display">Review Your Order</h1>
        <p className="text-xs text-gray-400 mt-1">Verify your clinical members and preferred at-home checkups before booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical Packages Requested</span>
              <span className="text-xs font-bold text-primary-green">{cart.length} Packages</span>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.service.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Service info */}
                  <div className="flex items-start space-x-4">
                    <img 
                      src={getImageUrl(item.service.image)} 
                      alt={item.service.name} 
                      className="w-16 h-16 rounded-lg object-cover border border-gray-150 shrink-0 bg-gray-50"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-primary-green uppercase tracking-widest bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                        {item.service.categoryName}
                      </span>
                      <Link 
                        to={`/services/${item.service.id}`}
                        className="text-sm font-extrabold text-slate-850 hover:text-primary-blue transition mt-1 block"
                      >
                        {item.service.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.service.shortDescription}</p>
                    </div>
                  </div>

                  {/* Quantity & Price Panel */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 border-t border-gray-50 pt-3 sm:border-0 sm:pt-0">
                    {/* Quantity modifier */}
                    <div className="flex items-center space-x-2.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50 shrink-0">
                      <button 
                        onClick={() => onUpdateQty(item.service.id, -1)}
                        className="p-1 rounded bg-white border border-gray-150 text-gray-500 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center select-none">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.service.id, 1)}
                        className="p-1 rounded bg-white border border-gray-150 text-gray-500 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Cost */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 line-through">AED {item.service.mrpPrice * item.quantity}</p>
                      <p className="text-sm font-black text-slate-850">AED {item.service.sellingPrice * item.quantity}</p>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => onRemoveItem(item.service.id)}
                      className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick clinical recommendation disclaimer */}
          <div className="flex items-start space-x-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Medical Safety Notice:</span> Fasting requirements apply to certain blood panel diagnostics. Please review individual requirements. Your clinician will detail preparation guidelines 12 hours prior to arrival.
            </div>
          </div>
        </div>

        {/* Right Side: Price Summary Card */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display mb-4">Order Summary</h3>

            {/* Calculations */}
            <div className="space-y-3 pb-4 border-b border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-850">AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500 font-semibold bg-rose-50/50 p-2 rounded">
                <span>Loyalty Discount (-10%)</span>
                <span>-AED {loyaltyDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>At-home Nurse Collection</span>
                <span className="font-bold text-emerald-600 uppercase">Free Collection</span>
              </div>
            </div>

            {/* Total */}
            <div className="py-4 flex items-baseline justify-between font-bold text-slate-850">
              <span className="text-xs uppercase tracking-wider text-gray-500">Grand Total:</span>
              <span className="text-xl font-black text-primary-blue">AED {grandTotal.toFixed(2)}</span>
            </div>

            {/* Checkout Trigger */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition uppercase tracking-widest flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Accepted payment systems cards footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold text-center">Accepted Payment Options</p>
              <div className="flex justify-center items-center gap-3 text-gray-400">
                <span className="text-[9px] font-bold uppercase">VISA</span>
                <span className="text-[9px] font-bold uppercase">MASTERCARD</span>
                <span className="text-[9px] font-bold uppercase">AMEX</span>
                <span className="text-[9px] font-bold uppercase font-sans">Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
