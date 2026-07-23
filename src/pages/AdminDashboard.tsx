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
  UserCheck
} from "lucide-react";
import { Category, Service, Booking, Order, CollectedCash, PatientDetails, User } from "../types";
import { getImageUrl } from "../utils/translations";

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

    if (editingSrv) {
      await onUpdateService(editingSrv.id, {
        name: srvName,
        categoryId: srvCatId,
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
                        <td className="p-4 text-gray-500">{srv.categoryName}</td>
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

        {/* TAB 10: PRACTITIONERS */}
        {currentTab === "practitioners" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Licensed Roster Practitioners</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-150 p-4 rounded-xl flex items-center space-x-3 bg-gray-50/50">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">Dr</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Dr. Amina Al Maktoum</h4>
                  <p className="text-[10px] text-gray-400 font-medium">General Practice Specialist</p>
                  <p className="text-[9px] text-primary-green font-bold uppercase tracking-wider mt-1">On Duty</p>
                </div>
              </div>
              <div className="border border-gray-150 p-4 rounded-xl flex items-center space-x-3 bg-gray-50/50">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">Pt</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Dr. Robert Chen, PT</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Sports Physiotherapist</p>
                  <p className="text-[9px] text-primary-green font-bold uppercase tracking-wider mt-1">On Duty</p>
                </div>
              </div>
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
    </div>
  );
}
