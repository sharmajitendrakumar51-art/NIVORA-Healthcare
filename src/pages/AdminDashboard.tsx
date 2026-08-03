import React, { useState, useEffect, useRef } from "react";
import { 
  FolderHeart, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Download, 
  Users, 
  Calendar, 
  Coins, 
  Upload, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
  ShoppingBag,
  Search,
  Filter,
  CreditCard,
  Banknote,
  X,
  FileText,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { Category, Service, Booking, Order, CollectedCash, PatientDetails, User, Doctor } from "../types";
import { sendAppointmentCancellationEmail, sendAppointmentConfirmationEmail } from "../services/emailService";
import { getImageUrl } from "../utils/translations";
import DoctorPatientChatModal from "../components/DoctorPatientChatModal";

interface AdminDashboardProps {
  categories: Category[];
  services: Service[];
  bookings: Booking[];
  orders: Order[];
  collectedCash: CollectedCash[];
  onAddCategory: (cat: Partial<Category>) => Promise<any>;
  onAddService: (srv: Partial<Service>) => Promise<any>;
  onUpdateBookingStatus: (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => Promise<any>;
  onUpdateService: (id: string, updated: Partial<Service>) => Promise<any>;
  onUpdateCategory?: (id: string, updated: Partial<Category>) => Promise<any>;
  onDeleteCategory?: (id: string) => Promise<any>;
  onDeleteService?: (id: string) => Promise<any>;
  users: User[];
  onDeleteUser?: (id: string) => Promise<any>;
  currentTab?: string;
}

export default function AdminDashboard({
  categories,
  services,
  bookings,
  orders,
  collectedCash,
  onAddCategory,
  onAddService,
  onUpdateBookingStatus,
  onUpdateService,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteService,
  users = [],
  onDeleteUser,
  currentTab = "categories"
}: AdminDashboardProps) {
  const [successMsg, setSuccessMsg] = useState("");

  // Doctor Management State
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [practitionerSearch, setPractitionerSearch] = useState("");
  const [selectedPractitionerForModal, setSelectedPractitionerForModal] = useState<Doctor | null>(null);
  const [selectedDoctorForAssign, setSelectedDoctorForAssign] = useState<{ [appointmentId: string]: string }>({});

  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    availability: "",
    consultationMode: "",
    licenseNumber: "",
    status: "Active" as "Active" | "Inactive",
    profilePhoto: ""
  });

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await fetch("/api/doctors");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctorsList(data);
        }
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDoctorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data, name: file.name })
        });
        const data = await res.json();
        if (data.success && data.url) {
          setDoctorForm(prev => ({ ...prev, profilePhoto: data.url }));
        }
      } catch (err) {
        console.error("Doctor photo upload error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingDoctor);
      const url = isEdit ? `/api/doctors/${editingDoctor?.id}` : "/api/doctors";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm)
      });

      if (res.ok) {
        setSuccessMsg(isEdit ? "Doctor details updated successfully!" : "New Doctor registered successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
        setShowDoctorModal(false);
        setEditingDoctor(null);
        setDoctorForm({
          fullName: "",
          email: "",
          phone: "",
          specialization: "",
          qualification: "",
          experience: "",
          availability: "",
          consultationMode: "",
          licenseNumber: "",
          status: "Active",
          profilePhoto: ""
        });
        fetchDoctors();
      }
    } catch (err) {
      console.error("Failed to save doctor:", err);
    }
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      fullName: doc.fullName || "",
      email: doc.email || "",
      phone: doc.phone || "",
      specialization: doc.specialization || "",
      qualification: doc.qualification || "",
      experience: doc.experience || "",
      availability: doc.availability || "",
      consultationMode: doc.consultationMode || "In-Home Visit & Teleconsultation",
      licenseNumber: doc.licenseNumber || "",
      status: doc.status || "Active",
      profilePhoto: doc.profilePhoto || ""
    });
    setShowDoctorModal(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor record?")) return;
    try {
      const res = await fetch(`/api/doctors/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Doctor removed from directory.");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchDoctors();
      }
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };

  const handleAssignDoctor = async (appointmentId: string, docId: string) => {
    if (!docId) return;
    const doc = doctorsList.find(d => d.id === docId);
    if (!doc) return;

    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/appointments/${encodeURIComponent(appointmentId)}/assign`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          doctorId: doc.id,
          doctorName: doc.fullName,
          doctorEmail: doc.email,
          doctorPhone: doc.phone,
          doctorSpecialization: doc.specialization,
          doctorPhoto: doc.profilePhoto
        })
      });

      if (res.ok) {
        const targetOrder = adminOrdersList.find(o => o.id === appointmentId);
        if (targetOrder) {
          sendAppointmentConfirmationEmail({
            patientName: targetOrder.patientName || targetOrder.customerName || "Valued Patient",
            patientEmail: targetOrder.email || targetOrder.customerEmail || "",
            doctorName: doc.fullName,
            appointmentDate: targetOrder.appointmentDate || targetOrder.date || "Scheduled Date",
            appointmentTime: targetOrder.appointmentTime || "10:00 AM",
            totalAmount: targetOrder.totalAmount || targetOrder.total,
            paymentMethod: targetOrder.paymentMethod,
            notes: targetOrder.notes
          }).catch(err => console.warn("EmailJS notification error:", err));
        }

        setSuccessMsg(`Doctor ${doc.fullName} assigned to appointment ${appointmentId}! Status set to Confirmed & Confirmation Email dispatched.`);
        setTimeout(() => setSuccessMsg(""), 4500);
        fetchAdminOrders();
      }
    } catch (err) {
      console.error("Error assigning doctor:", err);
    }
  };

  // Orders Management State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | "Razorpay" | "Cash on Appointment">("ALL");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [activeAdminChatOrder, setActiveAdminChatOrder] = useState<Order | null>(null);

  const [adminOrdersList, setAdminOrdersList] = useState<Order[]>(orders || []);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setAdminOrdersList(orders);
    }
  }, [orders]);

  const fetchAdminOrders = async () => {
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/orders", { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAdminOrdersList(data);
        }
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, [currentTab]);

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      const targetPaymentStatus = paymentStatus || (orderStatus === "Completed" ? "Paid" : undefined);

      // Optimistic UI state update
      setAdminOrdersList((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === orderId || (ord as any)._id === orderId
            ? {
                ...ord,
                orderStatus,
                status: orderStatus,
                ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {})
              }
            : ord
        )
      );

      if (selectedOrderDetails && (selectedOrderDetails.id === orderId || (selectedOrderDetails as any)._id === orderId)) {
        setSelectedOrderDetails((prev: any) =>
          prev
            ? {
                ...prev,
                orderStatus,
                status: orderStatus,
                ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {})
              }
            : null
        );
      }

      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const body: any = { orderStatus, status: orderStatus };
      if (targetPaymentStatus) body.paymentStatus = targetPaymentStatus;

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updated = await res.json();
        showToast(`Order status updated to ${orderStatus}`);
        if (selectedOrderDetails && (selectedOrderDetails.id === orderId || (selectedOrderDetails as any)._id === orderId)) {
          setSelectedOrderDetails(updated);
        }
        await fetchAdminOrders();

        if (orderStatus === "Cancelled") {
          const ord = updated || adminOrdersList.find(o => o.id === orderId || (o as any)._id === orderId) || selectedOrderDetails;
          if (ord) {
            const userName = ord.patientName || ord.customerName || (ord.firstName ? `${ord.firstName} ${ord.lastName}` : "Patient");
            const userEmail = ord.email || ord.customerEmail || "";
            const doctorName = ord.services?.[0]?.serviceName || ord.items?.[0]?.serviceName || ord.serviceName || "Nivora Healthcare Specialist";
            const appointmentDate = ord.appointmentDate || ord.date || "Scheduled Date";
            const appointmentTime = ord.appointmentTime || ord.time || "Scheduled Time";

            if (userEmail) {
              sendAppointmentCancellationEmail({
                userName,
                userEmail,
                doctorName,
                appointmentDate,
                appointmentTime
              }).catch((emailErr) => {
                console.error("EmailJS sending error (order cancellation):", emailErr);
              });
            }
          }
        }
      } else {
        showToast("Failed to update order status.");
        await fetchAdminOrders();
      }
    } catch (err: any) {
      showToast("Error updating order status: " + err.message);
      await fetchAdminOrders();
    }
  };

  // Deletion confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "category" | "service" | "user";
    id: string;
    name: string;
  } | null>(null);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Editing state
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingSrv, setEditingSrv] = useState<Service | null>(null);

  // File uploading state & refs
  const [isUploadingCat, setIsUploadingCat] = useState(false);
  const [isUploadingSrv, setIsUploadingSrv] = useState(false);
  const catFileRef = useRef<HTMLInputElement>(null);
  const srvFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: file.name,
              data: base64Data
            })
          });
          const json = await res.json();
          if (json.success) {
            resolve(json.url);
          } else {
            reject(new Error(json.message || "Upload failed"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCatDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsUploadingCat(true);
      try {
        const url = await handleFileUpload(file);
        setCatImage(url);
        showToast("Category image uploaded successfully!");
      } catch (err: any) {
        showToast("Error uploading image: " + err.message);
      } finally {
        setIsUploadingCat(false);
      }
    }
  };

  const handleCatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingCat(true);
      try {
        const url = await handleFileUpload(file);
        setCatImage(url);
        showToast("Category image uploaded successfully!");
      } catch (err: any) {
        showToast("Error uploading image: " + err.message);
      } finally {
        setIsUploadingCat(false);
      }
    }
  };

  const handleSrvDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsUploadingSrv(true);
      try {
        const url = await handleFileUpload(file);
        setSrvImage(url);
        showToast("Service image uploaded successfully!");
      } catch (err: any) {
        showToast("Error uploading image: " + err.message);
      } finally {
        setIsUploadingSrv(false);
      }
    }
  };

  const handleSrvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingSrv(true);
      try {
        const url = await handleFileUpload(file);
        setSrvImage(url);
        showToast("Service image uploaded successfully!");
      } catch (err: any) {
        showToast("Error uploading image: " + err.message);
      } finally {
        setIsUploadingSrv(false);
      }
    }
  };

  // Service Form State
  const [srvName, setSrvName] = useState("");
  const [srvCatId, setSrvCatId] = useState("");
  const [srvShortDesc, setSrvShortDesc] = useState("");
  const [srvLongDesc, setSrvLongDesc] = useState("");
  const [srvImage, setSrvImage] = useState("");
  const [srvMrp, setSrvMrp] = useState(100);
  const [srvSelling, setSrvSelling] = useState(80);
  const [srvAge, setSrvAge] = useState<"Pediatric" | "18+" | "Seniors" | "All Ages">("All Ages");
  const [srvGender, setSrvGender] = useState<"All Genders" | "Male" | "Female">("All Genders");
  const [srvVitals, setSrvVitals] = useState<string[]>([]);

  // Pre-seed some default states
  useEffect(() => {
    if (categories.length > 0 && !srvCatId) {
      setSrvCatId(categories[0].id);
    }
  }, [categories]);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catDesc) return;

    if (editingCat) {
      if (onUpdateCategory) {
        await onUpdateCategory(editingCat.id, {
          name: catName,
          image: catImage || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=300&q=80",
          description: catDesc
        });
        showToast(`Category "${catName}" updated successfully.`);
      }
      setEditingCat(null);
    } else {
      await onAddCategory({
        name: catName,
        image: catImage || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=300&q=80",
        description: catDesc
      });
      showToast(`Category "${catName}" created & published successfully.`);
    }

    setCatName("");
    setCatImage("");
    setCatDesc("");
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvCatId) return;

    const matchedCat = categories.find(c => c.id === srvCatId);
    const categoryName = matchedCat ? matchedCat.name : "General";

    if (editingSrv) {
      await onUpdateService(editingSrv.id, {
        name: srvName,
        categoryId: srvCatId,
        categoryName,
        shortDescription: srvShortDesc,
        longDescription: srvLongDesc,
        image: srvImage || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=500&q=80",
        mrpPrice: srvMrp,
        sellingPrice: srvSelling,
        ageGroup: srvAge,
        genderFocus: srvGender,
        vitalTrackingRequired: srvVitals
      });
      showToast(`Clinical Service "${srvName}" updated successfully.`);
      setEditingSrv(null);
    } else {
      await onAddService({
        name: srvName,
        categoryId: srvCatId,
        categoryName,
        shortDescription: srvShortDesc,
        longDescription: srvLongDesc,
        image: srvImage || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=500&q=80",
        mrpPrice: srvMrp,
        sellingPrice: srvSelling,
        ageGroup: srvAge,
        genderFocus: srvGender,
        vitalTrackingRequired: srvVitals
      });
      showToast(`Clinical Service "${srvName}" created and added to roster.`);
    }

    // Reset Form
    setSrvName("");
    setSrvShortDesc("");
    setSrvLongDesc("");
    setSrvImage("");
    setSrvMrp(100);
    setSrvSelling(80);
    setSrvVitals([]);
  };

  const handleVitalToggle = (vital: string) => {
    if (srvVitals.includes(vital)) {
      setSrvVitals(srvVitals.filter(v => v !== vital));
    } else {
      setSrvVitals([...srvVitals, vital]);
    }
  };

  const toggleServiceStatus = async (id: string, currentStatus: "Active" | "Inactive") => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await onUpdateService(id, { status: nextStatus });
    showToast(`Service status updated to ${nextStatus}.`);
  };

  // Calculations for Earnings Report
  const totalBookingsValue = bookings.reduce((sum, b) => sum + b.price, 0);
  const completedBookingsValue = bookings.filter(b => b.status === "Completed").reduce((sum, b) => sum + b.price, 0);
  const totalCashCollected = collectedCash.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex-1 bg-[#F8F9FB] min-h-screen">
      
      {/* Side Alerts Banner */}
      {successMsg && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 border-l-4 border-emerald-500 text-white p-4 rounded-lg shadow-2xl flex items-center space-x-3.5 animate-in fade-in slide-in-from-right-10 duration-200">
          <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 leading-none">Admin Action Logged</p>
            <p className="text-xs text-slate-300 mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Main Admin Pages Tabs Switch */}
      <div className="p-8">
        
        {/* TAB 1: CATEGORIES CREATE & LIST */}
        {currentTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Create Category Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <FolderHeart className="w-5 h-5 text-primary-green" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">
                    {editingCat ? "Category Edit" : "Category Create"}
                  </h3>
                </div>
                {editingCat && (
                  <button 
                    onClick={() => {
                      setEditingCat(null);
                      setCatName("");
                      setCatImage("");
                      setCatDesc("");
                    }}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category Name</label>
                  <input 
                    type="text" 
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Cardiopulmonary Screening"
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Image / File Upload URL</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    />
                    <input 
                      type="file" 
                      ref={catFileRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleCatFileChange} 
                    />
                    <div 
                      onClick={() => catFileRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleCatDrop}
                      className="mt-2 border border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center transition min-h-[110px] relative overflow-hidden"
                    >
                      {isUploadingCat ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-5 h-5 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[10px] text-gray-400 font-bold">UPLOADING...</span>
                        </div>
                      ) : catImage ? (
                        <div className="absolute inset-0 flex items-center justify-center group bg-slate-900/40">
                          <img src={getImageUrl(catImage)} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-white">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-bold">REPLACE IMAGE</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-300 mb-1" />
                          <span className="text-[10px] text-gray-400 font-bold">CLICK OR DRAG IMAGE HERE</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Supports PNG, JPG, GIF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Provide diagnostic indicators and purpose..."
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 min-h-[90px] bg-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-primary-green hover:bg-primary-green-hover text-white text-xs font-bold rounded-lg shadow-sm uppercase tracking-wider transition cursor-pointer"
                >
                  {editingCat ? "Update Category" : "Save & Publish Category"}
                </button>
              </form>
            </div>

            {/* List Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">Active Healthcare Categories</span>
                <span className="text-xs text-primary-green font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {categories.length} Registered
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-4">Category ID</th>
                      <th className="p-4">Image</th>
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-700">{cat.id}</td>
                        <td className="p-4">
                          <img src={getImageUrl(cat.image)} alt={cat.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                        </td>
                        <td className="p-4 font-bold text-slate-850">{cat.name}</td>
                        <td className="p-4 text-gray-400 max-w-xs truncate">{cat.description}</td>
                        <td className="p-4 text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <button 
                              onClick={() => {
                                setEditingCat(cat);
                                setCatName(cat.name);
                                setCatImage(cat.image);
                                setCatDesc(cat.description);
                              }}
                              className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition"
                              title="Edit Category"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteCategory && (
                              <button 
                                onClick={() => {
                                  setDeleteConfirm({
                                    type: "category",
                                    id: cat.id,
                                    name: cat.name
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES CREATE & LIST */}
        {currentTab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Create Service Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-primary-green" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">
                    {editingSrv ? "Service Edit" : "Service Create"}
                  </h3>
                </div>
                {editingSrv && (
                  <button 
                    onClick={() => {
                      setEditingSrv(null);
                      setSrvName("");
                      setSrvShortDesc("");
                      setSrvLongDesc("");
                      setSrvImage("");
                      setSrvMrp(100);
                      setSrvSelling(80);
                      setSrvVitals([]);
                    }}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateService} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Service Name</label>
                    <input 
                      type="text" 
                      value={srvName}
                      onChange={(e) => setSrvName(e.target.value)}
                      placeholder="e.g. Thyroid Diagnostic Profiling"
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category Name</label>
                    <select
                      value={srvCatId}
                      onChange={(e) => setSrvCatId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Image / File Upload URL</label>
                    <input 
                      type="text" 
                      value={srvImage}
                      onChange={(e) => setSrvImage(e.target.value)}
                      placeholder="https://unsplash..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    />
                    <input 
                      type="file" 
                      ref={srvFileRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleSrvFileChange} 
                    />
                    <div 
                      onClick={() => srvFileRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={srvDrop => handleSrvDrop(srvDrop)}
                      className="mt-2 border border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center transition min-h-[90px] relative overflow-hidden"
                    >
                      {isUploadingSrv ? (
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className="w-4 h-4 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[9px] text-gray-400 font-bold">UPLOADING...</span>
                        </div>
                      ) : srvImage ? (
                        <div className="absolute inset-0 flex items-center justify-center group bg-slate-900/40">
                          <img src={getImageUrl(srvImage)} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-white">
                            <Upload className="w-4 h-4 mb-0.5" />
                            <span className="text-[8px] font-bold">REPLACE IMAGE</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-300 mb-0.5" />
                          <span className="text-[9px] text-gray-400 font-bold">CLICK OR DRAG IMAGE HERE</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Short Description</label>
                  <input 
                    type="text" 
                    value={srvShortDesc}
                    onChange={(e) => setSrvShortDesc(e.target.value)}
                    placeholder="Summary shown in list cards..."
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Long Description</label>
                  <textarea 
                    value={srvLongDesc}
                    onChange={(e) => setSrvLongDesc(e.target.value)}
                    placeholder="Complete medical advisory instructions..."
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 min-h-[70px] bg-white resize-none"
                  />
                </div>

                {/* Filters metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Age Group</label>
                    <select
                      value={srvAge}
                      onChange={(e) => setSrvAge(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    >
                      <option value="All Ages">All Ages</option>
                      <option value="Pediatric">Pediatric</option>
                      <option value="18+">18+ Adults</option>
                      <option value="Seniors">Seniors</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gender Focus</label>
                    <select
                      value={srvGender}
                      onChange={(e) => setSrvGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    >
                      <option value="All Genders">All Genders</option>
                      <option value="Male">Male Focus</option>
                      <option value="Female">Female Focus</option>
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">MRP Price (AED)</label>
                    <input 
                      type="number" 
                      value={srvMrp}
                      onChange={(e) => setSrvMrp(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Selling Price (AED)</label>
                    <input 
                      type="number" 
                      value={srvSelling}
                      onChange={(e) => setSrvSelling(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-white"
                    />
                  </div>
                </div>

                {/* Vital tracking */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Vital Tracking Required</label>
                  <div className="flex flex-wrap gap-2">
                    {["BP", "Pulse", "Glucose", "Weight"].map((v) => {
                      const active = srvVitals.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleVitalToggle(v)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                            active 
                              ? "bg-primary-green/10 border-primary-green text-primary-green" 
                              : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {v} Log
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-primary-green hover:bg-primary-green-hover text-white text-xs font-bold rounded-lg shadow-sm uppercase tracking-wider transition cursor-pointer"
                >
                  {editingSrv ? "Update Service" : "Save & Publish Clinical Service"}
                </button>
              </form>
            </div>

            {/* List Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">Active Clinical Services</span>
                <span className="text-xs text-primary-green font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {services.length} Published
                </span>
              </div>

              <div className="overflow-x-auto animate-in fade-in duration-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-4">Service ID</th>
                      <th className="p-4">Image</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">MRP (AED)</th>
                      <th className="p-4">Selling (AED)</th>
                      <th className="p-4">Age Focus</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Toggle</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-mono font-semibold text-slate-600">{srv.id}</td>
                        <td className="p-4">
                          <img 
                            src={getImageUrl(srv.image || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=120&q=80")} 
                            alt={srv.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-850">{srv.name}</td>
                        <td className="p-4 text-gray-500">
                          {categories.find(c => c.id === srv.categoryId)?.name || srv.categoryName || "General"}
                        </td>
                        <td className="p-4 text-gray-400 font-mono">AED {srv.mrpPrice}</td>
                        <td className="p-4 font-bold font-mono text-slate-800">AED {srv.sellingPrice}</td>
                        <td className="p-4 text-slate-500">{srv.ageGroup}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            srv.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            {srv.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleServiceStatus(srv.id, srv.status)}
                            className="text-gray-400 hover:text-primary-blue transition cursor-pointer"
                          >
                            {srv.status === "Active" ? (
                              <ToggleRight className="w-6 h-6 text-primary-green" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <button 
                              onClick={() => {
                                setEditingSrv(srv);
                                setSrvName(srv.name);
                                setSrvCatId(srv.categoryId);
                                setSrvShortDesc(srv.shortDescription);
                                setSrvLongDesc(srv.longDescription || "");
                                setSrvImage(srv.image || "");
                                setSrvMrp(srv.mrpPrice);
                                setSrvSelling(srv.sellingPrice);
                                setSrvAge(srv.ageGroup || "All Ages");
                                setSrvGender(srv.genderFocus || "All Genders");
                                setSrvVitals(srv.vitalTrackingRequired || []);
                              }}
                              className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition"
                              title="Edit Service"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteService && (
                              <button 
                                onClick={() => {
                                  setDeleteConfirm({
                                    type: "service",
                                    id: srv.id,
                                    name: srv.name
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN ROLE MANAGEMENT */}
        {currentTab === "admin-role" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Super Admin Roles</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-gray-50 px-2 py-0.5 rounded border">Security Clearance: LEVEL 5</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-250 p-4 rounded-xl flex items-center space-x-4 bg-slate-900 text-white">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                <div>
                  <h4 className="text-xs font-bold font-display">Admin User (System Default)</h4>
                  <p className="text-[10px] text-primary-green font-bold">SUPER ADMINISTRATOR</p>
                  <p className="text-[10px] text-slate-400 mt-1">admin@nivora.org</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE MANAGEMENT */}
        {currentTab === "service-management" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Service Roster Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Average Rating</span>
                <p className="text-xl font-bold font-display text-slate-850 mt-1">4.91★</p>
              </div>
              <div className="border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Services</span>
                <p className="text-xl font-bold font-display text-slate-850 mt-1">{services.length} items</p>
              </div>
              <div className="border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Interactive Vitals</span>
                <p className="text-xl font-bold font-display text-slate-850 mt-1">4 Parameters</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SERVICE ALLOCATION */}
        {currentTab === "service-allocation" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Laboratory & Clinic Allocations</h3>
            <p className="text-xs text-gray-400">Manage which certified third-party laboratory handles blood analysis draws.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Al Jumeirah Diagnostics Lab</h4>
                  <p className="text-[10px] text-gray-400 mt-1">DHA License: #D-2201 • Active partner</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100 rounded">DHA APPROVED</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REGISTRATION USERS */}
        {currentTab === "users" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Registered Patients & Clients</h3>
              <span className="px-2.5 py-1 bg-primary-blue/10 text-primary-blue text-[10px] font-bold rounded-lg border border-primary-blue/20">
                Total Users: {users.length}
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                  No registered users found in the system.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Patient ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Registered Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{u.id}</td>
                        <td className="p-3 font-bold text-slate-850">{u.firstName} {u.lastName}</td>
                        <td className="p-3 font-semibold text-slate-600">{u.email}</td>
                        <td className="p-3 text-gray-500">{u.phone || "N/A"}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded border border-emerald-100">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            {onDeleteUser && (
                              <button 
                                onClick={() => {
                                  setDeleteConfirm({
                                    type: "user",
                                    id: u.id,
                                    name: `${u.firstName} ${u.lastName}`
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: BOOKINGS */}
        {currentTab === "bookings" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">Patient Care Bookings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Image</th>
                    <th className="p-4">Service Name</th>
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Scheduled Slot</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Booking Status</th>
                    <th className="p-4 text-center">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((book) => {
                    const srvObj = services.find(s => s.id === book.serviceId || s.name === book.serviceName);
                    const srvImage = srvObj?.image || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=120&q=80";
                    return (
                      <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-700">{book.id}</td>
                        <td className="p-4">
                          <img 
                            src={getImageUrl(srvImage)} 
                            alt={book.serviceName} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50 animate-in fade-in duration-200" 
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-850">{book.serviceName}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{book.patientDetails.firstName} {book.patientDetails.lastName}</div>
                          <div className="text-[10px] text-gray-400">{book.patientDetails.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{book.date}</div>
                          <div className="text-[10px] text-gray-400">{book.time} ({book.slot})</div>
                        </td>
                        <td className="p-4 font-bold font-mono text-slate-800">AED {book.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            book.status === "Confirmed" 
                              ? "bg-blue-50 text-primary-blue border border-blue-100" 
                              : book.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : book.status === "Cancelled"
                              ? "bg-rose-50 text-rose-500 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            {book.status === "Pending" && (
                              <button
                                onClick={async () => {
                                  await onUpdateBookingStatus(book.id, "Confirmed");
                                  showToast(`Booking ${book.id} status set to Confirmed.`);
                                }}
                                className="px-2.5 py-1 bg-primary-blue text-white font-bold rounded hover:bg-primary-blue-hover transition text-[10px] cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            {book.status !== "Completed" && book.status !== "Cancelled" && (
                              <>
                                <button
                                  onClick={async () => {
                                    await onUpdateBookingStatus(book.id, "Completed");
                                    showToast(`Booking ${book.id} successfully completed.`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition text-[10px] cursor-pointer"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={async () => {
                                    await onUpdateBookingStatus(book.id, "Cancelled");
                                    showToast(`Booking ${book.id} cancelled.`);
                                  }}
                                  className="px-2.5 py-1 bg-rose-500 text-white font-bold rounded hover:bg-rose-600 transition text-[10px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ORDERS MANAGEMENT */}
        {currentTab === "orders" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-200 space-y-4 p-4">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider font-display flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-primary-blue" />
                  <span>Orders Management & Payment Status</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage, filter, and track all patient orders and Razorpay/Cash transactions.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ID, name, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 bg-gray-50 w-48"
                  />
                </div>

                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setOrderFilter("ALL")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                      orderFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    All Orders
                  </button>
                  <button
                    onClick={() => setOrderFilter("Razorpay")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center space-x-1 ${
                      orderFilter === "Razorpay" ? "bg-white text-blue-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    <span>Razorpay</span>
                  </button>
                  <button
                    onClick={() => setOrderFilter("Cash on Appointment")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center space-x-1 ${
                      orderFilter === "Cash on Appointment" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Banknote className="w-3 h-3 text-emerald-600" />
                    <span>Cash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              {(() => {
                const sourceOrders = adminOrdersList.length > 0 ? adminOrdersList : orders;
                const filteredOrders = sourceOrders.filter((o) => {
                  const matchFilter = orderFilter === "ALL" || o.paymentMethod === orderFilter;
                  const query = orderSearch.toLowerCase();
                  const name = (o.patientName || o.customerName || "").toLowerCase();
                  const email = (o.email || o.customerEmail || "").toLowerCase();
                  const phone = (o.phone || "").toLowerCase();
                  const id = (o.id || "").toLowerCase();
                  const serviceName = (o.services?.map((s: any) => s.serviceName).join(" ") || o.serviceName || "").toLowerCase();
                  const matchSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query) || id.includes(query) || serviceName.includes(query);
                  return matchFilter && matchSearch;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                      No orders found matching criteria.
                    </div>
                  );
                }

                return (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">User Name / Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Appointment Date</th>
                        <th className="p-3">Appointment Time</th>
                        <th className="p-3">Service Name</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">Order Status</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Booking Date</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((ord) => {
                        const patientName = ord.patientName || ord.customerName || "N/A";
                        const userName = (ord.email ? ord.email.split("@")[0] : "") || ord.userId || "Registered User";
                        const email = ord.email || ord.customerEmail || "N/A";
                        const phone = ord.phone || "N/A";
                        const apptDate = ord.appointmentDate || ord.date || "N/A";
                        const apptTime = ord.appointmentTime || ord.timeSlot || "Standard";
                        const serviceName = ord.services?.map((s: any) => s.serviceName).join(", ") || ord.serviceName || "Healthcare Service";
                        const totalAmt = ord.totalAmount || ord.total || 0;
                        const bookingDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : (ord.date || "N/A");

                        return (
                          <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">{ord.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-850">{patientName}</div>
                              {ord.relation && <div className="text-[10px] text-gray-400">({ord.relation})</div>}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{userName}</div>
                              <div className="text-[10px] text-gray-400">{email}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-700">{phone}</td>
                            <td className="p-3 text-slate-800 font-medium">{apptDate}</td>
                            <td className="p-3 text-slate-600 font-medium">{apptTime}</td>
                            <td className="p-3 font-semibold text-slate-800 max-w-[150px] truncate" title={serviceName}>{serviceName}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.paymentMethod === "Razorpay" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {ord.paymentMethod === "Razorpay" ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                <span>{ord.paymentMethod || "Cash"}</span>
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                ord.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.paymentStatus === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}>
                                {ord.paymentStatus || "Pending"}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                value={ord.orderStatus || ord.status || "Booked"}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="text-[11px] font-bold px-2 py-1 rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-blue cursor-pointer"
                              >
                                <option value="Booked">Booked</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 font-black text-slate-900">
                              ₹{totalAmt}
                            </td>
                            <td className="p-3 text-gray-500 font-medium text-[11px]">{bookingDate}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => setActiveAdminChatOrder(ord)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition text-[10px] inline-flex items-center space-x-1 cursor-pointer shadow-xs"
                                  title="Open live chat with patient"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-200" />
                                  <span>Chat</span>
                                </button>
                                <button
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition text-[10px] inline-flex items-center space-x-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Details</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 8: COLLECTED CASH */}
        {currentTab === "collected-cash" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">Collected Cash Ledger</span>
              <span className="text-xs font-bold text-primary-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                Total Collection: AED {totalCashCollected}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Reference Action ID</th>
                    <th className="p-4">Cash Amount</th>
                    <th className="p-4">Collected By Agent</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4">Ledger Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collectedCash.map((cash) => (
                    <tr key={cash.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-600">{cash.id}</td>
                      <td className="p-4 font-mono text-gray-500">{cash.bookingId || cash.orderId}</td>
                      <td className="p-4 font-black text-slate-850">AED {cash.amount}</td>
                      <td className="p-4 text-slate-700 font-semibold">{cash.collectedBy}</td>
                      <td className="p-4 text-gray-500">{cash.date}</td>
                      <td className="p-4 text-gray-400 italic">{cash.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: PROVIDERS */}
        {currentTab === "providers" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Certified Hospital & Lab Partners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 p-4 rounded-xl flex items-center space-x-3 bg-gray-50/50">
                <Building className="w-8 h-8 text-primary-blue" />
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Health Shield Labs</h4>
                  <p className="text-[10px] text-gray-400">Jumeirah, Dubai • DHA License: #LH-8521</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DOCTOR ASSIGNMENT */}
        {currentTab === "doctor-assignment" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-850 font-display">Doctor Assignment System</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Assign licensed medical specialists to pending patient bookings. Assigning a doctor automatically sets appointment status to <strong className="text-emerald-700">Confirmed</strong> and dispatches EmailJS confirmation.
                </p>
              </div>
              <button
                onClick={fetchAdminOrders}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Appointments</span>
              </button>
            </div>

            {/* Pending Appointments List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider font-display flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Appointments Requiring Doctor Assignment</span>
                </span>
                <span className="text-xs font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-md text-emerald-300">
                  {adminOrdersList.filter(o => !o.assignedDoctor || o.orderStatus === "Pending").length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100/60 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Appt ID</th>
                      <th className="p-3">Patient Name & Email</th>
                      <th className="p-3">Schedule Date & Time</th>
                      <th className="p-3">Booked Service</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Doctor</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminOrdersList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      adminOrdersList.map((ord) => {
                        const servicesStr = (ord.services || ord.items || []).map(s => s.serviceName).join(", ") || "General Visit";
                        const currentDocId = selectedDoctorForAssign[ord.id] || ord.assignedDoctor || "";

                        return (
                          <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                            <td className="p-3 font-mono font-bold text-slate-800">{ord.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{ord.patientName || ord.customerName}</div>
                              <div className="text-[10px] text-gray-500">{ord.email || ord.customerEmail}</div>
                              <div className="text-[10px] text-gray-400">{ord.phone || "N/A"}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{ord.appointmentDate || ord.date}</div>
                              <div className="text-[10px] text-gray-500">{ord.appointmentTime || "10:00 AM"}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-800 max-w-[160px] truncate" title={servicesStr}>
                              {servicesStr}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                                ord.assignedDoctorName || ord.orderStatus === "Confirmed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.orderStatus === "Completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {ord.assignedDoctorName ? "● Confirmed" : `● ${ord.orderStatus || "Pending"}`}
                              </span>
                            </td>
                            <td className="p-3 min-w-[200px]">
                              {ord.assignedDoctorName ? (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={ord.assignedDoctorPhoto || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80"}
                                    alt={ord.assignedDoctorName}
                                    className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 text-xs">{ord.assignedDoctorName}</p>
                                    <p className="text-[9px] text-emerald-700">{ord.assignedDoctorSpecialization}</p>
                                  </div>
                                </div>
                              ) : (
                                <select
                                  value={currentDocId}
                                  onChange={(e) => setSelectedDoctorForAssign({ ...selectedDoctorForAssign, [ord.id]: e.target.value })}
                                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                  <option value="">-- Select Specialist Doctor --</option>
                                  {doctorsList.filter(d => d.status === "Active").map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                      {doc.fullName} ({doc.specialization})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {ord.assignedDoctorName ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                  ✓ Doctor Assigned
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAssignDoctor(ord.id, selectedDoctorForAssign[ord.id])}
                                  disabled={!selectedDoctorForAssign[ord.id]}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-xs shadow-xs cursor-pointer"
                                >
                                  Assign Doctor
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DOCTOR DIRECTORY MANAGEMENT (MASTER DATABASE) */}
        {currentTab === "doctor-management" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-850 font-display">Doctor Directory (Master Database)</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Master credential database for all licensed medical doctors. Manage doctor credentials, DHA licenses, contact info, and availability.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search doctor, DHA license..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-60"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingDoctor(null);
                    setDoctorForm({
                      fullName: "",
                      email: "",
                      phone: "",
                      specialization: "",
                      qualification: "",
                      experience: "",
                      availability: "",
                      consultationMode: "In-Home Visit & Teleconsultation",
                      licenseNumber: "",
                      status: "Active",
                      profilePhoto: ""
                    });
                    setShowDoctorModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Register New Doctor</span>
                </button>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctorsList
                .filter(doc => 
                  !doctorSearch || 
                  doc.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                  doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                  (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(doctorSearch.toLowerCase()))
                )
                .map((doc) => (
                  <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getImageUrl(doc.profilePhoto)}
                            alt={doc.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
                          />
                          <div>
                            <span className="font-mono text-[9px] font-bold text-gray-400">{doc.id}</span>
                            <h4 className="font-bold text-slate-900 text-sm font-display leading-tight">{doc.fullName}</h4>
                            <p className="text-xs font-semibold text-emerald-700 mt-0.5">{doc.specialization}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-gray-100">
                        <p><strong className="text-slate-800">🎓 Qualification:</strong> {doc.qualification || "MD / MBBS"}</p>
                        <p><strong className="text-slate-800">⏱️ Experience:</strong> {doc.experience || "5+ Years"}</p>
                        <p><strong className="text-slate-800">🏥 License No:</strong> <span className="font-mono font-bold text-slate-700">{doc.licenseNumber || "DHA-LIC-90124"}</span></p>
                        <p><strong className="text-slate-800">🌐 Consultation:</strong> {doc.consultationMode || "In-Home Visit & Teleconsultation"}</p>
                        <p><strong className="text-slate-800">✉️ Email:</strong> {doc.email}</p>
                        <p><strong className="text-slate-800">📞 Phone:</strong> {doc.phone}</p>
                        <p className="text-[11px] text-slate-500">📅 Availability: {doc.availability || "Daily Schedule"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenEditDoctor(doc)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: PRACTITIONERS (ASSIGNED HEALTHCARE SPECIALISTS) */}
        {currentTab === "practitioners" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-primary-blue" />
                  <h3 className="text-base font-bold text-slate-850 font-display">Practitioners Roster & Active Assignments</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Active healthcare specialists assigned to clinical home visits, patient appointments, and active consultations.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search practitioner or service..."
                  value={practitionerSearch}
                  onChange={(e) => setPractitionerSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue w-full sm:w-64"
                />
              </div>
            </div>

            {/* Practitioners Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctorsList
                .filter(doc => 
                  !practitionerSearch || 
                  doc.fullName.toLowerCase().includes(practitionerSearch.toLowerCase()) ||
                  doc.specialization.toLowerCase().includes(practitionerSearch.toLowerCase())
                )
                .map((doc) => {
                  const assignedOrders = adminOrdersList.filter(
                    o => o.assignedDoctor === doc.id || o.assignedDoctorName === doc.fullName
                  );

                  const assignedServicesSet = new Set<string>();
                  assignedOrders.forEach(o => {
                    (o.services || o.items || []).forEach((s: any) => {
                      if (s.serviceName || s.name) assignedServicesSet.add(s.serviceName || s.name);
                    });
                  });
                  const assignedServicesList = Array.from(assignedServicesSet);

                  return (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getImageUrl(doc.profilePhoto)}
                              alt={doc.fullName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-blue shadow-xs"
                            />
                            <div>
                              <span className="font-mono text-[9px] font-bold text-slate-400">{doc.id}</span>
                              <h4 className="font-bold text-slate-900 text-sm font-display leading-tight">{doc.fullName}</h4>
                              <p className="text-xs font-semibold text-primary-blue mt-0.5">{doc.specialization}</p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            doc.status === "Inactive"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : assignedOrders.length > 0
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}>
                            {doc.status === "Inactive" ? "● Inactive" : assignedOrders.length > 0 ? "● On Duty" : "● Available"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-gray-100">
                          <p>
                            <strong className="text-slate-800">🩺 Assigned Service:</strong>{" "}
                            <span className="text-slate-900 font-medium">
                              {assignedServicesList.length > 0 ? assignedServicesList.join(", ") : doc.specialization}
                            </span>
                          </p>
                          <p><strong className="text-slate-800">🎓 Qualification:</strong> {doc.qualification || "MD / MBBS"}</p>
                          <p><strong className="text-slate-800">⏱️ Experience:</strong> {doc.experience || "5+ Years"}</p>
                          <p><strong className="text-slate-800">📅 Availability:</strong> {doc.availability || "Daily Schedule"}</p>
                          
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">Active Patient Appointments:</span>
                            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-900 text-emerald-400 rounded-md">
                              {assignedOrders.length} Patient{assignedOrders.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedPractitionerForModal(doc)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Patient Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 11: REVIEWS */}
        {currentTab === "reviews" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Patient Feedback Audit</h3>
            <div className="space-y-3">
              <div className="border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Ahmed Al Mansoori</span>
                  <span className="text-xs text-amber-500 font-bold">★★★★★</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">"Superb nurse drawing quality. Very gentle."</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: EARNINGS */}
        {currentTab === "earnings" && (
          <div className="space-y-6">
            {/* Quick charts summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Booking Value</span>
                <p className="text-2xl font-black text-slate-850 font-display mt-1">AED {totalBookingsValue}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Treatments Value</span>
                <p className="text-2xl font-black text-emerald-600 font-display mt-1">AED {completedBookingsValue}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Collected Cash Ledger</span>
                <p className="text-2xl font-black text-primary-blue font-display mt-1">AED {totalCashCollected}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display mb-4">Financial Growth Audit</h4>
              <div className="h-64 flex items-end justify-between px-8 pt-8 border-b border-gray-250 bg-gray-50/50 rounded-xl">
                {/* Bar Chart Mocking with Pure CSS representing revenue over months */}
                {[
                  { month: "Jan", amt: 12000, h: "20%" },
                  { month: "Feb", amt: 14500, h: "28%" },
                  { month: "Mar", amt: 19000, h: "42%" },
                  { month: "Apr", amt: 22000, h: "55%" },
                  { month: "May", amt: 29000, h: "70%" },
                  { month: "Jun", amt: 35000, h: "85%" },
                  { month: "Jul", amt: 41000, h: "98%" },
                ].map((m) => (
                  <div key={m.month} className="flex flex-col items-center space-y-2 flex-1 group">
                    <div className="text-[9px] font-bold text-primary-green opacity-0 group-hover:opacity-100 transition-opacity">AED {m.amt}</div>
                    <div 
                      style={{ height: m.h }} 
                      className="w-8 bg-primary-green hover:bg-primary-green-hover rounded-t-md transition-all duration-300"
                    ></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide pt-1">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Custom Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Confirm Deletion</h4>
            <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
              Are you sure you want to delete the {deleteConfirm.type} <span className="font-extrabold text-slate-800">"{deleteConfirm.name}"</span>?
              {deleteConfirm.type === "category" && " This will also affect services associated with it."}
            </p>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { type, id, name } = deleteConfirm;
                  setDeleteConfirm(null);
                  if (type === "category" && onDeleteCategory) {
                    await onDeleteCategory(id);
                    showToast(`Category "${name}" deleted successfully.`);
                  } else if (type === "service" && onDeleteService) {
                    await onDeleteService(id);
                    showToast(`Service "${name}" deleted successfully.`);
                  } else if (type === "user" && onDeleteUser) {
                    await onDeleteUser(id);
                    showToast(`User "${name}" deleted successfully.`);
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm font-display">Order Details</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedOrderDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Patient & Booking Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Patient & Schedule Info</h5>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Patient Name</span>
                    <span className="font-bold">{selectedOrderDetails.patientName || selectedOrderDetails.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Email</span>
                    <span className="font-semibold text-slate-800">{selectedOrderDetails.email || selectedOrderDetails.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Phone</span>
                    <span className="font-medium">{selectedOrderDetails.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Schedule</span>
                    <span className="font-medium">{selectedOrderDetails.appointmentDate || selectedOrderDetails.date} ({selectedOrderDetails.appointmentTime || "10:00 AM"})</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">DOB / Gender</span>
                    <span className="font-medium">{selectedOrderDetails.dateOfBirth || "N/A"} • {selectedOrderDetails.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Relation</span>
                    <span className="font-medium">{selectedOrderDetails.relation || "Self"}</span>
                  </div>
                </div>
                {selectedOrderDetails.notes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-gray-400 block text-[10px]">Notes</span>
                    <p className="italic text-slate-600 mt-0.5">{selectedOrderDetails.notes}</p>
                  </div>
                )}
              </div>

              {/* Services List */}
              <div className="space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Ordered Healthcare Services</h5>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {(selectedOrderDetails.services || selectedOrderDetails.items || []).map((srv: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{srv.serviceName}</div>
                        <div className="text-[10px] text-gray-400">Qty: {srv.quantity || 1} • Unit Price: ₹{srv.price}</div>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">₹{srv.subtotal || srv.price * (srv.quantity || 1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Gateway Information */}
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60 space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>Payment Gateway & Status</span>
                  <span className="text-emerald-700 font-extrabold">{selectedOrderDetails.paymentMethod}</span>
                </h5>

                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Total Amount</span>
                    <span className="font-black text-slate-900 text-sm">₹{selectedOrderDetails.totalAmount || selectedOrderDetails.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Payment Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrderDetails.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedOrderDetails.paymentStatus}
                    </span>
                  </div>

                  {selectedOrderDetails.razorpayOrderId && (
                    <div className="col-span-2 pt-1 border-t border-emerald-200/60 space-y-1 font-mono text-[10px]">
                      <div>
                        <span className="text-gray-500">Razorpay Order ID: </span>
                        <span className="font-bold text-slate-800">{selectedOrderDetails.razorpayOrderId}</span>
                      </div>
                      {selectedOrderDetails.razorpayPaymentId && (
                        <div>
                          <span className="text-gray-500">Razorpay Payment ID: </span>
                          <span className="font-bold text-slate-800">{selectedOrderDetails.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Control */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-slate-700 text-xs">Current Order Status:</span>
                <select
                  value={selectedOrderDetails.orderStatus || "Booked"}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="Booked">Booked</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => {
                  const ordToChat = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  setActiveAdminChatOrder(ordToChat);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>Open Patient Chat</span>
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Add/Edit Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <h4 className="font-bold text-sm font-display flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>{editingDoctor ? "Edit Doctor Profile & Credentials" : "Register New Specialist Doctor"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alexander Wright"
                  value={doctorForm.fullName}
                  onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@nivora.org"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+971 50 123 4567"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiologist & Internal Medicine"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DHA License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DHA-LIC-88219"
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consultation Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. In-Home Visit & Clinic"
                    value={doctorForm.consultationMode}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="MBBS, MD"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="10 Years"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Availability Schedule</label>
                <input
                  type="text"
                  placeholder="Mon - Sat (08:00 AM - 06:00 PM)"
                  value={doctorForm.availability}
                  onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="font-bold text-slate-700 block">Doctor Profile Photo</label>
                <div className="flex items-center space-x-3">
                  <img
                    src={getImageUrl(doctorForm.profilePhoto)}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-400 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDoctorPhotoUpload}
                      className="text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Or paste photo URL..."
                      value={doctorForm.profilePhoto}
                      onChange={(e) => setDoctorForm({ ...doctorForm, profilePhoto: e.target.value })}
                      className="w-full px-2.5 py-1 text-[11px] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={doctorForm.status}
                  onChange={(e) => setDoctorForm({ ...doctorForm, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Practitioner Assigned Patients Detail Modal */}
      {selectedPractitionerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={getImageUrl(selectedPractitionerForModal.profilePhoto)}
                  alt={selectedPractitionerForModal.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                />
                <div>
                  <h4 className="font-bold text-sm font-display leading-tight">{selectedPractitionerForModal.fullName}</h4>
                  <p className="text-xs text-emerald-300">{selectedPractitionerForModal.specialization} • {selectedPractitionerForModal.qualification}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPractitionerForModal(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-emerald-900">
                <div>
                  <span className="font-bold">Contact Email:</span> {selectedPractitionerForModal.email} | <span className="font-bold">Phone:</span> {selectedPractitionerForModal.phone}
                </div>
                <span className="px-2 py-0.5 bg-emerald-700 text-white font-bold rounded text-[10px]">
                  {selectedPractitionerForModal.licenseNumber || "DHA Certified"}
                </span>
              </div>

              <h5 className="font-bold text-slate-850 uppercase tracking-wider text-[11px]">Assigned Active Patient Bookings</h5>

              {(() => {
                const docOrders = adminOrdersList.filter(
                  o => o.assignedDoctor === selectedPractitionerForModal.id || o.assignedDoctorName === selectedPractitionerForModal.fullName
                );

                if (docOrders.length === 0) {
                  return (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No active patient appointments currently assigned to this practitioner.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {docOrders.map((ord) => {
                      const serviceNames = (ord.services || ord.items || []).map(s => s.serviceName || s.name).join(", ") || "General Consultation";

                      return (
                        <div key={ord.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-gray-400">{ord.id}</span>
                              <h6 className="font-bold text-slate-900 text-xs">{ord.patientName || ord.customerName}</h6>
                              <p className="text-[11px] text-gray-500">{ord.email || ord.customerEmail} • {ord.phone || "No Phone"}</p>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                              {ord.orderStatus || ord.status || "Confirmed"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1 border-t border-gray-150">
                            <div><strong>Service:</strong> {serviceNames}</div>
                            <div><strong>Schedule:</strong> {ord.appointmentDate || ord.date} ({ord.appointmentTime || "10:00 AM"})</div>
                            <div><strong>Payment:</strong> {ord.paymentMethod} ({ord.paymentStatus})</div>
                            <div><strong>Amount:</strong> ₹{ord.totalAmount || ord.total}</div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedPractitionerForModal(null);
                                setActiveAdminChatOrder(ord);
                              }}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Live Chat with Patient</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPractitionerForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin / Doctor Patient Chat Modal */}
      {activeAdminChatOrder && (
        <DoctorPatientChatModal
          isOpen={!!activeAdminChatOrder}
          onClose={() => setActiveAdminChatOrder(null)}
          appointment={activeAdminChatOrder}
          currentUserRole="admin"
          currentUserName="Nivora Medical Admin / DHA Specialist"
        />
      )}
    </div>
  );
}
