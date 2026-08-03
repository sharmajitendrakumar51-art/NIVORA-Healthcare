import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  getOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByUserIdOrEmail,
  addOrder,
  updateOrder,
  getBookings,
  addBooking,
  getCollectedCash,
  addCollectedCash
} from "../server-mongodb";
import { Order, Booking } from "../src/types";

/**
 * GET /api/orders/my
 * User API: Fetches ONLY the logged-in user's appointments and orders.
 * NEVER accepts userId from frontend; extracts ID exclusively from JWT payload.
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing user identity in JWT token." });
    }

    // Query database for orders matching user ID or email
    const userOrders = await getOrdersByUserIdOrEmail(userId as string, userEmail as string);

    // Sort newest first
    const sorted = [...userOrders].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    return res.json(sorted);
  } catch (error: any) {
    console.error("Error in getMyOrders controller:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user appointments." });
  }
};

/**
 * GET /api/admin/orders
 * Admin API: Returns all orders for administrative monitoring
 */
export const getAllOrdersAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== "Super Admin" && req.user?.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only administrators can view all orders." });
    }

    const orders = await getOrders();
    const sorted = [...orders].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    return res.json(sorted);
  } catch (error: any) {
    console.error("Error in getAllOrdersAdmin controller:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch all orders for admin." });
  }
};

/**
 * GET /api/orders
 * Guarded general orders endpoint. Returns user's orders for regular users, or all orders for admins.
 */
export const getOrdersRoute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === "Super Admin" || req.user?.role === "Admin") {
      const orders = await getOrders();
      return res.json(orders);
    }
    // For non-admin logged-in users, redirect to getMyOrders logic
    return getMyOrders(req, res);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

/**
 * GET /api/orders/:id
 * Fetches a single order after verifying ownership or admin status
 */
export const getSingleOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === "Super Admin" || req.user?.role === "Admin";

    // Enforce 403 Forbidden if user attempts to view another user's order
    const isOwner = (userId && order.userId === userId) ||
                    (userEmail && (order.email === userEmail || order.customerEmail === userEmail));

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied to unauthorized booking data." });
    }

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch order details." });
  }
};

/**
 * POST /api/orders
 * Creates a new order attached to the logged-in user's ID from JWT token
 */
export const createNewOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const currentOrders = await getOrders();
    const maxOrderIdNum = currentOrders.reduce((max, o) => {
      const num = parseInt(o.id.replace("#ORD-", "").replace("ORD-", ""));
      return isNaN(num) ? max : (num > max ? num : max);
    }, 9920);

    const orderId = body.id || ("#ORD-" + (maxOrderIdNum + 1));
    const now = new Date().toISOString();

    // Attach user ID strictly from verified JWT token
    const authenticatedUserId = req.user?.id || req.user?._id || body.userId || "USR-002";
    const authenticatedUserEmail = req.user?.email || body.email || body.customerEmail || "jane.doe@example.com";

    const newOrder: Order = {
      id: orderId,
      userId: authenticatedUserId,
      patientName: body.patientName || body.customerName || "Patient",
      email: authenticatedUserEmail,
      phone: body.phone || "+1 (555) 000-0000",
      dateOfBirth: body.dateOfBirth || body.dob || "1995-01-01",
      gender: body.gender || "Other",
      relation: body.relation || "Self",
      appointmentDate: body.appointmentDate || body.date || new Date().toISOString().split("T")[0],
      appointmentTime: body.appointmentTime || body.time || "10:00 AM",
      timeSlot: body.timeSlot || body.slot || "Morning",
      notes: body.notes || "",
      services: body.services || (body.items ? body.items.map((i: any) => ({
        serviceId: i.serviceId,
        serviceName: i.serviceName,
        serviceImage: i.image || "",
        price: i.price,
        quantity: i.quantity || 1,
        subtotal: (i.price || 0) * (i.quantity || 1)
      })) : []),
      discount: body.discount || 0,
      totalAmount: Number(body.totalAmount || body.total || 0),
      paymentMethod: body.paymentMethod || "Cash on Appointment",
      paymentStatus: body.paymentStatus || (body.paymentMethod === "Razorpay" ? "Paid" : "Pending"),
      razorpayOrderId: body.razorpayOrderId || "",
      razorpayPaymentId: body.razorpayPaymentId || "",
      razorpaySignature: body.razorpaySignature || "",
      paymentDate: body.paymentDate || (body.paymentStatus === "Paid" ? now : ""),
      orderStatus: body.orderStatus || (body.paymentMethod === "Razorpay" ? "Confirmed" : "Booked"),
      createdAt: now,
      updatedAt: now,

      customerName: body.patientName || body.customerName || "Patient",
      customerEmail: authenticatedUserEmail,
      items: body.items || (body.services ? body.services.map((s: any) => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        price: s.price,
        quantity: s.quantity,
        image: s.serviceImage || ""
      })) : []),
      date: body.appointmentDate || body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: Number(body.totalAmount || body.total || 0)
    };

    const savedOrder = await addOrder(newOrder);

    // Sync booking entry
    try {
      const currentBookings = await getBookings();
      const maxBookingIdNum = currentBookings.reduce((max, b) => {
        const num = parseInt(b.id.replace("#BOOK-", ""));
        return isNaN(num) ? max : (num > max ? num : max);
      }, 9920);

      const firstService = newOrder.services[0];
      const newBooking: Booking = {
        id: "#BOOK-" + (maxBookingIdNum + 1),
        serviceId: firstService?.serviceId || "SRV-1001",
        serviceName: firstService?.serviceName || "Healthcare Service",
        categoryName: "General Care",
        date: newOrder.appointmentDate || new Date().toISOString().split("T")[0],
        time: newOrder.appointmentTime || "10:00 AM",
        slot: (newOrder.timeSlot as any) || "Morning",
        bookingForSomeoneElse: newOrder.relation !== "Self",
        patientDetails: {
          firstName: newOrder.patientName.split(" ")[0] || "Patient",
          lastName: newOrder.patientName.split(" ").slice(1).join(" ") || "Details",
          email: newOrder.email,
          phone: newOrder.phone || "",
          dob: newOrder.dateOfBirth || "1995-01-01",
          relation: newOrder.relation || "Self",
          gender: (newOrder.gender as any) || "Other"
        },
        notes: newOrder.notes,
        status: newOrder.paymentMethod === "Razorpay" ? "Confirmed" : "Pending",
        price: newOrder.totalAmount,
        createdAt: now
      };
      await addBooking(newBooking);

      if (newOrder.paymentStatus === "Paid" || newOrder.paymentMethod === "Cash on Appointment") {
        const currentCash = await getCollectedCash();
        const maxCashIdNum = currentCash.reduce((max, c) => {
          const num = parseInt(c.id.replace("CASH-", ""));
          return isNaN(num) ? max : (num > max ? num : max);
        }, 3000);

        await addCollectedCash({
          id: "CASH-" + (maxCashIdNum + 1),
          bookingId: newBooking.id,
          orderId: newOrder.id,
          amount: newOrder.totalAmount,
          collectedBy: newOrder.paymentMethod === "Razorpay" ? "Razorpay Gateway" : "Cash Collection Pending",
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          notes: `${newOrder.paymentMethod} booking for ${newOrder.patientName}`
        });
      }
    } catch (bookingErr) {
      console.error("Linked booking creation warning:", bookingErr);
    }

    res.json(savedOrder);
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
};

/**
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderStatus, paymentStatus, status } = req.body;
    const newStatus = orderStatus || status;
    const updatePayload: Partial<Order> = {};
    if (newStatus) {
      updatePayload.orderStatus = newStatus;
      (updatePayload as any).status = newStatus;
    }
    if (paymentStatus) {
      updatePayload.paymentStatus = paymentStatus;
    } else if (newStatus === "Completed") {
      updatePayload.paymentStatus = "Paid";
    }

    const updated = await updateOrder(req.params.id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update order status" });
  }
};
