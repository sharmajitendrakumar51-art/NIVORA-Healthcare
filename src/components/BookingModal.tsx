import React, { useState } from "react";
import { X, Calendar, Clock, UserPlus } from "lucide-react";
import { PatientDetails, Service } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onConfirm: (bookingDetails: {
    date: string;
    time: string;
    slot: "Morning" | "Afternoon" | "Evening";
    bookingForSomeoneElse: boolean;
    patientDetails: PatientDetails;
    notes: string;
  }) => void;
}

export default function BookingModal({ isOpen, onClose, service, onConfirm }: BookingModalProps) {
  const [date, setDate] = useState("2026-07-20");
  const [time, setTime] = useState("10:00 AM");
  const [slot, setSlot] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 000-0000",
    dob: "1995-08-25",
    relation: "Self",
    gender: "Female"
  });

  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      date,
      time,
      slot,
      bookingForSomeoneElse: forSomeoneElse,
      patientDetails,
      notes
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-primary-blue font-display">Schedule Your Appointment</h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold text-primary-green">
              {service.categoryName} • {service.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
                        dob: "",
                        relation: "Parent",
                        gender: "Male"
                      });
                    } else {
                      setPatientDetails({
                        firstName: "Jane",
                        lastName: "Doe",
                        email: "jane.doe@example.com",
                        phone: "+1 (555) 000-0000",
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

          <p className="text-[11px] text-gray-500 italic text-center">
            Some description about the clinical process and preparation requirements for {service.name}.
          </p>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Book Your Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
