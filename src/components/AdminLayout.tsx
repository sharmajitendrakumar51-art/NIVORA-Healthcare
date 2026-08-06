import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminDashboard from "../pages/AdminDashboard";
import { useAuth } from "../context/AuthContext";
import { Category, Service, Booking, Order, CollectedCash, User } from "../types";

interface AdminLayoutProps {
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
  onDeleteUser: (id: string) => Promise<void>;
  onUpdateUser?: (id: string, updated: Partial<User>) => Promise<void>;
  onRefreshData?: () => void;
}

export default function AdminLayout({
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
  users,
  onDeleteUser,
  onUpdateUser,
  onRefreshData
}: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAuth();

  // Map sub-route path to active tab ID
  const activeTab = useMemo(() => {
    const path = location.pathname.toLowerCase().replace(/\/$/, "");
    if (path === "/admin" || path === "/admin/dashboard") return "categories";
    if (path === "/admin/category" || path === "/admin/categories") return "categories";
    if (path === "/admin/services") return "services";
    if (path === "/admin/practitioners") return "practitioners";
    if (path === "/admin/bookings") return "bookings";
    if (path === "/admin/orders") return "orders";
    if (path === "/admin/providers") return "providers";
    if (path === "/admin/users") return "users";
    if (path === "/admin/settings") return "service-management";
    if (path === "/admin/reports") return "earnings";
    if (path === "/admin/roles" || path === "/admin/admin-role") return "admin-role";
    if (path === "/admin/doctor-assignment") return "doctor-assignment";
    if (path === "/admin/doctor-management") return "doctor-management";
    if (path === "/admin/service-management") return "service-management";
    if (path === "/admin/service-allocation") return "service-allocation";
    if (path === "/admin/collected-cash") return "collected-cash";
    if (path === "/admin/reviews") return "reviews";
    if (path === "/admin/earnings") return "earnings";
    return "categories";
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    navigate(`/admin/${tabId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex bg-[#F8F9FB] min-h-screen font-sans">
      <AdminSidebar
        currentTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={activeTab}
          adminUser={adminUser}
        />
        <main className="flex-grow">
          <AdminDashboard
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
            currentTab={activeTab}
            adminUser={adminUser}
          />
        </main>
      </div>
    </div>
  );
}
