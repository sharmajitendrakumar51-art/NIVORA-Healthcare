export interface Category {
  id: string; // e.g., "CAT-0021"
  name: string;
  image: string;
  description: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  mrpPrice: number;
  sellingPrice: number;
  genderFocus: 'All Genders' | 'Male' | 'Female';
  ageGroup: 'Pediatric' | '18+' | 'Seniors' | 'All Ages';
  vitalTrackingRequired: string[]; // e.g. ["BP", "Pulse", "Glucose", "Weight"]
  status: 'Active' | 'Inactive';
  rating: number;
  reviewsCount: number;
}

export interface Practitioner {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewsCount: number;
  availability: string[]; // days or times
}

export interface Provider {
  id: string;
  name: string;
  location: string;
  type: string; // e.g. "Laboratory", "Clinic"
  rating: number;
}

export interface PatientDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  relation: string; // "Self", "Parent", "Child", "Spouse", etc.
  gender: 'Male' | 'Female' | 'Other';
}

export interface Booking {
  id: string; // e.g., "#BOOK-9921"
  serviceId: string;
  serviceName: string;
  categoryName: string;
  date: string; // e.g. "2026-07-20"
  time: string; // e.g. "10:00 AM"
  slot: 'Morning' | 'Afternoon' | 'Evening';
  bookingForSomeoneElse: boolean;
  patientDetails: PatientDetails;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  price: number;
  createdAt: string;

  // Doctor assignment fields
  assignedDoctor?: string;
  assignedDoctorName?: string;
  assignedDoctorEmail?: string;
  assignedDoctorPhone?: string;
  assignedDoctorSpecialization?: string;
  assignedDoctorPhoto?: string;
  assignedAt?: string;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface OrderServiceItem {
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string; // e.g. "#ORD-9921"
  userId?: string;
  patientName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  relation?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  timeSlot?: string;
  notes?: string;
  services?: OrderServiceItem[];
  discount?: number;
  totalAmount?: number;
  paymentMethod?: 'Cash on Appointment' | 'Razorpay' | string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Unpaid' | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentDate?: string;
  orderStatus?: 'Pending' | 'Booked' | 'Confirmed' | 'Completed' | 'Cancelled' | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // Doctor assignment fields
  assignedDoctor?: string;
  assignedDoctorName?: string;
  assignedDoctorEmail?: string;
  assignedDoctorPhone?: string;
  assignedDoctorSpecialization?: string;
  assignedDoctorPhoto?: string;
  assignedAt?: string;

  // Backwards compatibility aliases
  customerName?: string;
  customerEmail?: string;
  items?: {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  date?: string;
  total?: number;
}

export interface Doctor {
  id: string; // e.g., "DOC-101"
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  experience?: string;
  availability?: string; // e.g. "Mon - Sat (9:00 AM - 6:00 PM)"
  consultationMode?: string; // e.g. "In-Home Visit & Teleconsultation"
  licenseNumber?: string; // e.g. "DHA-LIC-90812"
  status: 'Active' | 'Inactive';
  profilePhoto?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CollectedCash {
  id: string;
  bookingId?: string;
  orderId?: string;
  amount: number;
  collectedBy: string;
  date: string;
  notes?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface DoctorPatientChatMessage {
  id: string;
  appointmentId: string; // Linked to Order/Booking ID
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  senderRole: 'patient' | 'doctor' | 'admin';
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt?: string;
}

export interface ChatConversation {
  appointmentId: string;
  patientName: string;
  patientEmail?: string;
  doctorName: string;
  serviceName?: string;
  appointmentDate?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
}
