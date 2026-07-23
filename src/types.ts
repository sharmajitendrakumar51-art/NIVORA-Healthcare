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
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface Order {
  id: string; // e.g. "#ORD-9921"
  customerName: string;
  customerEmail: string;
  items: {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  date: string;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
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
