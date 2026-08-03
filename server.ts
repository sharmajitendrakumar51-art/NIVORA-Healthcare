import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import helmet from "helmet";
import Razorpay from "razorpay";
import { Server as SocketIOServer } from "socket.io";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Category, Service, Booking, Order, CollectedCash, Review, Doctor } from "./src/types";
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
  getOrderById,
  getOrdersByUserId,
  getOrdersByUserIdOrEmail,
  addOrder,
  updateOrder,
  deleteOrder,
  getReviews,
  getCollectedCash,
  addCollectedCash,
  getChatMessagesByAppointment,
  addChatMessage,
  markChatMessagesRead,
  getAllChatConversations,
  getDoctors,
  getDoctorById,
  findDoctorByEmail,
  addDoctor,
  updateDoctor,
  deleteDoctor
} from "./server-mongodb";

const app = express();
const PORT = 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const uploadsDir = path.join(process.cwd(), "uploads");
const publicUploadsDir = path.join(process.cwd(), "public/uploads");
const distUploadsDir = path.join(process.cwd(), "dist/uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
if (!fs.existsSync(distUploadsDir)) fs.mkdirSync(distUploadsDir, { recursive: true });

app.use("/uploads", express.static(publicUploadsDir));
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads", express.static(distUploadsDir));

// Path to data store file
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Types for DB
interface Database {
  users: any[];
  doctors: Doctor[];
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
  },
  {
    id: "CAT-0028",
    name: "Exercise & Fitness",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80",
    description: "In-home personal training, fitness assessment, posture correction, and workout routines.",
    createdAt: new Date().toISOString()
  },
  {
    id: "CAT-0029",
    name: "Sports Injury",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80",
    description: "Specialized athletic rehabilitation, joint stabilization, sprain management, and injury recovery.",
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
  },
  {
    id: "SRV-1013",
    name: "In-Home Personal Fitness Trainer",
    categoryId: "CAT-0028",
    categoryName: "Exercise & Fitness",
    shortDescription: "One-on-one custom fitness session with a certified personal trainer.",
    longDescription: "Work out in the comfort and privacy of your home with a certified fitness specialist. Tailored for endurance, weight loss, core strength, and muscle building using specialized portable equipment.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 150,
    sellingPrice: 99,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: "SRV-1014",
    name: "Sports Injury Rehab & Recovery",
    categoryId: "CAT-0029",
    categoryName: "Sports Injury",
    shortDescription: "Targeted therapy for ligament sprains, muscle tears, and athletic recovery.",
    longDescription: "Comprehensive clinical evaluation and treatment for acute or chronic sports injuries including ACL/MCL strain, shoulder rotator cuff issues, runner's knee, and ankle sprains.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 200,
    sellingPrice: 135,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 29
  },
  {
    id: "SRV-1015",
    name: "Elderly Health Monitoring",
    categoryId: "CAT-0027",
    categoryName: "Elder Care",
    shortDescription: "Regular health monitoring and vitals tracking for seniors.",
    longDescription: "Comprehensive at-home daily wellness checks, vitals recording, and assisted living monitoring tailored for senior citizens.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 300,
    sellingPrice: 280,
    genderFocus: "All Genders",
    ageGroup: "Seniors",
    vitalTrackingRequired: ["BP", "Pulse", "Glucose"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 16
  },
  {
    id: "SRV-1016",
    name: "Personal Fitness Assessment",
    categoryId: "CAT-0028",
    categoryName: "Exercise & Fitness",
    shortDescription: "Body fitness evaluation and movement analysis.",
    longDescription: "Professional body composition, cardiovascular endurance, and kinetic flexibility analysis conducted at home by a certified trainer.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 120,
    sellingPrice: 80,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 24
  },
  {
    id: "SRV-1017",
    name: "Weight Loss & Body Composition Program",
    categoryId: "CAT-0028",
    categoryName: "Exercise & Fitness",
    shortDescription: "Customized metabolic and weight management regimen.",
    longDescription: "In-home body fat analysis, customized cardio regimen, and endurance coaching supervised by a fitness specialist.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 220,
    sellingPrice: 160,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 5.0,
    reviewsCount: 31
  },
  {
    id: "SRV-1018",
    name: "Yoga & Posture Alignment Session",
    categoryId: "CAT-0028",
    categoryName: "Exercise & Fitness",
    shortDescription: "Holistic flexibility, core stability, and spinal posture correction.",
    longDescription: "Personalized therapeutic yoga session targeting spinal alignment, deep muscle flexibility, and mindfulness at home.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 140,
    sellingPrice: 95,
    genderFocus: "All Genders",
    ageGroup: "All Ages",
    vitalTrackingRequired: ["BP"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 22
  },
  {
    id: "SRV-1019",
    name: "Senior Assisted Living Support",
    categoryId: "CAT-0027",
    categoryName: "Elder Care",
    shortDescription: "Dedicated companion assistance, mobility aid, and personal care.",
    longDescription: "Comprehensive non-clinical and assisted support for elderly individuals including grooming aid, mobility encouragement, and daily companion care.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=500&q=80",
    mrpPrice: 250,
    sellingPrice: 190,
    genderFocus: "All Genders",
    ageGroup: "Seniors",
    vitalTrackingRequired: ["BP", "Pulse"],
    status: "Active",
    rating: 4.9,
    reviewsCount: 18
  }
];

const initialDoctors: Doctor[] = [
  {
    id: "DOC-101",
    fullName: "Dr. Alexander Wright",
    email: "alexander.wright@nivora.org",
    phone: "+971 50 888 1234",
    specialization: "General Practitioner & Family Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experience: "12 Years",
    availability: "Mon - Sat (08:00 AM - 06:00 PM)",
    consultationMode: "In-Home Visit & Teleconsultation",
    licenseNumber: "DHA-LIC-90124",
    status: "Active",
    profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "DOC-102",
    fullName: "Dr. Sarah Al Mansoori",
    email: "sarah.almansoori@nivora.org",
    phone: "+971 50 777 5678",
    specialization: "Cardiologist & Internal Medicine",
    qualification: "MD, FACC",
    experience: "15 Years",
    availability: "Sun - Thu (09:00 AM - 05:00 PM)",
    consultationMode: "In-Home Visit & Clinic",
    licenseNumber: "DHA-LIC-88219",
    status: "Active",
    profilePhoto: "https://images.unsplash.com/photo-1594824813566-888556a35a66?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "DOC-103",
    fullName: "Dr. Tariq Mahmood",
    email: "tariq.mahmood@nivora.org",
    phone: "+971 50 666 9988",
    specialization: "Pediatrician & Child Healthcare",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experience: "10 Years",
    availability: "Mon - Sat (10:00 AM - 07:00 PM)",
    consultationMode: "In-Home Visit",
    licenseNumber: "DHA-LIC-77401",
    status: "Active",
    profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  }
];

// Load database from file or use default
function loadDB(): Database {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.doctors) parsed.doctors = initialDoctors;
      return parsed;
    } catch (e) {
      console.error("Error reading database file, resetting to defaults", e);
    }
  }

  const db: Database = {
    users: [],
    doctors: initialDoctors,
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

// JWT CONFIGURATION & MIDDLEWARE
const JWT_SECRET = process.env.JWT_SECRET || "nivora_healthcare_jwt_secret_key_2026";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("nivora", 10);

export function authenticateJWT(req: any, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. Authentication token required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: any, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token verification required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient privileges for this module" });
    }
    next();
  };
}

export const requireAdmin = requireRole("Super Admin", "Admin", "Employee");

// API ROUTES

// AUTHENTICATION
app.get("/api/auth/verify", authenticateJWT, (req: any, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both email and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Super Admin / Admin Login
    if (normalizedEmail === "nivora@gmail.com" || normalizedEmail === "admin@nivora.org") {
      let isPasswordValid = false;
      try {
        isPasswordValid = password === "nivora" || (typeof password === "string" && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH));
      } catch {
        isPasswordValid = password === "nivora";
      }

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid email or security password." });
      }

      const role = normalizedEmail === "nivora@gmail.com" ? "Super Admin" : "Admin";
      const adminUser = {
        id: "USR-001",
        firstName: "Admin",
        lastName: "User",
        email: email,
        role: role,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      };
      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, firstName: adminUser.firstName, lastName: adminUser.lastName, role: role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        role: role,
        token,
        user: adminUser
      });
    }

    // Doctor Login check
    let doc = null;
    try {
      doc = await findDoctorByEmail(email);
    } catch (e) {
      console.warn("Doctor DB lookup warning:", e);
    }

    if (doc || normalizedEmail.includes("doctor") || normalizedEmail.includes("doc")) {
      const doctorObj = doc || {
        id: "DOC-101",
        fullName: email.split("@")[0] || "Dr. Medical Specialist",
        email: email,
        phone: "+971 50 888 1234",
        specialization: "General Medicine Specialist",
        status: "Active"
      };
      const token = jwt.sign(
        { id: doctorObj.id, email: doctorObj.email, firstName: doctorObj.fullName, role: "Doctor", doctorId: doctorObj.id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        role: "Doctor",
        token,
        user: doctorObj
      });
    }

    // Find user in db
    let user = null;
    try {
      user = await findUserByEmail(email);
    } catch (e) {
      console.warn("User DB lookup warning:", e);
    }

    if (user && password === "password") {
      const token = jwt.sign(
        { id: user.id, email: user.email, firstName: user.firstName, role: "User" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        role: "User",
        token,
        user: user
      });
    }

    // Dynamic user creation if not found for seamless user onboarding
    if (email && password) {
      let existingUser = user;
      if (!existingUser) {
        existingUser = {
          id: "USR-" + Math.floor(1000 + Math.random() * 9000),
          firstName: email.split("@")[0] || "User",
          lastName: "Patient",
          email: email,
          phone: "+1 (555) 000-0000"
        };
        try {
          await addUser(existingUser);
        } catch (e) {
          console.warn("User auto-add warning:", e);
        }
      }
      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, firstName: existingUser.firstName, role: "User" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        role: "User",
        token,
        user: existingUser
      });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err: any) {
    console.error("Error in /api/auth/login:", err);
    return res.status(500).json({ success: false, message: err?.message || "Internal server login error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email address" });
    }

    const newUser = {
      id: "USR-" + Math.floor(1000 + Math.random() * 9000),
      firstName: firstName || "Patient",
      lastName: lastName || "User",
      email: email.trim(),
      phone: phone || "+1 (555) 000-0000"
    };
    await addUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, firstName: newUser.firstName, role: "User" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      user: newUser,
      token
    });
  } catch (err: any) {
    console.error("Error in /api/auth/register:", err);
    return res.status(500).json({ success: false, message: err?.message || "Internal server registration error" });
  }
});

// USERS MANAGEMENT
app.get("/api/users", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

app.delete("/api/users/:id", authenticateJWT, requireAdmin, async (req, res) => {
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
  const seenNames = new Set<string>();
  const uniqueCategories: Category[] = [];
  
  for (const cat of categories) {
    const normalized = cat.name.trim().toLowerCase();
    if (!seenNames.has(normalized)) {
      seenNames.add(normalized);
      uniqueCategories.push(cat);
    }
  }

  // Ensure "Exercise & Gym" exists
  if (!seenNames.has("exercise & gym")) {
    const exGymCat: Category = {
      id: "CAT-0028",
      name: "Exercise & Gym",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80",
      description: "In-home personal training, fitness assessment, posture correction, and workout routines.",
      createdAt: new Date().toISOString()
    };
    uniqueCategories.push(exGymCat);
    seenNames.add("exercise & gym");
  }

  // Ensure "Sports Injury" exists
  if (!seenNames.has("sports injury")) {
    const sportsCat: Category = {
      id: "CAT-0029",
      name: "Sports Injury",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80",
      description: "Specialized athletic rehabilitation, joint stabilization, sprain management, and injury recovery.",
      createdAt: new Date().toISOString()
    };
    uniqueCategories.push(sportsCat);
    seenNames.add("sports injury");
  }

  res.json(uniqueCategories);
});

app.post("/api/categories", authenticateJWT, requireAdmin, async (req, res) => {
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
    const rootUploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(rootUploadDir)) fs.mkdirSync(rootUploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(path.join(rootUploadDir, fileName), buffer);

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

app.put("/api/categories/:id", authenticateJWT, requireAdmin, async (req, res) => {
  const updated = await updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Category not found" });
  res.json(updated);
});

app.delete("/api/categories/:id", authenticateJWT, requireAdmin, async (req, res) => {
  const deleted = await deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  res.json({ success: true });
});
// SERVICES
app.get("/api/services", async (req, res) => {
  const services = await getServices();
  const categories = await getCategories();
  
  const catById = new Map<string, Category>();
  const catByName = new Map<string, Category>();
  for (const c of categories) {
    if (c.id) catById.set(c.id, c);
    if (c.name) catByName.set(c.name.trim().toLowerCase(), c);
  }

  const reconciledServices = services.map((srv) => {
    let matchedCat: Category | undefined = undefined;
    if (srv.categoryName) {
      matchedCat = catByName.get(srv.categoryName.trim().toLowerCase());
    }
    if (!matchedCat && srv.categoryId) {
      matchedCat = catById.get(srv.categoryId);
    }
    if (matchedCat) {
      return {
        ...srv,
        categoryId: matchedCat.id,
        categoryName: matchedCat.name
      };
    }
    return srv;
  });

  res.json(reconciledServices);
});

app.get("/api/services/:id", async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  const categories = await getCategories();
  const matchedCat = categories.find(c => c.id === service.categoryId || c.name.toLowerCase() === service.categoryName?.toLowerCase());
  if (matchedCat) {
    service.categoryId = matchedCat.id;
    service.categoryName = matchedCat.name;
  }
  res.json(service);
});

app.post("/api/services", authenticateJWT, requireAdmin, async (req, res) => {
  const { name, categoryId, categoryName, shortDescription, longDescription, mrpPrice, sellingPrice, genderFocus, ageGroup, vitalTrackingRequired, image } = req.body;
  const categories = await getCategories();
  let targetCat = categories.find(c => c.id === categoryId);
  if (!targetCat && categoryName) {
    targetCat = categories.find(c => c.name.toLowerCase() === categoryName.trim().toLowerCase());
  }

  const currentSrvs = await getServices();
  const maxServiceIdNum = currentSrvs.reduce((max, s) => {
    const num = parseInt(s.id.split("-")[1]);
    return isNaN(num) ? max : (num > max ? num : max);
  }, 1000);
  
  const finalCatId = targetCat ? targetCat.id : (categoryId || "CAT-0021");
  const finalCatName = targetCat ? targetCat.name : (categoryName || "General");

  const newSrv: Service = {
    id: "SRV-" + (maxServiceIdNum + 1),
    name,
    categoryId: finalCatId,
    categoryName: finalCatName,
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

app.put("/api/services/:id", authenticateJWT, requireAdmin, async (req, res) => {
  const body = { ...req.body };
  const categories = await getCategories();
  if (body.categoryId || body.categoryName) {
    let targetCat = categories.find(c => c.id === body.categoryId);
    if (!targetCat && body.categoryName) {
      targetCat = categories.find(c => c.name.toLowerCase() === body.categoryName.trim().toLowerCase());
    }
    if (targetCat) {
      body.categoryId = targetCat.id;
      body.categoryName = targetCat.name;
    }
  }

  const updated = await updateService(req.params.id, body);
  if (!updated) return res.status(404).json({ message: "Service not found" });
  res.json(updated);
});

app.delete("/api/services/:id", authenticateJWT, requireAdmin, async (req, res) => {
  const deleted = await deleteService(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Service not found" });
  res.json({ success: true });
});

// BOOKINGS
app.get("/api/bookings", authenticateJWT, requireAdmin, async (req, res) => {
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

// RAZORPAY PAYMENT ENDPOINTS
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}`, notes } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_THNjQZliCmOmZS";
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "2vcIFnlWRn5rohfpZHvOyG4i";

    // If valid production/test keys are provided, use Razorpay SDK
    if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes("rzp_test_nivora")) {
      try {
        const RazorpayClass = (Razorpay as any).default || Razorpay;
        const instance = new RazorpayClass({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const order = await instance.orders.create({
          amount: Math.round(Number(amount) * 100), // Amount in paise
          currency,
          receipt,
          notes: notes || {}
        });

        return res.json({
          success: true,
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
          keyId: razorpayKeyId
        });
      } catch (sdkError: any) {
        console.warn("Razorpay SDK call failed, falling back to sandbox mode:", sdkError?.message || sdkError);
      }
    }

    // Sandbox / fallback mode
    const mockOrderId = "order_" + Math.random().toString(36).substring(2, 12);
    return res.json({
      success: true,
      orderId: mockOrderId,
      currency: currency || "INR",
      amount: Math.round(Number(amount) * 100),
      keyId: razorpayKeyId || "rzp_test_THNjQZliCmOmZS"
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create payment order" });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "Missing Razorpay order ID or payment ID" });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "2vcIFnlWRn5rohfpZHvOyG4i";

    if (razorpayKeySecret && !razorpayKeySecret.includes("rzp_test_nivora") && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    }

    return res.json({
      success: true,
      message: "Payment verified successfully"
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: error.message || "Payment verification failed" });
  }
});

// ORDERS MODULE

// User Dashboard Endpoint: Get ONLY the logged-in user's orders & appointments
app.get("/api/orders/my", authenticateJWT, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    if (!userId && !email) {
      return res.status(400).json({ success: false, message: "User identity missing in authentication token" });
    }

    // Fetch only that logged-in user's orders sorted newest first
    const orders = await getOrdersByUserIdOrEmail(userId, email);
    res.json(orders);
  } catch (error) {
    console.error("Error in GET /api/orders/my:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user appointments" });
  }
});

// Admin Endpoint: Get ALL orders (Restricted strictly to Admin users)
app.get("/api/admin/orders", authenticateJWT, async (req: any, res) => {
  try {
    if (req.user?.role !== "Super Admin" && req.user?.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Administrative access required" });
    }
    const orders = await getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin orders" });
  }
});

// Backwards compatibility endpoint for legacy admin calls or internal checks
app.get("/api/orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && (decoded.id || decoded.email)) {
          // If a non-admin user calls GET /api/orders, auto-route to their own orders for security
          if (decoded.role !== "Super Admin" && decoded.role !== "Admin") {
            const userOrders = await getOrdersByUserIdOrEmail(decoded.id, decoded.email);
            return res.json(userOrders);
          }
        }
      } catch (e) {
        // Token invalid, fall back to default
      }
    }
    const orders = await getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/user/:userId", authenticateJWT, async (req: any, res) => {
  try {
    const targetUserId = req.params.userId;
    const isAdmin = req.user.role === "Super Admin" || req.user.role === "Admin";
    const isOwner = req.user.id === targetUserId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden: Access to another user's bookings is prohibited" });
    }

    const orders = await getOrdersByUserIdOrEmail(targetUserId, req.user.email);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user orders" });
  }
});

app.get("/api/orders/:id", authenticateJWT, async (req: any, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isAdmin = req.user.role === "Super Admin" || req.user.role === "Admin";
    const isOwner =
      order.userId === req.user.id ||
      (order.email && order.email.toLowerCase() === req.user.email?.toLowerCase()) ||
      (order.customerEmail && order.customerEmail.toLowerCase() === req.user.email?.toLowerCase());

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have permission to view another user's appointment" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const body = req.body;
    let userId = body.userId;
    let email = body.email || body.customerEmail;

    // If Authorization header token is provided, extract user details directly from JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          userId = decoded.id;
          email = decoded.email || email;
        }
      } catch (jwtErr) {
        // Continue with body if guest
      }
    }

    const currentOrders = await getOrders();
    const maxOrderIdNum = currentOrders.reduce((max, o) => {
      const num = parseInt(o.id.replace("#ORD-", "").replace("ORD-", ""));
      return isNaN(num) ? max : (num > max ? num : max);
    }, 9920);

    const orderId = body.id || ("#ORD-" + (maxOrderIdNum + 1));
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      userId: userId || "USR-002",
      patientName: body.patientName || body.customerName || "Patient",
      email: email || "patient@example.com",
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

      // Aliases
      customerName: body.patientName || body.customerName || "Patient",
      customerEmail: email || body.customerEmail || "patient@example.com",
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

    // Also auto-create a Booking record so it appears in Bookings management
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
        categoryName: "General",
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

      // If Cash collected or paid online, log in collected cash
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
      console.error("Error creating linked booking:", bookingErr);
    }

    res.json(savedOrder);
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
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
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const updated = await updateOrder(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update order" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const deleted = await deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete order" });
  }
});

// DOCTOR MANAGEMENT ENDPOINTS
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await getDoctors();
    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
});

app.post("/api/doctors", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, specialization, qualification, experience, availability, consultationMode, licenseNumber, status, profilePhoto } = req.body || {};
    if (!fullName || !email || !specialization) {
      return res.status(400).json({ success: false, message: "Full Name, Email and Specialization are required" });
    }
    const currentDocs = await getDoctors();
    const maxDocIdNum = currentDocs.reduce((max, d) => {
      const num = parseInt(d.id.replace("DOC-", ""));
      return isNaN(num) ? max : (num > max ? num : max);
    }, 100);

    const newDoc: Doctor = {
      id: "DOC-" + (maxDocIdNum + 1),
      fullName,
      email,
      phone: phone || "+971 50 000 0000",
      specialization,
      qualification: qualification || "MD / MBBS",
      experience: experience || "5+ Years",
      availability: availability || "Mon - Sat (09:00 AM - 05:00 PM)",
      consultationMode: consultationMode || "In-Home Visit & Teleconsultation",
      licenseNumber: licenseNumber || `DHA-LIC-${Math.floor(10000 + Math.random() * 90000)}`,
      status: status || "Active",
      profilePhoto: profilePhoto || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
      createdAt: new Date().toISOString()
    };

    const created = await addDoctor(newDoc);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create doctor" });
  }
});

app.put("/api/doctors/:id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const updated = await updateDoctor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update doctor" });
  }
});

app.patch("/api/doctors/:id/status", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateDoctor(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update doctor status" });
  }
});

app.delete("/api/doctors/:id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const deleted = await deleteDoctor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete doctor" });
  }
});

// DOCTOR ASSIGNMENT ENDPOINTS
app.get("/api/admin/appointments/pending", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const allOrders = await getOrders();
    const pending = allOrders.filter(o => 
      !o.assignedDoctor || 
      o.orderStatus === "Pending" || 
      (o as any).status === "Pending"
    );
    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch pending appointments" });
  }
});

app.get("/api/admin/appointments/assigned", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const allOrders = await getOrders();
    const assigned = allOrders.filter(o => 
      Boolean(o.assignedDoctor) || 
      o.orderStatus === "Confirmed" || 
      o.orderStatus === "Completed"
    );
    res.json(assigned);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch assigned appointments" });
  }
});

app.put("/api/admin/appointments/:id/assign", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { doctorId, doctorName, doctorEmail, doctorPhone, doctorSpecialization, doctorPhoto } = req.body || {};

    let docObj: any = null;
    if (doctorId) {
      docObj = await getDoctorById(doctorId);
    }

    const assignedDoctor = doctorId || docObj?.id || "DOC-101";
    const assignedDoctorName = doctorName || docObj?.fullName || "Dr. Medical Specialist";
    const assignedDoctorEmail = doctorEmail || docObj?.email || "specialist@nivora.org";
    const assignedDoctorPhone = doctorPhone || docObj?.phone || "+971 50 888 1234";
    const assignedDoctorSpecialization = doctorSpecialization || docObj?.specialization || "General Medicine";
    const assignedDoctorPhoto = doctorPhoto || docObj?.profilePhoto || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80";
    const assignedAt = new Date().toISOString();

    const updatePayload: Partial<Order> = {
      assignedDoctor,
      assignedDoctorName,
      assignedDoctorEmail,
      assignedDoctorPhone,
      assignedDoctorSpecialization,
      assignedDoctorPhoto,
      assignedAt,
      orderStatus: "Confirmed",
      status: "Confirmed"
    };

    const updatedOrder = await updateOrder(appointmentId, updatePayload);
    
    // Also update corresponding booking if exists
    try {
      const allBookings = await getBookings();
      const matchBooking = allBookings.find(b => b.id === appointmentId || b.id.replace("#BOOK-", "") === appointmentId.replace("#ORD-", ""));
      if (matchBooking) {
        await updateBooking(matchBooking.id, {
          assignedDoctor,
          assignedDoctorName,
          assignedDoctorEmail,
          assignedDoctorPhone,
          assignedDoctorSpecialization,
          assignedDoctorPhoto,
          assignedAt,
          status: "Confirmed"
        });
      }
    } catch (bookingUpdateErr) {
      console.warn("Error syncing booking assignment status:", bookingUpdateErr);
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({
      success: true,
      message: `Doctor ${assignedDoctorName} successfully assigned to appointment ${appointmentId}`,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error("Error in assign doctor route:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to assign doctor" });
  }
});

// DOCTOR ROLE DASHBOARD ENDPOINTS
app.get("/api/doctor/appointments", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let doctorEmail = req.query.email as string;
    let doctorId = req.query.doctorId as string;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded) {
          doctorEmail = doctorEmail || decoded.email;
          doctorId = doctorId || decoded.doctorId || decoded.id;
        }
      } catch (e) {
        // Token parse error
      }
    }

    const allOrders = await getOrders();
    const docAppointments = allOrders.filter(o => {
      const matchId = doctorId && o.assignedDoctor === doctorId;
      const matchEmail = doctorEmail && o.assignedDoctorEmail && o.assignedDoctorEmail.toLowerCase() === doctorEmail.toLowerCase();
      return matchId || matchEmail || Boolean(o.assignedDoctor);
    });

    res.json(docAppointments);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch doctor appointments" });
  }
});

app.put("/api/doctor/appointments/:id/accept", async (req, res) => {
  try {
    const updated = await updateOrder(req.params.id, { orderStatus: "Confirmed", status: "Confirmed" });
    if (!updated) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to accept appointment" });
  }
});

app.put("/api/doctor/appointments/:id/complete", async (req, res) => {
  try {
    const updated = await updateOrder(req.params.id, { orderStatus: "Completed", status: "Completed", paymentStatus: "Paid" });
    if (!updated) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to complete appointment" });
  }
});

// REVIEWS
app.get("/api/reviews", async (req, res) => {
  const reviews = await getReviews();
  res.json(reviews);
});

// COLLECTED CASH
app.get("/api/collected-cash", authenticateJWT, requireAdmin, async (req, res) => {
  const cash = await getCollectedCash();
  res.json(cash);
});

// AI CHATBOT & GEMINI INTEGRATION
let genAIClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

function detectServerActionButtons(userMessage: string, replyText: string) {
  const combined = (userMessage + " " + replyText).toLowerCase();
  const buttons: { label: string; action: string; payload?: string }[] = [];

  if (combined.includes("book") || combined.includes("appointment") || combined.includes("schedule")) {
    buttons.push({ label: "📅 Book Appointment", action: "book" });
  }
  if (combined.includes("doctor") || combined.includes("physio") || combined.includes("nurse") || combined.includes("service") || combined.includes("test")) {
    buttons.push({ label: "👨‍⚕️ Find a Doctor / Services", action: "navigate", payload: "/doctor-visit" });
  }
  if (combined.includes("contact") || combined.includes("phone") || combined.includes("support") || combined.includes("call")) {
    buttons.push({ label: "📞 Contact Support", action: "contact" });
  }
  if (combined.includes("order") || combined.includes("my appointment") || combined.includes("status")) {
    buttons.push({ label: "📋 My Appointments", action: "navigate", payload: "/my-appointments" });
  }

  if (buttons.length === 0) {
    buttons.push({ label: "📅 Book Appointment", action: "book" });
    buttons.push({ label: "🩺 Browse Services", action: "navigate", payload: "/doctor-visit" });
  }

  return buttons;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Valid message string is required" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      const fallbackReply = "Welcome to Nivora Healthcare! Our DHA-licensed medical team provides 24/7 home visits, doctor consultations, physiotherapy, and lab tests across the UAE. How can I assist you today?";
      const actionButtons = detectServerActionButtons(message, fallbackReply);
      return res.json({
        success: true,
        reply: fallbackReply,
        actionButtons
      });
    }

    const systemInstruction = `
You are the official AI Virtual Assistant for Nivora Healthcare (formerly Elara Health Systems).
Nivora Healthcare is a premier DHA-licensed home healthcare provider in the UAE delivering hospital-grade medical care directly to patients' homes.

Services Offered:
- Doctor Visit at Home
- At-Home Physiotherapy & Rehabilitation
- Home Blood Collection & Lab Tests
- Registered Nurse Care & IV Therapy
- Long Term & Elder Care Plans
- Dental Care at Home

Key Information:
- Working Hours: Home care dispatch and emergency support are available 24 Hours / 7 Days. Clinic customer service operates 8:00 AM - 10:00 PM daily.
- Contact: Phone & WhatsApp: 9660394618 (+91 9660394618) | Email: sharmarjitendrakumar2007@gmail.com
- Cancellation Policy: Free cancellation or rescheduling up to 2 hours before appointment time via 'My Appointments'.
- Payment Methods: VISA, MasterCard, AMEX, Apple Pay, Cash on Delivery, and direct insurance billing claims.
- Booking: Users can book instantly online or by selecting 'Book Appointment'.

Tone & Style:
- Warm, empathetic, professional, clear, and reassuring.
- Keep responses concise (under 120 words unless detailed explanation is requested).
- Use formatting like bullet points or bold text for key facts.
- If a query involves a life-threatening medical emergency, advise calling 999 or emergency dispatch (9660394618) immediately.
`.trim();

    let contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      contents = history.slice(-6).map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.parts?.[0]?.text || item.text || '' }]
      }));
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || "Thank you for contacting Nivora Healthcare. How else can our medical team assist you today?";
    const actionButtons = detectServerActionButtons(message, replyText);

    return res.json({
      success: true,
      reply: replyText,
      actionButtons
    });
  } catch (error: any) {
    console.error("Error in /api/chat Gemini processing:", error);
    const fallbackText = "Thank you for reaching out to Nivora Healthcare. You can easily schedule a doctor visit or lab test, or contact our 24/7 care desk at 9660394618 or email sharmarjitendrakumar2007@gmail.com.";
    return res.json({
      success: true,
      reply: fallbackText,
      actionButtons: [
        { label: "📅 Book Appointment", action: "book" },
        { label: "📞 Contact Support", action: "contact" }
      ]
    });
  }
});

// REALTIME DOCTOR-PATIENT CHAT ENDPOINTS
app.get("/api/doctor-chat/messages/:appointmentId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized - Bearer token required" });
    }
    const token = authHeader.split(" ")[1];
    let user: any = null;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const { appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const messages = await getChatMessagesByAppointment(appointmentId);
    const roleToMark = user.role === 'admin' || user.role === 'doctor' ? 'patient' : 'doctor';
    await markChatMessagesRead(appointmentId, roleToMark);

    return res.json({ success: true, messages });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ success: false, message: "Failed to load chat messages" });
  }
});

app.get("/api/doctor-chat/conversations", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    let user: any = null;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const conversations = await getAllChatConversations();
    if (user.role === 'admin' || user.role === 'doctor') {
      return res.json({ success: true, conversations });
    } else {
      const userConvs = conversations.filter(c => 
        (user.email && c.patientEmail && c.patientEmail.toLowerCase() === user.email.toLowerCase()) ||
        c.patientName.toLowerCase().includes((user.firstName || "").toLowerCase())
      );
      return res.json({ success: true, conversations: userConvs });
    }
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ success: false, message: "Failed to load conversations" });
  }
});

app.post("/api/doctor-chat/messages", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    let user: any = null;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { appointmentId, text, patientName, doctorName } = req.body || {};
    if (!appointmentId || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Appointment ID and message text required" });
    }

    const senderRole = user.role === 'admin' || user.role === 'doctor' ? 'doctor' : 'patient';
    const senderName = user.firstName ? `${user.firstName} ${user.lastName}` : (user.email?.split('@')[0] || "User");

    const msgData = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      appointmentId,
      patientId: user.id || user.email,
      patientName: patientName || user.email || "Patient",
      doctorId: "DOC-DHA-001",
      doctorName: doctorName || "Nivora DHA Specialist",
      senderRole,
      senderId: user.id || user.email,
      senderName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      createdAt: new Date().toISOString()
    };

    const saved = await addChatMessage(msgData);
    return res.json({ success: true, message: saved });
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// API 404 Catch-All Handler (Guarantees API endpoints never return HTML)
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Express Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

async function startServer() {
  // Initialize the database layer (connects to MongoDB if configured, otherwise falls back)
  await initDatabase(db, () => saveDB(db));

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO Auth Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) {
        return next(new Error("Authentication token required for Doctor-Patient chat"));
      }
      const decoded: any = jwt.verify(token, JWT_SECRET);
      socket.data.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    socket.on("join_appointment_chat", async (data: { appointmentId: string }) => {
      const { appointmentId } = data;
      if (!appointmentId) return;

      const roomName = `appointment_${appointmentId}`;
      socket.join(roomName);

      const history = await getChatMessagesByAppointment(appointmentId);
      const roleToMark = user.role === 'admin' || user.role === 'doctor' ? 'patient' : 'doctor';
      await markChatMessagesRead(appointmentId, roleToMark);

      socket.emit("chat_history", {
        appointmentId,
        messages: history
      });

      io.to(roomName).emit("user_status", {
        userId: user.id || user.email,
        userName: user.firstName ? `${user.firstName} ${user.lastName}` : (user.email || "User"),
        role: user.role || 'patient',
        status: 'online'
      });
    });

    socket.on("send_chat_message", async (data: {
      appointmentId: string;
      patientName: string;
      doctorName: string;
      text: string;
    }) => {
      const { appointmentId, text, patientName, doctorName } = data;
      if (!appointmentId || !text || !text.trim()) return;

      const senderRole = user.role === 'admin' || user.role === 'doctor' ? 'doctor' : 'patient';
      const senderName = user.firstName ? `${user.firstName} ${user.lastName}` : (user.email?.split('@')[0] || "User");

      const msgData = {
        id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        appointmentId,
        patientId: user.id || user.email,
        patientName: patientName || user.email || "Patient",
        doctorId: "DOC-DHA-001",
        doctorName: doctorName || "Nivora DHA Specialist",
        senderRole,
        senderId: user.id || user.email,
        senderName,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        createdAt: new Date().toISOString()
      };

      const savedMsg = await addChatMessage(msgData);
      const roomName = `appointment_${appointmentId}`;
      io.to(roomName).emit("receive_chat_message", savedMsg);
    });

    socket.on("typing_status", (data: { appointmentId: string; isTyping: boolean }) => {
      const { appointmentId, isTyping } = data;
      const roomName = `appointment_${appointmentId}`;
      socket.to(roomName).emit("user_typing_status", {
        appointmentId,
        isTyping,
        senderName: user.firstName ? `${user.firstName} ${user.lastName}` : "Medical Specialist",
        role: user.role || 'patient'
      });
    });

    socket.on("mark_messages_read", async (data: { appointmentId: string }) => {
      const { appointmentId } = data;
      const roleToMark = user.role === 'admin' || user.role === 'doctor' ? 'patient' : 'doctor';
      await markChatMessagesRead(appointmentId, roleToMark);
      io.to(`appointment_${appointmentId}`).emit("messages_status_updated", {
        appointmentId,
        status: 'read'
      });
    });
  });

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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Nivora Healthcare Server running on http://localhost:${PORT}`);
  });
}

startServer();
