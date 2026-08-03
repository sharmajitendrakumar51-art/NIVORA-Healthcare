import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, UserPlus, Check, CreditCard, Banknote, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PatientDetails, Service } from "../types";
import { sendAppointmentConfirmationEmail } from "../services/emailService";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onConfirm: (bookingDetails: any) => void;
}

export default function BookingModal({ isOpen, onClose, service, onConfirm }: BookingModalProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00 AM");
  const [slot, setSlot] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails>(() => {
    const saved = localStorage.getItem("nivora_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.email || u.firstName)) {
          return {
            firstName: u.firstName || "Jane",
            lastName: u.lastName || "Doe",
            email: u.email || "jane.doe@example.com",
            phone: u.phone || "+971 50 123 4567",
            dob: u.dob || "1995-08-25",
            relation: "Self",
            gender: u.gender || "Female"
          };
        }
      } catch (e) {}
    }
    return {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "+971 50 123 4567",
      dob: "1995-08-25",
      relation: "Self",
      gender: "Female"
    };
  });

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "Cash on Appointment">("Razorpay");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("nivora_user");
      if (saved) {
        try {
          const u = JSON.parse(saved);
          if (u) {
            setPatientDetails(prev => ({
              ...prev,
              firstName: u.firstName || prev.firstName,
              lastName: u.lastName || prev.lastName,
              email: u.email || prev.email,
              phone: u.phone || prev.phone
            }));
          }
        } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!patientDetails.firstName.trim() || !patientDetails.lastName.trim()) {
      setErrorMsg("Please enter first and last name.");
      return false;
    }
    if (!patientDetails.email.trim() || !patientDetails.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!patientDetails.phone.trim() || patientDetails.phone.length < 7) {
      setErrorMsg("Please enter a valid phone number.");
      return false;
    }
    if (!date) {
      setErrorMsg("Please select an appointment date.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const safeFetchJson = async (url: string, options: RequestInit) => {
    let res: Response;
    const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {})
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      res = await fetch(url, { ...options, headers });
    } catch (netErr: any) {
      throw new Error("Network connection error. Please check your server connection.");
    }

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Invalid JSON response received from server.");
      }
    } else {
      const text = await res.text();
      console.warn(`Non-JSON response from ${url}:`, text);
      throw new Error(
        res.status === 404
          ? "Server endpoint not found (404). Please try again."
          : `Server error (${res.status}). Please try again.`
      );
    }

    if (!res.ok) {
      const errorMessage = data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMessage);
    }

    return { res, data };
  };

  const handleCashBooking = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const orderPayload = {
        patientName: `${patientDetails.firstName.trim()} ${patientDetails.lastName.trim()}`,
        email: patientDetails.email.trim(),
        phone: patientDetails.phone.trim(),
        dateOfBirth: patientDetails.dob,
        gender: patientDetails.gender,
        relation: patientDetails.relation,
        appointmentDate: date,
        appointmentTime: time,
        timeSlot: slot,
        notes: notes,
        services: [{
          serviceId: service.id,
          serviceName: service.name,
          serviceImage: service.image,
          price: service.sellingPrice,
          quantity: 1,
          subtotal: service.sellingPrice
        }],
        totalAmount: service.sellingPrice,
        paymentMethod: "Cash on Appointment",
        paymentStatus: "Pending",
        orderStatus: "Booked"
      };

      const { res, data: createdOrder } = await safeFetchJson("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok || !createdOrder) {
        throw new Error("Server failed to process order creation.");
      }

      // Automatically send confirmation email via EmailJS
      const doctorName = (service as any).doctorName || (service as any).doctor || service.name || "Nivora Healthcare Specialist";
      sendAppointmentConfirmationEmail({
        patientName: `${patientDetails.firstName.trim()} ${patientDetails.lastName.trim()}`,
        patientEmail: patientDetails.email.trim(),
        doctorName: doctorName,
        appointmentDate: date,
        appointmentTime: time,
        totalAmount: service.sellingPrice,
        paymentMethod: "Cash on Appointment",
        notes: notes
      }).catch((emailErr) => {
        console.error("EmailJS sending error (cash booking):", emailErr);
      });

      setToastMsg("Appointment Booked Successfully");

      setTimeout(() => {
        onConfirm(createdOrder);
        onClose();
        navigate("/order-success", { state: { order: createdOrder } });
      }, 800);
    } catch (err: any) {
      console.error("Cash booking error:", err);
      setErrorMsg(err.message || "Failed to complete appointment booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayBooking = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Call Backend to create Razorpay Order
      const { res, data: orderData } = await safeFetchJson("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: service.sellingPrice,
          currency: "INR",
          notes: {
            serviceName: service.name,
            patientName: `${patientDetails.firstName} ${patientDetails.lastName}`
          }
        })
      });

      if (!res.ok || !orderData || !orderData.success) {
        throw new Error(orderData?.message || "Failed to initialize payment gateway.");
      }

      const { orderId, currency, amount, keyId } = orderData;

      // 2. Configure Razorpay Popup options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "NIVORA Healthcare",
        description: `Appointment for ${service.name}`,
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=120&q=80",
        order_id: orderId,
        prefill: {
          name: `${patientDetails.firstName} ${patientDetails.lastName}`,
          email: patientDetails.email,
          contact: patientDetails.phone
        },
        theme: {
          color: "#0284c7"
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const { res: verifyRes, data: verifyData } = await safeFetchJson("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (!verifyData || !verifyData.success) {
              setErrorMsg("Payment Failed. Signature verification mismatch.");
              setLoading(false);
              return;
            }

            // Create Paid Order in MongoDB
            const { res: finalOrderRes, data: createdOrder } = await safeFetchJson("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                patientName: `${patientDetails.firstName.trim()} ${patientDetails.lastName.trim()}`,
                email: patientDetails.email.trim(),
                phone: patientDetails.phone.trim(),
                dateOfBirth: patientDetails.dob,
                gender: patientDetails.gender,
                relation: patientDetails.relation,
                appointmentDate: date,
                appointmentTime: time,
                timeSlot: slot,
                notes: notes,
                services: [{
                  serviceId: service.id,
                  serviceName: service.name,
                  serviceImage: service.image,
                  price: service.sellingPrice,
                  quantity: 1,
                  subtotal: service.sellingPrice
                }],
                totalAmount: service.sellingPrice,
                paymentMethod: "Razorpay",
                paymentStatus: "Paid",
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || "sig_verified",
                paymentDate: new Date().toISOString(),
                orderStatus: "Confirmed"
              })
            });

            if (!finalOrderRes.ok || !createdOrder) {
              throw new Error("Failed to record completed order.");
            }

            // Automatically send confirmation email via EmailJS
            const doctorName = (service as any).doctorName || (service as any).doctor || service.name || "Nivora Healthcare Specialist";
            sendAppointmentConfirmationEmail({
              patientName: `${patientDetails.firstName.trim()} ${patientDetails.lastName.trim()}`,
              patientEmail: patientDetails.email.trim(),
              doctorName: doctorName,
              appointmentDate: date,
              appointmentTime: time,
              totalAmount: service.sellingPrice,
              paymentMethod: "Razorpay",
              notes: notes
            }).catch((emailErr) => {
              console.error("EmailJS sending error (Razorpay booking):", emailErr);
            });

            setToastMsg("Appointment Booked Successfully");

            setTimeout(() => {
              onConfirm(createdOrder);
              onClose();
              navigate("/order-success", { state: { order: createdOrder } });
            }, 800);
          } catch (err: any) {
            console.error("Error creating paid order:", err);
            setErrorMsg(err.message || "Payment Failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setErrorMsg("Payment process cancelled by user.");
            setLoading(false);
          }
        }
      };

      // 3. Launch Razorpay Popup
      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          console.error("Razorpay payment failed:", response.error);
          setErrorMsg(`Payment Failed: ${response.error?.description || "Transaction declined"}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback simulate checkout popup if script blocked
        console.warn("Razorpay script not found, proceeding with simulated gateway checkout.");
        setTimeout(async () => {
          const simulatedResponse = {
            razorpay_order_id: orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: "simulated_signature"
          };
          options.handler(simulatedResponse);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      setErrorMsg(err.message || "Payment Failed.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === "Cash on Appointment") {
      handleCashBooking();
    } else {
      handleRazorpayBooking();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 text-center flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-200">
            <Check className="w-5 h-5" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-primary-blue font-display">Schedule Your Appointment</h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold text-primary-green">
              {service.categoryName} • {service.name} (₹{service.sellingPrice})
            </p>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Appointment Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Time Slot</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  value={slot}
                  onChange={(e) => {
                    const newSlot = e.target.value as "Morning" | "Afternoon" | "Evening";
                    setSlot(newSlot);
                    if (newSlot === "Morning") setTime("10:00 AM");
                    else if (newSlot === "Afternoon") setTime("02:00 PM");
                    else setTime("06:00 PM");
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue bg-white appearance-none"
                >
                  <option value="Morning">Morning (8am - 12pm)</option>
                  <option value="Afternoon">Afternoon (12pm - 5pm)</option>
                  <option value="Evening">Evening (5pm - 9pm)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue bg-white"
              >
                {slot === "Morning" && (
                  <>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                  </>
                )}
                {slot === "Afternoon" && (
                  <>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </>
                )}
                {slot === "Evening" && (
                  <>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forSomeoneElse}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForSomeoneElse(checked);
                    if (checked) {
                      setPatientDetails({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        dob: "1980-01-01",
                        relation: "Parent",
                        gender: "Male"
                      });
                    } else {
                      setPatientDetails({
                        firstName: "Jane",
                        lastName: "Doe",
                        email: "jane.doe@example.com",
                        phone: "+971 50 123 4567",
                        dob: "1995-08-25",
                        relation: "Self",
                        gender: "Female"
                      });
                    }
                  }}
                  className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                />
                <span className="text-gray-700 font-medium text-xs">Booking for someone else?</span>
              </label>
            </div>
          </div>

          {/* Member Details */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <UserPlus className="w-4 h-4 text-primary-green" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Patient / Member Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={patientDetails.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={patientDetails.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={patientDetails.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={patientDetails.phone}
                  onChange={handleInputChange}
                  placeholder="+971 XX XXX XXXX"
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={patientDetails.dob}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                <select
                  name="relation"
                  value={patientDetails.relation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                >
                  <option value="Self">Self</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select
                  name="gender"
                  value={patientDetails.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Notes (e.g. allergies, symptoms, entry gate code)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide details of any dynamic clinical concerns..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 min-h-[70px] bg-white resize-none"
            />
          </div>

          {/* Payment Method Section */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Payment Method</span>
              <span className="text-xs text-primary-blue font-semibold">Total: ₹{service.sellingPrice}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* CARD 1: Razorpay */}
              <div
                onClick={() => setPaymentMethod("Razorpay")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                  paymentMethod === "Razorpay"
                    ? "border-emerald-500 bg-emerald-50/70 text-slate-900 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                }`}
              >
                {paymentMethod === "Razorpay" && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">💳 Razorpay</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pr-3">
                  Pay securely using <span className="font-semibold text-slate-800">UPI, Credit Card, Debit Card, Wallet, Net Banking</span>.
                </p>
              </div>

              {/* CARD 2: Cash on Appointment */}
              <div
                onClick={() => setPaymentMethod("Cash on Appointment")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                  paymentMethod === "Cash on Appointment"
                    ? "border-emerald-500 bg-emerald-50/70 text-slate-900 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                }`}
              >
                {paymentMethod === "Cash on Appointment" && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">💵 Cash on Appointment</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pr-3">
                  Pay after your appointment.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 italic text-center">
            Preparation and clinical process details will be sent to {patientDetails.email || "your email"}.
          </p>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Book Your Appointment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

