import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Category, Service, Booking, Order, CollectedCash, Review } from "./src/types";
import {
  initDatabase,
  isMongoConnected,
  getUsers,
  findUserByEmail,
  addUser,
  deleteUser,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getServices,
  findServiceById,
  addService,
  updateService,
  deleteService,
  getBookings,
  addBooking,
  updateBooking,
  getOrders,
  addOrder,
  getReviews,
  getCollectedCash,
  addCollectedCash
} from "./server-mongodb";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// Path to data store file
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Types for DB
interface Database {
  users: any[];
  categories: Category[];
  services: Service[];
  bookings: Booking[];
  orders: Order[];
  reviews: Review[];
  collectedCash: CollectedCash[];
}

// Initial Seeding Data
const initialCategories: Category[] = [
  {
    id: "CAT-0021",
    name: "Dental Care",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=300&q=80",
    description: "Comprehensive oral health services including cleanings, fillings, checkups, and hygiene instructions.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0022",
    name: "Mental Health",
    image: "https://images.unsplash.com/photo-1527137341206-1a2ab2b14fca?auto=format&fit=crop&w=300&q=80",
    description: "Psychological counseling, therapy, and cognitive support to enhance mental well-being and emotional stability.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0023",
    name: "Cardiology",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80",
    description: "Heart screening, diagnostic imaging, and consultation for maintaining cardiovascular strength.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0024",
    name: "Physiotherapy",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80",
    description: "In-home rehabilitation sessions, stretching programs, and kinetic therapies designed to restore natural physical mobility.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0025",
    name: "Diagnostics",
    image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=300&q=80",
    description: "Premium laboratory panel testing, urine analysis, and home blood draw services.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0026",
    name: "Nurse Care",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80",
    description: "Clinical nursing at home, post-surgical support, IV therapy, injection administration, and clinical diagnostics.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0027",
    name: "Elder Care",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80",
    description: "Assisted living support, daily vitals tracking, medication management, and companion assistance for seniors.",
    createdAt: new Date().toISOString()
  }
];

const initialServices: Service[] = [
  {
    id: "SRV-1001",
    name: "General Dental Checkup",
    categoryId: "CAT-0021",
    categoryName: "Dental Care",
    shortDescription: "Complete oral examination and scaling by a professional dentist.",
    longDescription: "Get a premium in-home or in-clinic general dental examination. This package includes high-contrast visual exams, tartar cleaning (scaling), polishing, and structured lifestyle recommendations for optimal long-term oral hygiene. Highly recommended every 6 months.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 350,
    sellingPrice: 250,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 42
  },
  {
    id: "SRV-1002",
    name: "Comprehensive Lab Panel",
    categoryId: "CAT-0025",
    categoryName: "Diagnostics",
    shortDescription: "DHA-certified nurse home collection covering 85 essential biomarkers.",
    longDescription: "The ultimate wellness tracker covering complete metabolic rate, kidney profiles, lipid profiles, thyroid parameters, liver performance, and vital blood elements. Collected by a DHA-certified specialist with highly accurate laboratory diagnostic reports returned securely within 24 hours.",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 625,
    sellingPrice: 499,
    genderFocus: "All Genders",
    ageGroup: "18+",
    vitalTrackingRequired: ["Glucose", "BP", "Pulse"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 124
  },
  {
    id: "SRV-1003",
    name: "Physician Home Visit",
    categoryId: "CAT-0026",
    categoryName: "Nurse Care",
    shortDescription: "DHA-licensed general practitioner home assessment.",
    longDescription: "Enjoy absolute convenience and personal clinical attention with a fully qualified, DHA-licensed General Practitioner visiting your home. Perfect for complete physiological evaluations, diagnostic screenings, acute disease checkups, and prescription issuances in the safety of your home.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 500,
    sellingPrice: 350,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse", "Glucose", "Weight"],
    status: "Active",
    rating: 4.8,
    reviewsCount: 88
  },
  {
    id: "SRV-1004",
    name: "Advanced Physiotherapy",
    categoryId: "CAT-0024",
    categoryName: "Physiotherapy",
    shortDescription: "Personalized motor-function rehabilitation session at home.",
    longDescription: "A specialized one-on-one session with a premium licensed physiotherapist focusing on structural kinetic exercises, pain management, joint mobilizations, and full motor-function restoration. Highly effective for persistent back pain, neck pain, stiffness, or active athletic recoveries.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 400,
    sellingPrice: 280,
    genderFocus: "All Genders",
    ageGroup: "18+",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 61
  },
  {
    id: "SRV-1005",
    name: "Full Body Checkup",
    categoryId: "CAT-0025",
    categoryName: "Diagnostics",
    shortDescription: "Essential general wellness and metabolic blood screening.",
    longDescription: "A balanced health audit detailing fundamental biochemical elements including glucose level, blood cell counts, basic lipid percentages, and kidney status trackers. Excellent starting indicator for general physical wellness.",
    image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 200,
    sellingPrice: 129,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["Glucose", "BP"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 74
  },
  {
    id: "SRV-1006",
    name: "Diabetes Screening",
    categoryId: "CAT-0025",
    categoryName: "Diagnostics",
    shortDescription: "HbA1c & Fasting Blood Sugar tracking to audit diabetic health.",
    longDescription: "Essential test to monitor and detect diabetes early. Includes HbA1c (Average 3-month blood sugar levels) and Fasting Blood Glucose, with professional interpretation and guidelines for metabolic support.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 99,
    sellingPrice: 49,
    genderFocus: "All Genders",
    ageGroup: "18+",
    vitalTrackingRequired: ["Glucose"],
    status: "Active",
    rating: 4.8,
    reviewsCount: 39
  },
  {
    id: "SRV-1007",
    name: "Thyroid Profile",
    categoryId: "CAT-0025",
    categoryName: "Diagnostics",
    shortDescription: "TSH, Free T3, and Free T4 hormone measurement panel.",
    longDescription: "Comprehensive test measuring Thyroid Stimulating Hormone (TSH), Free T3, and Free T4 to thoroughly analyze and diagnose hypo- or hyperthyroid functions. Crucial for understanding fatigue, metabolism, and hormonal balances.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 120,
    sellingPrice: 75,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 22
  },
  {
    id: "SRV-1008",
    name: "Vitamin D Test",
    categoryId: "CAT-0025",
    categoryName: "Diagnostics",
    shortDescription: "25-Hydroxy Vitamin D level check to examine bone and immunity strength.",
    longDescription: "Tracks active levels of Vitamin D (25-Hydroxy) to verify bone Density, muscular resilience, joint pain causes, and immune capabilities. Includes clinical dose feedback.",
    image: "https://images.unsplash.com/photo-1616671285420-94d30623a854?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 90,
    sellingPrice: 55,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP"],
    status: "Active",
    rating: 4.7,
    reviewsCount: 56
  },
  {
    id: "SRV-1009",
    name: "Post-Surgical Rehab",
    categoryId: "CAT-0024",
    categoryName: "Physiotherapy",
    shortDescription: "Specialized in-home therapeutic recovery following surgeries.",
    longDescription: "Targeted physical therapy to safely recover mobility, strength, and stamina post-orthopedic or general surgery. Led by a clinical specialist with customized range-of-motion progressions.",
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 150,
    sellingPrice: 85,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 33
  },
  {
    id: "SRV-1010",
    name: "Back Pain Relief Session",
    categoryId: "CAT-0024",
    categoryName: "Physiotherapy",
    shortDescription: "Targeted lumbar release and postural realignment program.",
    longDescription: "A specialized physical care layout to address lower back pain, sciatica, and postural tension. Integrates manual mobilization techniques, therapeutic stretching, and core stability feedback.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 110,
    sellingPrice: 70,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP"],
    status: "Active",
    rating: 4.6,
    reviewsCount: 45
  },
  {
    id: "SRV-1011",
    name: "Daily Vitals Check",
    categoryId: "CAT-0026",
    categoryName: "Nurse Care",
    shortDescription: "Structured tracking of blood pressure, pulse, oxygen, and glucose.",
    longDescription: "An in-home visit by a certified auxiliary nurse to carefully measure, record, and log cardiovascular and metabolic vitals. Ideal for keeping a highly reliable, continuous clinic record for elder or post-surgical patients.",
    image: "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 60,
    sellingPrice: 40,
    genderFocus: "All Genders",
    ageGroup: "Seniors",
    vitalTrackingRequired: ["BP", "Pulse", "Glucose"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 19
  },
  {
    id: "SRV-1012",
    name: "Post-Operative Care",
    categoryId: "CAT-0026",
    categoryName: "Nurse Care",
    shortDescription: "Complete clinical home assistance covering dressings and medications.",
    longDescription: "Professional nurse monitoring including surgical dressing changes, medication schedules, pain administration, hydration checks, and vitals recording under the supervision of a clinical lead doctor.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 180,
    sellingPrice: 110,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse", "Glucose"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 28
  }
];

// Load database from file or use default
function loadDB(): Database {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading database file, resetting to defaults", e);
    }
  }

  const db: Database = {
    users: [],
    categories: initialCategories,
    services: initialServices,
    bookings: [
      {
        id: "#BOOK-9921",
        serviceId: "SRV-1003",
        serviceName: "Physician Home Visit",
        categoryName: "Nurse Care",
        date: "2026-07-20",
        time: "10:00 AM",
        slot: "Morning",
        bookingForSomeoneElse: false,
        patientDetails: {
          firstName: "Sarah",
          lastName: "Jenkins",
          email: "sarah@example.com",
          phone: "+971 50 123 4567",
          dob: "1990-05-15",
          relation: "Self",
          gender: "Female"
        },
        status: "Confirmed",
        price: 350,
        createdAt: new Date().toISOString()
      },
      {
        id: "#BOOK-9922",
        serviceId: "SRV-1001",
        serviceName: "General Dental Checkup",
        categoryName: "Dental Care",
        date: "2026-07-21",
        time: "02:00 PM",
        slot: "Afternoon",
        bookingForSomeoneElse: false,
        patientDetails: {
          firstName: "Marcus",
          lastName: "Thorne",
          email: "marcus@example.com",
          phone: "+971 50 765 4321",
          dob: "1985-11-20",
          relation: "Self",
          gender: "Male"
        },
        status: "Pending",
        price: 250,
        createdAt: new Date().toISOString()
      }
    ],
    orders: [
      {
        id: "#ORD-9921",
        customerName: "Sarah Jenkins",
        customerEmail: "sarah@example.com",
        items: [
          {
            serviceId: "SRV-1003",
            serviceName: "Physician Home Visit",
            price: 350,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80"
          }
        ],
        date: "Oct 12, 2023",
        total: 350,
        paymentStatus: "Paid"
      },
      {
        id: "#ORD-9922",
        customerName: "Marcus Thorne",
        customerEmail: "marcus@example.com",
        items: [
          {
            serviceId: "SRV-1001",
            serviceName: "General Dental Checkup",
            price: 250,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=80"
          }
        ],
        date: "Oct 12, 2023",
        total: 250,
        paymentStatus: "Unpaid"
      },
      {
        id: "#ORD-9923",
        customerName: "Elena Rodriguez",
        customerEmail: "elena@example.com",
        items: [
          {
            serviceId: "SRV-1002",
            serviceName: "Comprehensive Lab Panel",
            price: 499,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&w=500&q=80"
          }
        ],
        date: "Oct 11, 2023",
        total: 499,
        paymentStatus: "Refunded"
      }
    ],
    reviews: [
      {
        id: "REV-2001",
        serviceId: "SRV-1002",
        serviceName: "Comprehensive Lab Panel",
        userName: "Ahmed Al Mansoori",
        rating: 5,
        comment: "Excellent service! The nurse was very professional and gentle. Reports were delivered in less than 12 hours.",
        date: "2026-07-01"
      }
    ],
    collectedCash: [
      {
        id: "CASH-3001",
        bookingId: "#BOOK-9921",
        amount: 350,
        collectedBy: "Admin User",
        date: "Oct 12, 2023",
        notes: "Cash collected at home visit"
      }
    ]
  };

  saveDB(db);
  return db;
}

function saveDB(db: Database) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

let db = loadDB();

// API ROUTES

// AUTHENTICATION
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Clean, fast authentication for mock purposes
  if (email === "nivora@gmail.com" && password === "nivora") {
    return res.json({
      success: true,
      role: "Super Admin",
      token: "mock-jwt-token-admin",
      user: {
        id: "USR-001",
        firstName: "Admin",
        lastName: "User",
        email: email,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      }
    });
  }

  // Find user in db
  const user = await findUserByEmail(email);
  if (user && password === "password") {
    return res.json({
      success: true,
      role: "User",
      token: "mock-jwt-token-user",
      user: user
    });
  }

  // Dynamic user creation if not found for testing flow
  if (email && password) {
    const newUser = {
      id: "USR-" + Math.floor(Math.random() * 10000),
      firstName: email.split("@")[0],
      lastName: "Doe",
      email: email,
      phone: "+1 (555) 000-0000"
    };
    await addUser(newUser);
    return res.json({
      success: true,
      role: "User",
      token: "mock-jwt-token-user",
      user: newUser
    });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const newUser = {
    id: "USR-" + Math.floor(Math.random() * 10000),
    firstName,
    lastName,
    email,
    phone: phone || "+1 (555) 000-0000"
  };
  await addUser(newUser);

  return res.json({
    success: true,
    user: newUser,
    token: "mock-jwt-token-user"
  });
});

// USERS MANAGEMENT
app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const success = await deleteUser(req.params.id);
    if (success) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

// CATEGORIES
app.get("/api/categories", async (req, res) => {
  const categories = await getCategories();
  res.json(categories);
});

app.post("/api/categories", async (req, res) => {
  const { name, image, description } = req.body;
  const currentCats = await getCategories();
  const maxCatIdNum = currentCats.reduce((max, c) => {
    const num = parseInt(c.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 20);

  const newCat: Category = {
    id: "CAT-" + String(maxCatIdNum + 1).padStart(4, "0"),
    name,
    image: image || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=300&q=80",
    description,
    createdAt: new Date().toISOString()
  };
  await addCategory(newCat);
  res.json(newCat);
});

// FILE UPLOAD ENDPOINT
app.post("/api/upload", (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ success: false, message: "Missing file name or data" });
    }

    // data is a base64 encoded string: "data:image/jpeg;base64,..."
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: "Invalid base64 format" });
    }

    const buffer = Buffer.from(matches[2], "base64");

    // Let's create a unique file name
    const ext = name.split(".").pop() || "png";
    const fileName = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Also write to dist/uploads if dist exists so it displays on production instantly without rebuilding
    const distUploadDir = path.join(process.cwd(), "dist", "uploads");
    if (fs.existsSync(path.join(process.cwd(), "dist"))) {
      if (!fs.existsSync(distUploadDir)) {
        fs.mkdirSync(distUploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(distUploadDir, fileName), buffer);
    }

    return res.json({
      success: true,
      url: `/uploads/${fileName}`
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to upload file" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const updated = await updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Category not found" });
  res.json(updated);
});

app.delete("/api/categories/:id", async (req, res) => {
  const deleted = await deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  res.json({ success: true });
});
// SERVICES
app.get("/api/services", async (req, res) => {
  const services = await getServices();
  res.json(services);
});

app.get("/api/services/:id", async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json(service);
});

app.post("/api/services", async (req, res) => {
  const { name, categoryId, shortDescription, longDescription, mrpPrice, sellingPrice, genderFocus, ageGroup, vitalTrackingRequired, image } = req.body;
  const categories = await getCategories();
  const category = categories.find(c => c.id === categoryId);
  const currentSrvs = await getServices();
  const maxServiceIdNum = currentSrvs.reduce((max, s) => {
    const num = parseInt(s.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 1000);
  
  const newSrv: Service = {
    id: "SRV-" + (maxServiceIdNum + 1),
    name,
    categoryId,
    categoryName: category ? category.name : "General",
    shortDescription,
    longDescription,
    image: image || "https://images.unsplash.com/photo-1504813184591-015556c5c528?auto=format&fit=crop&w=500&q=80",
    mrpPrice: Number(mrpPrice) || Number(sellingPrice) || 100,
    sellingPrice: Number(sellingPrice) || 100,
    genderFocus: genderFocus || "All Genders",
    ageGroup: ageGroup || "18+",
    vitalTrackingRequired: vitalTrackingRequired || [],
    status: "Active",
    rating: 5.0,
    reviewsCount: 0
  };
  await addService(newSrv);
  res.json(newSrv);
});

app.put("/api/services/:id", async (req, res) => {
  const updated = await updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Service not found" });
  res.json(updated);
});

app.delete("/api/services/:id", async (req, res) => {
  const deleted = await deleteService(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Service not found" });
  res.json({ success: true });
});

// BOOKINGS
app.get("/api/bookings", async (req, res) => {
  const bookings = await getBookings();
  res.json(bookings);
});

app.post("/api/bookings", async (req, res) => {
  const { serviceId, date, time, slot, bookingForSomeoneElse, patientDetails, notes } = req.body;
  const srv = await findServiceById(serviceId);
  if (!srv) return res.status(404).json({ message: "Service not found" });

  const currentBookings = await getBookings();
  const maxBookingIdNum = currentBookings.reduce((max, b) => {
    const num = parseInt(b.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 9920);

  const newBooking: Booking = {
    id: "#BOOK-" + (maxBookingIdNum + 1),
    serviceId,
    serviceName: srv.name,
    categoryName: srv.categoryName,
    date,
    time,
    slot,
    bookingForSomeoneElse: !!bookingForSomeoneElse,
    patientDetails,
    notes,
    status: "Pending",
    price: srv.sellingPrice,
    createdAt: new Date().toISOString()
  };

  await addBooking(newBooking);

  // Auto-generate corresponding Order & Cash Collected for integrated completeness!
  const currentOrders = await getOrders();
  const newOrder: Order = {
    id: "#ORD-" + (currentOrders.length + 9921),
    customerName: `${patientDetails.firstName} ${patientDetails.lastName}`,
    customerEmail: patientDetails.email,
    items: [
      {
        serviceId: srv.id,
        serviceName: srv.name,
        price: srv.sellingPrice,
        quantity: 1,
        image: srv.image
      }
    ],
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    total: srv.sellingPrice,
    paymentStatus: "Paid"
  };
  await addOrder(newOrder);

  // Log as Collected Cash
  const currentCash = await getCollectedCash();
  const maxCashIdNum = currentCash.reduce((max, c) => {
    const num = parseInt(c.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 3000);

  const newCash: CollectedCash = {
    id: "CASH-" + (maxCashIdNum + 1),
    bookingId: newBooking.id,
    orderId: newOrder.id,
    amount: srv.sellingPrice,
    collectedBy: "Home Healthcare Agent",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    notes: `Home booking collection for ${srv.name}`
  };
  await addCollectedCash(newCash);

  res.json(newBooking);
});

app.put("/api/bookings/:id", async (req, res) => {
  const updated = await updateBooking(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Booking not found" });
  res.json(updated);
});

// ORDERS
app.get("/api/orders", async (req, res) => {
  const orders = await getOrders();
  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  const { customerName, customerEmail, items, total } = req.body;
  const currentOrders = await getOrders();
  const maxOrderIdNum = currentOrders.reduce((max, o) => {
    const num = parseInt(o.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 9920);

  const newOrder: Order = {
    id: "#ORD-" + (maxOrderIdNum + 1),
    customerName,
    customerEmail,
    items,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    total,
    paymentStatus: "Paid"
  };

  await addOrder(newOrder);

  // Add to cash collected
  const currentCash = await getCollectedCash();
  const newCash: CollectedCash = {
    id: "CASH-" + (currentCash.length + 3001),
    orderId: newOrder.id,
    amount: total,
    collectedBy: "Online Gateway",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    notes: `Cart order checkout`
  };
  await addCollectedCash(newCash);

  res.json(newOrder);
});

// REVIEWS
app.get("/api/reviews", async (req, res) => {
  const reviews = await getReviews();
  res.json(reviews);
});

// COLLECTED CASH
app.get("/api/collected-cash", async (req, res) => {
  const cash = await getCollectedCash();
  res.json(cash);
});

async function startServer() {
  // Initialize the database layer (connects to MongoDB if configured, otherwise falls back)
  await initDatabase(db, () => saveDB(db));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nivora Healthcare Server running on http://localhost:${PORT}`);
  });
}

startServer();
