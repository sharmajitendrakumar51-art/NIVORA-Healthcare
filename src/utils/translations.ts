export type Language = "en" | "ar" | "hi";
export type City = "dubai" | "abudhabi" | "sharjah";

export const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" }
];

export const cities: { code: City; name: string; region: string }[] = [
  { code: "dubai", name: "Dubai", region: "Dubai Emirate" },
  { code: "abudhabi", name: "Abu Dhabi", region: "Abu Dhabi Emirate" },
  { code: "sharjah", name: "Sharjah", region: "Sharjah Emirate" }
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    promoBanner: "Special Offer: 20% off on first lab test with code: ELARA20",
    promoLabel: "Promo",
    doctorVisit: "Doctor Visit",
    physiotherapy: "Physiotherapy",
    ivTherapy: "IV Therapy",
    labTests: "Lab Tests",
    healthcare: "Health Care",
    others: "Others",
    signIn: "Sign In",
    logout: "Logout",
    adminPanel: "Admin Panel",
    searchPlaceholder: "Search for at home lab test, healthcare...",
    myLabTest: "My Lab Test",
    myHealthRecords: "My Health Records",
    carePlan: "Care Plan",
    heroTitle: "Your All-in-one platform for booking Home Healthcare Services",
    heroSub: "Skip the clinic waiting rooms. Nivora brings licensed general practitioners, professional physiotherapists, and DHA-certified nurses straight to your doorstep within 60 minutes.",
    heroBadge: "DHA Certified Home Health Provider",
    bookNow: "Book Now",
    viewAllServices: "View All Services",
    trustedByFamilies: "Trusted by families in Jumeirah, Marina, and Downtown Dubai.",
    clinicalCategories: "Clinical Categories",
    exploreCategories: "Explore our DHA-licensed medical categories designed for maximum in-home comfort and precise therapeutic results.",
    popularLabTests: "Popular Clinical At-Home Lab Tests",
    popularPhysio: "Physiotherapy & Rehabilitation Sessions",
    popularNurse: "Professional At-Home Nursing Care",
    viewDetails: "View Details",
    immediateBook: "Book Immediate",
    priceText: "AED",
    addToCart: "Add to Cart",
    cartButton: "Go to Cart",
    insuranceTitle: "Our Clinical Insurance Partners",
    insuranceSub: "Direct billing and easy claim reimbursement with premium global and regional insurance providers.",
    helpTitle: "Need Professional Help?",
    helpSub: "Our DHA-certified medical dispatchers are online 24/7. Call or chat with us for personalized service recommendations.",
    phoneBtn: "Call +971 4 123 4567",
    whatsappBtn: "WhatsApp Dispatcher",
    resultsTitle: "Search Results",
    backHome: "Back to Home",
    noResults: "No services found matching your search.",
    reviewsTitle: "Verified Patient Testimonials"
  },
  ar: {
    promoBanner: "عرض خاص: خصم 20٪ على أول فحص مخبري مع الكود: ELARA20",
    promoLabel: "عرض",
    doctorVisit: "زيارة الطبيب",
    physiotherapy: "العلاج الطبيعي",
    ivTherapy: "العلاج الوريدي",
    labTests: "الفحوصات المخبرية",
    healthcare: "الرعاية الصحية",
    others: "آخرون",
    signIn: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    adminPanel: "لوحة التحكم",
    searchPlaceholder: "ابحث عن الفحوصات المخبرية المنزلية، الرعاية...",
    myLabTest: "فحوصاتي المخبرية",
    myHealthRecords: "سجلاتي الصحية",
    carePlan: "خطة الرعاية",
    heroTitle: "منصتك المتكاملة لحجز خدمات الرعاية الصحية المنزلية",
    heroSub: "تجنب غرف الانتظار في العيادات. توفر لك نيفورا أطباء عامين مرخصين، وأخصائيي علاج طبيعي محترفين، وممرضات معتمدات من هيئة الصحة بدبي مباشرة إلى باب منزلك في غضون 60 دقيقة.",
    heroBadge: "مزود خدمة صحية منزلية معتمد من هيئة الصحة بدبي",
    bookNow: "احجز الآن",
    viewAllServices: "عرض جميع الخدمات",
    trustedByFamilies: "موثوق به من قبل العائلات في جميرا، مارينا، ووسط مدينة دبي.",
    clinicalCategories: "الفئات السريرية",
    exploreCategories: "استكشف فئاتنا الطبية المرخصة من هيئة الصحة بدبي والمصممة لتوفير أقصى درجات الراحة في المنزل والنتائج العلاجية الدقيقة.",
    popularLabTests: "الفحوصات المخبرية المنزلية الشائعة",
    popularPhysio: "جلسات العلاج الطبيعي والتأهيل",
    popularNurse: "الرعاية التمريضية المهنية في المنزل",
    viewDetails: "عرض التفاصيل",
    immediateBook: "احجز فوراً",
    priceText: "درهم",
    addToCart: "إضافة إلى السلة",
    cartButton: "الذهاب إلى السلة",
    insuranceTitle: "شركاؤنا في التأمين الطبي",
    insuranceSub: "فوترة مباشرة واسترداد سهل للمطالبات مع أفضل مقدمي التأمين العالميين والإقليميين.",
    helpTitle: "هل تحتاج إلى مساعدة مهنية؟",
    helpSub: "أطقم الإرسال الطبي المعتمدة لدينا متصلة بالإنترنت على مدار الساعة طوال أيام الأسبوع. اتصل بنا أو تحدث معنا للحصول على توصيات مخصصة.",
    phoneBtn: "اتصل بنا +971 4 123 4567",
    whatsappBtn: "تواصل عبر واتساب",
    resultsTitle: "نتائج البحث",
    backHome: "العودة للرئيسية",
    noResults: "لم يتم العثور على خدمات تطابق بحثك.",
    reviewsTitle: "شهادات المرضى المعتمدة"
  },
  hi: {
    promoBanner: "विशेष ऑफर: कोड ELARA20 के साथ पहले लैब टेस्ट पर 20% की छूट",
    promoLabel: "प्रोमो",
    doctorVisit: "डॉक्टर विजिट",
    physiotherapy: "फिजियोथेरेपी",
    ivTherapy: "आईवी थेरेपी",
    labTests: "लैब टेस्ट",
    healthcare: "स्वास्थ्य देखभाल",
    others: "अन्य",
    signIn: "साइन इन करें",
    logout: "लॉगआउट",
    adminPanel: "एडमिन पैनल",
    searchPlaceholder: "घर पर लैब टेस्ट, स्वास्थ्य देखभाल आदि खोजें...",
    myLabTest: "मेरे लैब टेस्ट",
    myHealthRecords: "मेरे स्वास्थ्य रिकॉर्ड",
    carePlan: "केयर प्लान",
    heroTitle: "होम हेल्थकेयर सेवाओं की बुकिंग के लिए आपका ऑल-इन-वन प्लेटफॉर्म",
    heroSub: "क्लीनिक के प्रतीक्षालय की कतारों को छोड़ें। निवोरा लाइसेंस प्राप्त डॉक्टरों, पेशेवर फिजियोथेरेपिस्ट और डीएचए-प्रमाणित नर्सों को 60 मिनट के भीतर सीधे आपके दरवाजे पर लाता है।",
    heroBadge: "डीएचए प्रमाणित गृह स्वास्थ्य प्रदाता",
    bookNow: "अभी बुक करें",
    viewAllServices: "सभी सेवाएं देखें",
    trustedByFamilies: "जुमेराह, मरीना और डाउनटाउन दुबई में परिवारों द्वारा विश्वसनीय।",
    clinicalCategories: "चिकित्सीय श्रेणियां",
    exploreCategories: "अधिकतम इन-होम आराम और सटीक उपचार परिणामों के लिए डिज़ाइन की गई हमारी डीएचए-लाइसेंस प्राप्त चिकित्सा श्रेणियों का अन्वेषण करें।",
    popularLabTests: "लोकप्रिय क्लिनिकल इन-होम लैब टेस्ट",
    popularPhysio: "फिजियोथेरेपी और पुनर्वास सत्र",
    popularNurse: "पेशेवर इन-होम नर्सिंग केयर",
    viewDetails: "विवरण देखें",
    immediateBook: "तुरंत बुक करें",
    priceText: "एईडी",
    addToCart: "कार्ट में जोड़ें",
    cartButton: "कार्ट पर जाएं",
    insuranceTitle: "हमारे क्लिनिकल बीमा भागीदार",
    insuranceSub: "प्रीमियम वैश्विक और क्षेत्रीय बीमा प्रदाताओं के साथ सीधे बिलिंग और आसान दावा प्रतिपूर्ति।",
    helpTitle: "पेशेवर मदद की ज़रूरत है?",
    helpSub: "हमारे डीएचए-प्रमाणित चिकित्सा प्रेषक 24/7 ऑनलाइन उपलब्ध हैं। व्यक्तिगत सेवा अनुशंसाओं के लिए हमें कॉल करें या चैट करें।",
    phoneBtn: "कॉल करें +971 4 123 4567",
    whatsappBtn: "व्हाट्सएप डिस्पैचर",
    resultsTitle: "खोज परिणाम",
    backHome: "होमपेज पर वापस जाएं",
    noResults: "आपकी खोज से मेल खाती कोई सेवा नहीं मिली।",
    reviewsTitle: "सत्यापित रोगी समीक्षाएं"
  }
};

export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

export function getImageUrl(imagePath?: string): string {
  const fallback = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80";
  if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "" || imagePath === "null" || imagePath === "undefined") {
    return fallback;
  }
  
  const trimmed = imagePath.trim();
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Convert Windows backslashes
  let cleaned = trimmed.replace(/\\/g, "/");

  // Fix duplicate /uploads/uploads
  cleaned = cleaned.replace(/\/uploads\/uploads\//g, "/uploads/");

  // Strip public prefix
  cleaned = cleaned.replace(/^\/?public\/uploads\//, "/uploads/");
  cleaned = cleaned.replace(/^\/?public\//, "/");

  // Handle "uploads/file.ext" -> "/uploads/file.ext"
  if (cleaned.startsWith("uploads/")) {
    cleaned = `/${cleaned}`;
  }

  // Handle filenames missing leading /uploads/
  if (!cleaned.startsWith("/uploads/")) {
    if (cleaned.startsWith("/")) {
      cleaned = `/uploads${cleaned}`;
    } else {
      cleaned = `/uploads/${cleaned}`;
    }
  }

  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || "";
  let fullUrl = `${apiBaseUrl}${cleaned}`;

  // Cache-busting parameter: prevent browser HTTP cache from showing stale old image after edit
  if (!fullUrl.includes("?")) {
    const timeMatch = fullUrl.match(/upload_(\d+)_/);
    if (timeMatch && timeMatch[1]) {
      fullUrl += `?t=${timeMatch[1]}`;
    } else {
      fullUrl += `?v=${encodeURIComponent(cleaned)}`;
    }
  }

  return fullUrl;
}

