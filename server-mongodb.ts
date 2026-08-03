import mongoose, { Schema } from "mongoose";
import { Category, Service, Booking, Order, CollectedCash, Review } from "./src/types";

// Setup connection
const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let fallbackDb: any = null;
let fallbackSaveDb: (() => void) | null = null;

// Schemas
const CategorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ServiceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  image: { type: String, required: true },
  mrpPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  genderFocus: { type: String, enum: ['All Genders', 'Male', 'Female'], default: 'All Genders' },
  ageGroup: { type: String, enum: ['Pediatric', '18+', 'Seniors', 'All Ages'], default: 'All Ages' },
  vitalTrackingRequired: { type: [String], default: [] },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 }
});

const PatientDetailsSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true },
  relation: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }
}, { _id: false });

const BookingSchema = new Schema({
  id: { type: String, required: true, unique: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  categoryName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  slot: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true },
  bookingForSomeoneElse: { type: Boolean, default: false },
  patientDetails: { type: PatientDetailsSchema, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  price: { type: Number, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },

  // Doctor Assignment fields
  assignedDoctor: { type: String },
  assignedDoctorName: { type: String },
  assignedDoctorEmail: { type: String },
  assignedDoctorPhone: { type: String },
  assignedDoctorSpecialization: { type: String },
  assignedDoctorPhoto: { type: String },
  assignedAt: { type: String }
});

const OrderServiceSchema = new Schema({
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  serviceImage: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  patientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: String },
  gender: { type: String },
  relation: { type: String },
  appointmentDate: { type: String },
  appointmentTime: { type: String },
  timeSlot: { type: String },
  notes: { type: String },
  services: { type: [OrderServiceSchema], default: [] },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash on Appointment', 'Razorpay'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Unpaid'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentDate: { type: String },
  orderStatus: { type: String, enum: ['Pending', 'Booked', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },

  // Doctor Assignment fields
  assignedDoctor: { type: String },
  assignedDoctorName: { type: String },
  assignedDoctorEmail: { type: String },
  assignedDoctorPhone: { type: String },
  assignedDoctorSpecialization: { type: String },
  assignedDoctorPhoto: { type: String },
  assignedAt: { type: String },

  // Backwards compatibility fields
  customerName: { type: String },
  customerEmail: { type: String },
  items: { type: [Schema.Types.Mixed], default: [] },
  date: { type: String },
  total: { type: Number }
});

const DoctorSchema = new Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String },
  experience: { type: String },
  availability: { type: String },
  consultationMode: { type: String },
  licenseNumber: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  profilePhoto: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ReviewSchema = new Schema({
  id: { type: String, required: true, unique: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, required: true }
});

const CollectedCashSchema = new Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String },
  orderId: { type: String },
  amount: { type: Number, required: true },
  collectedBy: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String }
});

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }
});

const DoctorPatientChatMessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  appointmentId: { type: String, required: true, index: true },
  patientId: { type: String },
  patientName: { type: String, required: true },
  doctorId: { type: String },
  doctorName: { type: String, required: true },
  senderRole: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// Models
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const ServiceModel = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export const CollectedCashModel = mongoose.models.CollectedCash || mongoose.model("CollectedCash", CollectedCashSchema);
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const DoctorModel = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export const DoctorPatientChatMessageModel = mongoose.models.DoctorPatientChatMessage || mongoose.model("DoctorPatientChatMessage", DoctorPatientChatMessageSchema);

export function isMongoConnected() {
  return isConnected;
}

// Initializer
export async function initDatabase(localDb: any, localSaveDbFn: () => void) {
  fallbackDb = localDb;
  fallbackSaveDb = localSaveDbFn;

  const uri = (MONGODB_URI || "").trim();

  if (!uri || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    console.log("MONGODB_URI environment variable is not defined or is not a valid connection string. Using local file storage.");
    return false;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    } as any);
    isConnected = true;
    console.log("MongoDB connection established successfully!");

    // Seed collections if MongoDB is empty but we have local fallback database data
    await seedIfEmpty();

    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB on startup. Falling back to local file storage.", error);
    isConnected = false;
    return false;
  }
}

async function seedIfEmpty() {
  try {
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0 && fallbackDb && fallbackDb.categories.length > 0) {
      console.log("Seeding MongoDB with fallback categories...");
      await CategoryModel.insertMany(fallbackDb.categories);
    }

    const srvCount = await ServiceModel.countDocuments();
    if (srvCount === 0 && fallbackDb && fallbackDb.services.length > 0) {
      console.log("Seeding MongoDB with fallback services...");
      await ServiceModel.insertMany(fallbackDb.services);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && fallbackDb && fallbackDb.users && fallbackDb.users.length > 0) {
      console.log("Seeding MongoDB with fallback users...");
      await UserModel.insertMany(fallbackDb.users);
    }

    const docCount = await DoctorModel.countDocuments();
    if (docCount === 0 && fallbackDb && fallbackDb.doctors && fallbackDb.doctors.length > 0) {
      console.log("Seeding MongoDB with fallback doctors...");
      await DoctorModel.insertMany(fallbackDb.doctors);
    }

    const bookingCount = await BookingModel.countDocuments();
    if (bookingCount === 0 && fallbackDb && fallbackDb.bookings && fallbackDb.bookings.length > 0) {
      console.log("Seeding MongoDB with fallback bookings...");
      await BookingModel.insertMany(fallbackDb.bookings);
    }

    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && fallbackDb && fallbackDb.orders && fallbackDb.orders.length > 0) {
      console.log("Seeding MongoDB with fallback orders...");
      await OrderModel.insertMany(fallbackDb.orders);
    }

    const reviewCount = await ReviewModel.countDocuments();
    if (reviewCount === 0 && fallbackDb && fallbackDb.reviews && fallbackDb.reviews.length > 0) {
      console.log("Seeding MongoDB with fallback reviews...");
      await ReviewModel.insertMany(fallbackDb.reviews);
    }

    const cashCount = await CollectedCashModel.countDocuments();
    if (cashCount === 0 && fallbackDb && fallbackDb.collectedCash && fallbackDb.collectedCash.length > 0) {
      console.log("Seeding MongoDB with fallback collected cash entries...");
      await CollectedCashModel.insertMany(fallbackDb.collectedCash);
    }

    console.log("Database seeding check completed.");
  } catch (error) {
    console.error("Error seeding MongoDB:", error);
  }
}

// Unified Database CRUD Methods
const callSaveFallback = () => {
  if (fallbackSaveDb) {
    fallbackSaveDb();
  }
};

// USERS
export async function getUsers(): Promise<any[]> {
  if (isConnected) {
    try {
      return await UserModel.find().lean();
    } catch (e) {
      console.warn("MongoDB getUsers failed, falling back to local memory storage:", e);
    }
  }
  return fallbackDb ? fallbackDb.users : [];
}

export async function findUserByEmail(email: string): Promise<any | null> {
  if (!email) return null;
  const targetEmail = email.trim().toLowerCase();
  if (isConnected) {
    try {
      const user = await UserModel.findOne({ email: new RegExp(`^${targetEmail}$`, "i") } as any).lean();
      if (user) return user;
    } catch (e) {
      console.warn("MongoDB findUserByEmail failed, falling back to local memory storage:", e);
    }
  }
  if (fallbackDb && fallbackDb.users) {
    return fallbackDb.users.find((u: any) => u.email && u.email.toLowerCase() === targetEmail) || null;
  }
  return null;
}

export async function addUser(user: any): Promise<any> {
  if (isConnected) {
    try {
      const newUser = new UserModel(user);
      await newUser.save();
      return newUser.toObject();
    } catch (e) {
      console.warn("MongoDB addUser failed, falling back to local memory storage:", e);
    }
  }
  if (fallbackDb && fallbackDb.users) {
    const existingIdx = fallbackDb.users.findIndex((u: any) => u.email && u.email.toLowerCase() === (user.email || "").toLowerCase());
    if (existingIdx !== -1) {
      fallbackDb.users[existingIdx] = { ...fallbackDb.users[existingIdx], ...user };
    } else {
      fallbackDb.users.push(user);
    }
    callSaveFallback();
  }
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isConnected) {
    const res = await UserModel.deleteOne({ id } as any);
    return res.deletedCount > 0;
  }
  const idx = fallbackDb.users.findIndex((u: any) => u.id === id);
  if (idx === -1) return false;
  fallbackDb.users.splice(idx, 1);
  callSaveFallback();
  return true;
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
  if (isConnected) {
    return await CategoryModel.find().lean();
  }
  return fallbackDb.categories;
}

export async function addCategory(category: Category): Promise<Category> {
  if (isConnected) {
    const newCat = new CategoryModel(category);
    await newCat.save();
    return newCat.toObject();
  }
  fallbackDb.categories.push(category);
  callSaveFallback();
  return category;
}

export async function updateCategory(id: string, updatedFields: Partial<Category>): Promise<Category | null> {
  if (isConnected) {
    const updated = await CategoryModel.findOneAndUpdate({ id } as any, { $set: updatedFields } as any, { new: true } as any).lean();
    return updated as any;
  }
  const idx = fallbackDb.categories.findIndex((c: any) => c.id === id);
  if (idx === -1) return null;
  fallbackDb.categories[idx] = { ...fallbackDb.categories[idx], ...updatedFields };
  callSaveFallback();
  return fallbackDb.categories[idx];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isConnected) {
    const res = await CategoryModel.deleteOne({ id } as any);
    return res.deletedCount > 0;
  }
  const idx = fallbackDb.categories.findIndex((c: any) => c.id === id);
  if (idx === -1) return false;
  fallbackDb.categories.splice(idx, 1);
  callSaveFallback();
  return true;
}

// SERVICES
export async function getServices(): Promise<Service[]> {
  if (isConnected) {
    return await ServiceModel.find().lean();
  }
  return fallbackDb.services;
}

export async function findServiceById(id: string): Promise<Service | null> {
  if (isConnected) {
    return await ServiceModel.findOne({ id } as any).lean();
  }
  return fallbackDb.services.find((s: any) => s.id === id) || null;
}

export async function addService(service: Service): Promise<Service> {
  if (isConnected) {
    const newSrv = new ServiceModel(service);
    await newSrv.save();
    return newSrv.toObject();
  }
  fallbackDb.services.push(service);
  callSaveFallback();
  return service;
}

export async function updateService(id: string, updatedFields: Partial<Service>): Promise<Service | null> {
  if (isConnected) {
    const updated = await ServiceModel.findOneAndUpdate({ id } as any, { $set: updatedFields } as any, { new: true } as any).lean();
    return updated as any;
  }
  const idx = fallbackDb.services.findIndex((s: any) => s.id === id);
  if (idx === -1) return null;
  fallbackDb.services[idx] = { ...fallbackDb.services[idx], ...updatedFields };
  callSaveFallback();
  return fallbackDb.services[idx];
}

export async function deleteService(id: string): Promise<boolean> {
  if (isConnected) {
    const res = await ServiceModel.deleteOne({ id } as any);
    return res.deletedCount > 0;
  }
  const idx = fallbackDb.services.findIndex((s: any) => s.id === id);
  if (idx === -1) return false;
  fallbackDb.services.splice(idx, 1);
  callSaveFallback();
  return true;
}

// BOOKINGS
export async function getBookings(): Promise<Booking[]> {
  if (isConnected) {
    return await BookingModel.find().sort({ createdAt: -1 } as any).lean();
  }
  return fallbackDb.bookings;
}

export async function addBooking(booking: Booking): Promise<Booking> {
  if (isConnected) {
    const newBooking = new BookingModel(booking);
    await newBooking.save();
    return newBooking.toObject();
  }
  fallbackDb.bookings.unshift(booking);
  callSaveFallback();
  return booking;
}

export async function updateBooking(id: string, updatedFields: Partial<Booking>): Promise<Booking | null> {
  if (isConnected) {
    const updated = await BookingModel.findOneAndUpdate({ id } as any, { $set: updatedFields } as any, { new: true } as any).lean();
    return updated as any;
  }
  const idx = fallbackDb.bookings.findIndex((b: any) => b.id === id);
  if (idx === -1) return null;
  fallbackDb.bookings[idx] = { ...fallbackDb.bookings[idx], ...updatedFields };
  callSaveFallback();
  return fallbackDb.bookings[idx];
}

// ORDERS
export async function getOrders(): Promise<Order[]> {
  if (isConnected) {
    return await OrderModel.find().sort({ createdAt: -1 } as any).lean();
  }
  return fallbackDb.orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isConnected) {
    return await OrderModel.findOne({ id } as any).lean();
  }
  return fallbackDb.orders.find((o: any) => o.id === id) || null;
}

export async function getOrdersByUserId(userId: string, email?: string): Promise<Order[]> {
  return getOrdersByUserIdOrEmail(userId, email);
}

export async function getOrdersByUserIdOrEmail(userId: string, email?: string): Promise<Order[]> {
  if (isConnected) {
    const queryConditions: any[] = [];
    if (userId) queryConditions.push({ userId });
    if (email && email.trim()) {
      const cleanEmail = email.trim();
      const escapedEmail = cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const emailRegex = new RegExp("^" + escapedEmail + "$", "i");
      queryConditions.push({ email: emailRegex });
      queryConditions.push({ customerEmail: emailRegex });
    }

    if (queryConditions.length === 0) return [];

    return await OrderModel.find({ $or: queryConditions } as any)
      .sort({ createdAt: -1 } as any)
      .lean();
  }

  const cleanEmail = email ? email.trim().toLowerCase() : "";
  return fallbackDb.orders
    .filter((o: any) => {
      const matchUser = userId && o.userId === userId;
      const matchEmail = cleanEmail && ((o.email && o.email.toLowerCase() === cleanEmail) || (o.customerEmail && o.customerEmail.toLowerCase() === cleanEmail));
      return matchUser || matchEmail;
    })
    .sort((a: any, b: any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
}

export async function addOrder(order: Order): Promise<Order> {
  if (isConnected) {
    const newOrder = new OrderModel(order);
    await newOrder.save();
    return newOrder.toObject();
  }
  fallbackDb.orders.unshift(order);
  callSaveFallback();
  return order;
}

export async function updateOrder(id: string, updatedFields: Partial<Order>): Promise<Order | null> {
  if (isConnected) {
    const updated = await OrderModel.findOneAndUpdate({ $or: [{ id }, { _id: id }] } as any, { $set: { ...updatedFields, updatedAt: new Date().toISOString() } } as any, { new: true } as any).lean();
    return updated as any;
  }
  const idx = fallbackDb.orders.findIndex((o: any) => o.id === id || o._id === id);
  if (idx === -1) return null;
  fallbackDb.orders[idx] = { ...fallbackDb.orders[idx], ...updatedFields, updatedAt: new Date().toISOString() };
  callSaveFallback();
  return fallbackDb.orders[idx];
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (isConnected) {
    const res = await OrderModel.deleteOne({ id } as any);
    return res.deletedCount > 0;
  }
  const idx = fallbackDb.orders.findIndex((o: any) => o.id === id);
  if (idx === -1) return false;
  fallbackDb.orders.splice(idx, 1);
  callSaveFallback();
  return true;
}

// REVIEWS
export async function getReviews(): Promise<Review[]> {
  if (isConnected) {
    return await ReviewModel.find().lean();
  }
  return fallbackDb.reviews;
}

// COLLECTED CASH
export async function getCollectedCash(): Promise<CollectedCash[]> {
  if (isConnected) {
    return await CollectedCashModel.find().lean();
  }
  return fallbackDb.collectedCash;
}

export async function addCollectedCash(cash: CollectedCash): Promise<CollectedCash> {
  if (isConnected) {
    const newCash = new CollectedCashModel(cash);
    await newCash.save();
    return newCash.toObject();
  }
  fallbackDb.collectedCash.unshift(cash);
  callSaveFallback();
  return cash;
}

// REALTIME DOCTOR-PATIENT CHAT
export async function getChatMessagesByAppointment(appointmentId: string) {
  if (isConnected) {
    return await (DoctorPatientChatMessageModel as any).find({ appointmentId }).sort({ createdAt: 1 }).lean();
  }
  if (!fallbackDb.chatMessages) fallbackDb.chatMessages = [];
  return fallbackDb.chatMessages
    .filter((m: any) => m.appointmentId === appointmentId)
    .sort((a: any, b: any) => new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime());
}

export async function addChatMessage(msgData: any) {
  if (isConnected) {
    const msg = new DoctorPatientChatMessageModel(msgData);
    await msg.save();
    return msg.toObject();
  }
  if (!fallbackDb.chatMessages) fallbackDb.chatMessages = [];
  fallbackDb.chatMessages.push(msgData);
  callSaveFallback();
  return msgData;
}

export async function markChatMessagesRead(appointmentId: string, senderRoleToMark: string) {
  if (isConnected) {
    await (DoctorPatientChatMessageModel as any).updateMany(
      { appointmentId, senderRole: senderRoleToMark, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );
    return true;
  }
  if (!fallbackDb.chatMessages) fallbackDb.chatMessages = [];
  fallbackDb.chatMessages.forEach((m: any) => {
    if (m.appointmentId === appointmentId && m.senderRole === senderRoleToMark) {
      m.status = 'read';
    }
  });
  callSaveFallback();
  return true;
}

export async function getAllChatConversations() {
  if (isConnected) {
    const messages = await DoctorPatientChatMessageModel.find().sort({ createdAt: -1 }).lean();
    const map = new Map<string, any>();
    for (const msg of messages) {
      if (!map.has(msg.appointmentId)) {
        map.set(msg.appointmentId, {
          appointmentId: msg.appointmentId,
          patientName: msg.patientName,
          doctorName: msg.doctorName || "Nivora DHA Specialist",
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unreadCount: messages.filter(m => m.appointmentId === msg.appointmentId && m.senderRole === 'patient' && m.status !== 'read').length,
          status: 'Active'
        });
      }
    }
    return Array.from(map.values());
  }
  if (!fallbackDb.chatMessages) fallbackDb.chatMessages = [];
  const map = new Map<string, any>();
  const sorted = [...fallbackDb.chatMessages].sort((a: any, b: any) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());
  for (const msg of sorted) {
    if (!map.has(msg.appointmentId)) {
      map.set(msg.appointmentId, {
        appointmentId: msg.appointmentId,
        patientName: msg.patientName,
        doctorName: msg.doctorName || "Nivora DHA Specialist",
        lastMessage: msg.text,
        lastMessageTime: msg.timestamp,
        unreadCount: fallbackDb.chatMessages.filter((m: any) => m.appointmentId === msg.appointmentId && m.senderRole === 'patient' && m.status !== 'read').length,
        status: 'Active'
      });
    }
  }
  return Array.from(map.values());
}

// DOCTORS CRUD METHODS
export async function getDoctors(): Promise<any[]> {
  if (isConnected) {
    try {
      return await DoctorModel.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("MongoDB getDoctors failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  return fallbackDb.doctors;
}

export async function getDoctorById(id: string): Promise<any | null> {
  if (isConnected) {
    try {
      return await DoctorModel.findOne({ id } as any).lean();
    } catch (e) {
      console.warn("MongoDB getDoctorById failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  return fallbackDb.doctors.find((d: any) => d.id === id) || null;
}

export async function findDoctorByEmail(email: string): Promise<any | null> {
  if (!email) return null;
  const targetEmail = email.trim().toLowerCase();
  if (isConnected) {
    try {
      return await DoctorModel.findOne({ email: new RegExp(`^${targetEmail}$`, "i") } as any).lean();
    } catch (e) {
      console.warn("MongoDB findDoctorByEmail failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  return fallbackDb.doctors.find((d: any) => d.email && d.email.toLowerCase() === targetEmail) || null;
}

export async function addDoctor(doctor: any): Promise<any> {
  if (isConnected) {
    try {
      const newDoc = new DoctorModel(doctor);
      await newDoc.save();
      return newDoc.toObject();
    } catch (e) {
      console.warn("MongoDB addDoctor failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  fallbackDb.doctors.unshift(doctor);
  callSaveFallback();
  return doctor;
}

export async function updateDoctor(id: string, updatedFields: Partial<any>): Promise<any | null> {
  if (isConnected) {
    try {
      const updated = await DoctorModel.findOneAndUpdate({ id } as any, { $set: updatedFields } as any, { new: true } as any).lean();
      return updated;
    } catch (e) {
      console.warn("MongoDB updateDoctor failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  const idx = fallbackDb.doctors.findIndex((d: any) => d.id === id);
  if (idx === -1) return null;
  fallbackDb.doctors[idx] = { ...fallbackDb.doctors[idx], ...updatedFields };
  callSaveFallback();
  return fallbackDb.doctors[idx];
}

export async function deleteDoctor(id: string): Promise<boolean> {
  if (isConnected) {
    try {
      const res = await DoctorModel.deleteOne({ id } as any);
      return res.deletedCount > 0;
    } catch (e) {
      console.warn("MongoDB deleteDoctor failed, falling back to local memory storage:", e);
    }
  }
  if (!fallbackDb.doctors) fallbackDb.doctors = [];
  const idx = fallbackDb.doctors.findIndex((d: any) => d.id === id);
  if (idx === -1) return false;
  fallbackDb.doctors.splice(idx, 1);
  callSaveFallback();
  return true;
}
