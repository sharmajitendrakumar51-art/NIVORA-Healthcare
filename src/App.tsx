import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Category, Service, Booking, Order, CollectedCash, CartItem, PatientDetails, User } from "./types";
import { Language, City } from "./utils/translations";

// Page/Component Imports
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AIChatbot from "./components/AIChatbot";

// Pages
import Home from "./pages/Home";
import DoctorVisit from "./pages/DoctorVisit";
import ServiceDetails from "./pages/ServiceDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import OrderSuccess from "./pages/OrderSuccess";
import MyAppointments from "./pages/MyAppointments";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import { sendAppointmentCancellationEmail } from "./services/emailService";

function NavigationWrapper({
  cart,
  user,
  onLogout,
  onLoginSuccess,
  onSearch,
  searchQuery,
  categories,
  services,
  bookings,
  orders,
  collectedCash,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  onBookImmediate,
  adminUser,
  onAdminLogout,
  onAddCategory,
  onAddService,
  onUpdateBookingStatus,
  onUpdateService,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteService,
  users,
  onDeleteUser,
  onUpdateUser,
  onRefreshData,
  adminTab,
  setAdminTab,
  language,
  setLanguage,
  city,
  setCity
}: {
  cart: CartItem[];
  user: any;
  onLogout: () => void;
  onLoginSuccess: (user: any) => void;
  onSearch: (q: string) => void;
  searchQuery: string;
  categories: Category[];
  services: Service[];
  bookings: Booking[];
  orders: Order[];
  collectedCash: CollectedCash[];
  onAddToCart: (s: Service, q: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onBookImmediate: (s: Service) => void;
  adminUser: any;
  onAdminLogout: () => void;
  onAddCategory: (cat: Partial<Category>) => Promise<any>;
  onAddService: (srv: Partial<Service>) => Promise<any>;
  onUpdateBookingStatus: (id: string, s: 'Confirmed' | 'Completed' | 'Cancelled') => Promise<any>;
  onUpdateService: (id: string, updated: Partial<Service>) => Promise<any>;
  onUpdateCategory?: (id: string, updated: Partial<Category>) => Promise<any>;
  onDeleteCategory?: (id: string) => Promise<any>;
  onDeleteService?: (id: string) => Promise<any>;
  users: User[];
  onDeleteUser: (id: string) => Promise<void>;
  onUpdateUser?: (id: string, updated: Partial<User>) => Promise<void>;
  onRefreshData?: () => void;
  adminTab: string;
  setAdminTab: (t: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  city: City;
  setCity: (city: City) => void;
}) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (location.pathname === "/admin/login") {
      return (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      );
    }

    return (
      <ProtectedRoute>
        <AdminLayout
          categories={categories}
          services={services}
          bookings={bookings}
          orders={orders}
          collectedCash={collectedCash}
          onAddCategory={onAddCategory}
          onAddService={onAddService}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onUpdateService={onUpdateService}
          onUpdateCategory={onUpdateCategory}
          onDeleteCategory={onDeleteCategory}
          onDeleteService={onDeleteService}
          users={users}
          onDeleteUser={onDeleteUser}
          onUpdateUser={onUpdateUser}
          onRefreshData={onRefreshData}
        />
      </ProtectedRoute>
    );
  }

  // Patient Layout
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] font-sans">
      <Header 
        cart={cart} 
        user={user} 
        onLogout={onLogout} 
        onSearch={onSearch} 
        language={language}
        setLanguage={setLanguage}
        city={city}
        setCity={setCity}
        categories={categories}
      />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    searchQuery={searchQuery} 
                    language={language}
                  />
                } 
              />
              <Route 
                path="/doctor-visit" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Nurse Care"
                  />
                } 
              />
              <Route 
                path="/physiotherapy" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Physiotherapy"
                  />
                } 
              />
              <Route 
                path="/iv-therapy" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Nurse Care"
                  />
                } 
              />
              <Route 
                path="/lab-tests" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Diagnostics"
                  />
                } 
              />
              <Route 
                path="/health-care" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Elder Care"
                  />
                } 
              />
              <Route 
                path="/others" 
                element={
                  <DoctorVisit 
                    categories={categories} 
                    services={services} 
                    onBookImmediate={onBookImmediate} 
                    defaultCategoryName="Dental Care"
                  />
                } 
              />
              <Route 
                path="/services/:id" 
                element={
                  <ServiceDetails 
                    services={services} 
                    onAddToCart={onAddToCart} 
                    onBookImmediate={onBookImmediate} 
                  />
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <Cart 
                    cart={cart} 
                    onUpdateQty={onUpdateQty} 
                    onRemoveItem={onRemoveItem} 
                    onProceedToCheckout={onProceedToCheckout} 
                  />
                } 
              />
              <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
              <Route path="/register" element={<Register onRegisterSuccess={onLoginSuccess} />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/orders" element={<MyAppointments orders={orders} user={user} />} />
              <Route path="/my-appointments" element={<MyAppointments orders={orders} user={user} />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard doctorUser={user} onLogout={onLogout} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AIChatbot 
        onBookImmediate={onBookImmediate} 
        services={services} 
      />
    </div>
  );
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collectedCash, setCollectedCash] = useState<CollectedCash[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Cart & Authentication state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("healthcare_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("nivora_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: "USR-002",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "+971 50 123 4567"
    };
  });

  const [adminUser, setAdminUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("nivora_admin_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [adminTab, setAdminTab] = useState("categories");

  // Language & City States
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("healthcare_language") as Language) || "en";
  });
  const [city, setCity] = useState<City>(() => {
    return (localStorage.getItem("healthcare_city") as City) || "dubai";
  });

  useEffect(() => {
    localStorage.setItem("healthcare_language", language);
    // Dynamically set page direction for RTL Arabic support
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem("healthcare_city", city);
  }, [city]);

  // Booking Modal State
  const [activeBookingService, setActiveBookingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all primary data from backend API
  const loadData = async () => {
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

      const orderEndpoint = adminUser ? "/api/admin/orders" : "/api/orders/my";

      const [catRes, srvRes, bookRes, ordRes, cashRes, userRes] = await Promise.all([
        fetch("/api/categories").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/bookings", { headers }).then(r => r.json()),
        fetch(orderEndpoint, { headers }).then(r => r.json().catch(() => [])),
        fetch("/api/collected-cash", { headers }).then(r => r.json().catch(() => [])),
        fetch("/api/users", { headers }).then(r => r.json().catch(() => []))
      ]);
      console.log("Categories API response:", catRes);
      console.log("Users API response:", userRes);

      setCategories(Array.isArray(catRes) ? catRes.filter((c: any) => c && c.id && typeof c.name === "string" && c.name.length > 0) : []);
      setServices(Array.isArray(srvRes) ? srvRes.filter((s: any) => s && s.id && typeof s.name === "string" && s.name.length > 0) : []);
      setBookings(Array.isArray(bookRes) ? bookRes : []);
      setOrders(Array.isArray(ordRes) ? ordRes : []);
      setCollectedCash(Array.isArray(cashRes) ? cashRes : []);
      setUsers(Array.isArray(userRes) ? userRes : []);
    } catch (e) {
      console.error("Error loading full-stack healthcare parameters", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminUser]);

  useEffect(() => {
    try {
      localStorage.setItem("healthcare_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  // API Mutators
  const handleAddCategory = async (catData: Partial<Category>) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(catData)
      });
      if (!res.ok) {
        console.error("Failed to add category:", res.statusText);
        return null;
      }
      const newCat = await res.json();
      if (newCat && newCat.id && typeof newCat.name === "string") {
        setCategories(prev => [...prev.filter(c => c.id !== newCat.id), newCat]);
        return newCat;
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
    return null;
  };

  const handleAddService = async (srvData: Partial<Service>) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(srvData)
      });
      if (!res.ok) {
        console.error("Failed to add service:", res.statusText);
        return null;
      }
      const newSrv = await res.json();
      if (newSrv && newSrv.id && typeof newSrv.name === "string") {
        setServices(prev => [newSrv, ...prev.filter(s => s.id !== newSrv.id)]);
        return newSrv;
      }
    } catch (err) {
      console.error("Error adding service:", err);
    }
    return null;
  };

  const handleUpdateBookingStatus = async (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => {
    const targetBooking = bookings.find(b => b.id === id);
    const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const updated = await res.json();
    if (updated && updated.id) {
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    }
    loadData(); // Reload stats/cash collected

    if (status === "Cancelled") {
      const b = updated || targetBooking;
      if (b) {
        const userName = b.patientDetails
          ? `${b.patientDetails.firstName || ''} ${b.patientDetails.lastName || ''}`.trim()
          : (b.patientName || "Patient");
        const userEmail = b.patientDetails?.email || b.email || b.customerEmail || "";
        const doctorName = b.serviceName || b.doctorName || "Nivora Healthcare Specialist";
        const appointmentDate = b.date || b.appointmentDate || "Scheduled Date";
        const appointmentTime = b.time || b.appointmentTime || "Scheduled Time";

        if (userEmail) {
          sendAppointmentCancellationEmail({
            userName,
            userEmail,
            doctorName,
            appointmentDate,
            appointmentTime
          }).catch((emailErr) => {
            console.error("EmailJS sending error (booking cancellation):", emailErr);
          });
        }
      }
    }

    return updated;
  };

  const handleUpdateService = async (id: string, updatedFields: Partial<Service>) => {
    try {
      const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) return null;
      const updated = await res.json();
      if (updated && updated.id) {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
        return updated;
      }
    } catch (err) {
      console.error("Error updating service:", err);
    }
    return null;
  };

  const handleUpdateCategory = async (id: string, updatedFields: Partial<Category>) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) return null;
      const updated = await res.json();
      if (updated && updated.id) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
        return updated;
      }
    } catch (err) {
      console.error("Error updating category:", err);
    }
    return null;
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
    const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
    await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdateUser = async (id: string, updatedFields: Partial<User>) => {
    try {
      const token = localStorage.getItem("nivora_token") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...data.user } : u)));
      } else {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedFields } : u)));
      }
    } catch (e) {
      console.error("Error updating user:", e);
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedFields } : u)));
    }
  };

  // Cart operations
  const handleAddToCart = (service: Service, quantity: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.service.id === service.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { service, quantity }];
    });
  };

  const handleUpdateQty = (serviceId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.service.id === serviceId) {
          const qty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: qty };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const handleProceedToCheckout = () => {
    if (cart.length > 0) {
      setActiveBookingService(cart[0].service);
    }
  };

  const handleBookImmediate = (service: Service) => {
    setActiveBookingService(service);
  };

  const handleConfirmBooking = async (bookingDetails: {
    date: string;
    time: string;
    slot: "Morning" | "Afternoon" | "Evening";
    bookingForSomeoneElse: boolean;
    patientDetails: PatientDetails;
    notes: string;
  }) => {
    if (!activeBookingService) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: activeBookingService.id,
          ...bookingDetails
        })
      });

      if (res.ok) {
        // Clear item from cart if it was matched
        setCart(prev => prev.filter(item => item.service.id !== activeBookingService.id));
        setActiveBookingService(null);
        loadData(); // Fetch fresh bookings list and cash collections
      }
    } catch (e) {
      console.error("Booking error", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nivora_token");
    localStorage.removeItem("token");
    localStorage.removeItem("nivora_user");
    setUser(null);
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("nivora_token");
    localStorage.removeItem("token");
    localStorage.removeItem("nivora_admin_user");
    setAdminUser(null);
  };

  const handleAdminLoginSuccess = (adminData: any) => {
    setAdminUser(adminData);
    if (adminData?.token) {
      localStorage.setItem("nivora_token", adminData.token);
      localStorage.setItem("token", adminData.token);
    }
    localStorage.setItem("nivora_admin_user", JSON.stringify(adminData));
    loadData();
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin security gate */}
          <Route 
            path="/admin/login" 
            element={<AdminLogin onAdminLoginSuccess={handleAdminLoginSuccess} />} 
          />
          
          {/* All other routes */}
          <Route 
            path="*" 
            element={
              <NavigationWrapper
                cart={cart}
                user={user}
                onLogout={handleLogout}
                onLoginSuccess={handleLoginSuccess}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
                categories={categories}
                services={services}
                bookings={bookings}
                orders={orders}
                collectedCash={collectedCash}
                onAddToCart={handleAddToCart}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onProceedToCheckout={handleProceedToCheckout}
                onBookImmediate={handleBookImmediate}
                adminUser={adminUser}
                onAdminLogout={handleAdminLogout}
                onAddCategory={handleAddCategory}
                onAddService={handleAddService}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateService={handleUpdateService}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onDeleteService={handleDeleteService}
                users={users}
                onDeleteUser={handleDeleteUser}
                onUpdateUser={handleUpdateUser}
                onRefreshData={loadData}
                adminTab={adminTab}
                setAdminTab={setAdminTab}
                language={language}
                setLanguage={setLanguage}
                city={city}
                setCity={setCity}
              />
            } 
          />
        </Routes>

        {/* Main Global Appointment Modal Popup */}
        {activeBookingService && (
          <BookingModal
            isOpen={!!activeBookingService}
            onClose={() => setActiveBookingService(null)}
            service={activeBookingService}
            onConfirm={handleConfirmBooking}
          />
        )}
      </Router>
    </AuthProvider>
  );
}
