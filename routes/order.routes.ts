import { Router } from "express";
import { verifyToken, verifyAdminToken } from "../middleware/auth";
import {
  getMyOrders,
  getAllOrdersAdmin,
  getOrdersRoute,
  getSingleOrder,
  createNewOrder,
  updateOrderStatus
} from "../controllers/order.controller";

const router = Router();

// User Appointments API Endpoint (Protected by JWT)
// GET /api/orders/my
router.get("/my", verifyToken, getMyOrders);

// Admin Appointments API Endpoint (Protected by Admin JWT)
// GET /api/admin/orders
router.get("/admin/all", verifyAdminToken, getAllOrdersAdmin);

// General Orders GET Endpoint (Restricted)
router.get("/", verifyToken, getOrdersRoute);

// Single Order GET Endpoint (Protected with Ownership Check)
router.get("/:id", verifyToken, getSingleOrder);

// Create Order POST Endpoint (Protected with JWT User Binding)
router.post("/", verifyToken, createNewOrder);

// Update Status PATCH Endpoint (Admin Only)
router.patch("/:id/status", verifyAdminToken, updateOrderStatus);

export default router;
