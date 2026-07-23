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
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const OrderItemSchema = new Schema({
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true }
}, { _id: false });

const OrderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  date: { type: String, required: true },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Refunded'], default: 'Paid' }
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

// Models
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const ServiceModel = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export const CollectedCashModel = mongoose.models.CollectedCash || mongoose.model("CollectedCash", CollectedCashSchema);
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

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
    return await UserModel.find().lean();
  }
  return fallbackDb.users;
}

export async function findUserByEmail(email: string): Promise<any | null> {
  if (isConnected) {
    return await UserModel.findOne({ email } as any).lean();
  }
  return fallbackDb.users.find((u: any) => u.email === email) || null;
}

export async function addUser(user: any): Promise<any> {
  if (isConnected) {
    const newUser = new UserModel(user);
    await newUser.save();
    return newUser.toObject();
  }
  fallbackDb.users.push(user);
  callSaveFallback();
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
    return await OrderModel.find().lean();
  }
  return fallbackDb.orders;
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
