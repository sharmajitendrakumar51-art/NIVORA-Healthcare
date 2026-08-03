export interface ActionButton {
  label: string;
  action: 'navigate' | 'book' | 'contact' | 'quick_reply';
  payload?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: ActionButton[];
  isError?: boolean;
}

/**
 * Sends chat message to backend Gemini API route (/api/chat)
 */
export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{ text: string; actionButtons?: ActionButton[] }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.reply) {
      return {
        text: data.reply,
        actionButtons: data.actionButtons
      };
    }
    throw new Error(data.message || "Unable to retrieve AI response.");
  } catch (err: any) {
    console.warn("[AIChatService] API request failed, utilizing client-side fallback handler:", err);
    return getOfflineHealthcareReply(message);
  }
}

/**
 * Intelligent Client-Side Fallback Reply Generator for Healthcare Queries
 */
export function getOfflineHealthcareReply(query: string): { text: string; actionButtons?: ActionButton[] } {
  const lower = query.toLowerCase().trim();

  if (lower.includes("book") || lower.includes("appointment") || lower.includes("schedule")) {
    return {
      text: "You can easily schedule a home visit or lab test with our DHA-certified medical team. Select 'Book Appointment' below to start instantly!",
      actionButtons: [
        { label: "📅 Book Appointment", action: "book" },
        { label: "🩺 Browse Services", action: "navigate", payload: "/doctor-visit" }
      ]
    };
  }

  if (lower.includes("doctor") || lower.includes("physio") || lower.includes("nurse") || lower.includes("specialist")) {
    return {
      text: "Nivora Healthcare dispatches experienced DHA-licensed Doctors, Physiotherapists, and Registered Nurses directly to your home or office across UAE.",
      actionButtons: [
        { label: "👨‍⚕️ Find a Doctor", action: "navigate", payload: "/doctor-visit" },
        { label: "📅 Book Appointment", action: "book" }
      ]
    };
  }

  if (lower.includes("service") || lower.includes("category") || lower.includes("test") || lower.includes("lab")) {
    return {
      text: "We offer a full spectrum of home health services including Doctor Consultations, At-Home Lab Tests, Physiotherapy, IV Drips, Elder Care, and Dental Care.",
      actionButtons: [
        { label: "🏥 Our Services", action: "navigate", payload: "/doctor-visit" },
        { label: "🧪 Lab Tests", action: "navigate", payload: "/lab-tests" }
      ]
    };
  }

  if (lower.includes("hour") || lower.includes("time") || lower.includes("timing") || lower.includes("open")) {
    return {
      text: "🕒 Nivora Healthcare Working Hours:\n• Home Healthcare & Emergency Dispatch: 24 Hours / 7 Days a week\n• Tele-consultation Support: 24/7\n• Clinic Desk & Customer Service: 8:00 AM – 10:00 PM Daily",
      actionButtons: [
        { label: "📞 Contact Us", action: "contact" },
        { label: "📅 Book Appointment", action: "book" }
      ]
    };
  }

  if (lower.includes("cancel") || lower.includes("reschedule") || lower.includes("refund")) {
    return {
      text: "ℹ️ Cancellation Policy:\nYou can cancel or reschedule any appointment free of charge up to 2 hours before the scheduled time directly under 'My Appointments' or by reaching out to support.",
      actionButtons: [
        { label: "📋 My Appointments", action: "navigate", payload: "/my-appointments" },
        { label: "📞 Contact Support", action: "contact" }
      ]
    };
  }

  if (lower.includes("contact") || lower.includes("phone") || lower.includes("call") || lower.includes("whatsapp") || lower.includes("email") || lower.includes("address")) {
    return {
      text: "📞 Contact Nivora Healthcare:\n• Phone / WhatsApp: 9660394618 (+91 9660394618)\n• Emergency Dispatch: 9660394618 (24/7)\n• Email: sharmarjitendrakumar2007@gmail.com\n• Address: Nivora Healthcare Complex, Healthcare City, Dubai, UAE",
      actionButtons: [
        { label: "📞 Contact Us", action: "contact" },
        { label: "📅 Book Appointment", action: "book" }
      ]
    };
  }

  if (lower.includes("pay") || lower.includes("cost") || lower.includes("price") || lower.includes("insurance") || lower.includes("card")) {
    return {
      text: "💳 Payment & Billing:\nWe support VISA, MasterCard, AMEX, Apple Pay, Cash on Delivery, and direct insurance billing claims. All prices are inclusive of home visit charges.",
      actionButtons: [
        { label: "📅 Book Appointment", action: "book" },
        { label: "📞 Billing Support", action: "contact" }
      ]
    };
  }

  if (lower.includes("emergency") || lower.includes("urgent") || lower.includes("help") || lower.includes("999")) {
    return {
      text: "🚨 EMERGENCY ALERT:\nIf you are experiencing a severe medical emergency (such as severe chest pain, breathlessness, or trauma), please call 999 or go to the nearest emergency room immediately. For 24/7 rapid dispatch, call 9660394618 or email sharmarjitendrakumar2007@gmail.com.",
      actionButtons: [
        { label: "🚨 Emergency Call", action: "contact" },
        { label: "📅 Immediate Booking", action: "book" }
      ]
    };
  }

  if (lower.includes("tip") || lower.includes("health") || lower.includes("advice")) {
    return {
      text: "💡 Nivora Daily Health Tip:\nMaintain optimal hydration by drinking 2.5–3 liters of water daily, schedule routine annual blood checkups, and aim for 7–8 hours of restful sleep every night to boost immunity.",
      actionButtons: [
        { label: "🧪 Book Lab Checkup", action: "navigate", payload: "/lab-tests" },
        { label: "📅 Book Doctor", action: "book" }
      ]
    };
  }

  return {
    text: "Thank you for reaching out to Nivora Healthcare. I am your AI Health Assistant. I can assist you with booking appointments, finding doctors, exploring lab tests, or learning about our clinic timings and policies.",
    actionButtons: [
      { label: "📅 Book Appointment", action: "book" },
      { label: "👨‍⚕️ Find a Doctor", action: "navigate", payload: "/doctor-visit" },
      { label: "📞 Contact Support", action: "contact" }
    ]
  };
}
