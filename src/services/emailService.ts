import emailjs from '@emailjs/browser';

export interface AppointmentEmailParams {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount?: number | string;
  paymentMethod?: string;
  notes?: string;
}

export interface CancellationEmailParams {
  userName: string;
  userEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Reusable EmailJS Service for Nivora Healthcare
 * Sends appointment confirmation email to patients upon successful booking.
 */
export const sendAppointmentConfirmationEmail = async (
  params: AppointmentEmailParams
): Promise<EmailResult> => {
  const env = (import.meta as any).env || {};
  const serviceId = env.VITE_EMAILJS_SERVICE_ID || "service_73128f7";
  const templateId = env.VITE_EMAILJS_TEMPLATE_ID || "template_hiyzzh3";
  const publicKey = env.VITE_EMAILJS_PUBLIC_KEY || "DD1h6Lz08lMuxnirn";

  if (!serviceId || !templateId || !publicKey) {
    const errorMsg = "EmailJS credentials missing from environment configuration.";
    console.warn("[EmailJS]", errorMsg);
    return { success: false, error: errorMsg };
  }

  // Template variables mapping to support both camelCase and snake_case template fields
  const templateParams = {
    patient_name: params.patientName,
    patientName: params.patientName,
    to_name: params.patientName,
    user_name: params.patientName,

    patient_email: params.patientEmail,
    patientEmail: params.patientEmail,
    to_email: params.patientEmail,
    user_email: params.patientEmail,

    doctor_name: params.doctorName,
    doctorName: params.doctorName,
    service_name: params.doctorName,
    serviceName: params.doctorName,

    appointment_date: params.appointmentDate,
    appointmentDate: params.appointmentDate,
    date: params.appointmentDate,

    appointment_time: params.appointmentTime,
    appointmentTime: params.appointmentTime,
    time: params.appointmentTime,

    total_amount: params.totalAmount ? `₹${params.totalAmount}` : "",
    payment_method: params.paymentMethod || "N/A",
    notes: params.notes || "None"
  };

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log("[EmailJS] Email sent successfully:", response.status, response.text);
    return {
      success: true,
      message: "Confirmation email sent successfully."
    };
  } catch (error: any) {
    const errorDetail = error?.text || error?.message || JSON.stringify(error);
    console.error("[EmailJS] Failed to send confirmation email:", errorDetail);
    return {
      success: false,
      error: `Failed to send confirmation email: ${errorDetail}`
    };
  }
};

/**
 * Reusable EmailJS Service for Appointment Cancellation
 * Sends appointment cancellation email using template_uxvtals when status changes to "Cancelled".
 */
export const sendAppointmentCancellationEmail = async (
  params: CancellationEmailParams
): Promise<EmailResult> => {
  const env = (import.meta as any).env || {};
  const serviceId = env.VITE_EMAILJS_SERVICE_ID || "service_73128f7";
  const templateId = env.VITE_EMAILJS_CANCELLATION_TEMPLATE_ID || "template_uxvtals";
  const publicKey = env.VITE_EMAILJS_PUBLIC_KEY || "DD1h6Lz08lMuxnirn";

  if (!serviceId || !templateId || !publicKey) {
    const errorMsg = "EmailJS credentials or cancellation template ID missing from environment configuration.";
    console.warn("[EmailJS]", errorMsg);
    return { success: false, error: errorMsg };
  }

  // Exact template variables requested: user_name, user_email, doctor_name, appointment_date, appointment_time
  const templateParams = {
    user_name: params.userName,
    user_email: params.userEmail,
    doctor_name: params.doctorName,
    appointment_date: params.appointmentDate,
    appointment_time: params.appointmentTime,

    // Additional aliases for maximum compatibility
    patient_name: params.userName,
    patientName: params.userName,
    to_name: params.userName,

    patient_email: params.userEmail,
    patientEmail: params.userEmail,
    to_email: params.userEmail,

    doctorName: params.doctorName,
    service_name: params.doctorName,
    serviceName: params.doctorName,

    appointmentDate: params.appointmentDate,
    date: params.appointmentDate,

    appointmentTime: params.appointmentTime,
    time: params.appointmentTime
  };

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log("[EmailJS] Cancellation email sent successfully:", response.status, response.text);
    return {
      success: true,
      message: "Cancellation email sent successfully."
    };
  } catch (error: any) {
    const errorDetail = error?.text || error?.message || JSON.stringify(error);
    console.error("[EmailJS] Failed to send cancellation email:", errorDetail);
    return {
      success: false,
      error: `Failed to send cancellation email: ${errorDetail}`
    };
  }
};

/**
 * Reusable EmailJS Service for Doctor Assignment Notification
 * Sends doctor assignment confirmation email to patients when admin assigns a doctor.
 */
export const sendDoctorAssignmentEmail = async (
  params: AppointmentEmailParams
): Promise<EmailResult> => {
  return sendAppointmentConfirmationEmail(params);
};
