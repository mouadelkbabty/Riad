import { Injectable, signal } from '@angular/core';

export type Language = 'fr' | 'en' | 'ar' | 'es';

export interface Translations {
  // Navbar
  nav: {
    rooms: string;
    contact: string;
    admin: string;
    book: string;
    logout: string;
    toggleDark: string;
  };
  // Contact page
  contact: {
    title: string;
    subtitle: string;
    whatsappTitle: string;
    whatsappDesc: string;
    whatsappBtn: string;
    instagramTitle: string;
    instagramDesc: string;
    instagramBtn: string;
    emailTitle: string;
    emailDesc: string;
    emailBtn: string;
    formTitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    required: string;
    invalidEmail: string;
    successMsg: string;
    whatsappMessage: string;
  };
  // Home page
  home: {
    heroSubtitle: string;
    heroDesc: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    search: string;
    person: string;
    persons: string;
    featuredRooms: string;
    featuredRoomsDesc: string;
    viewAll: string;
    howItWorks: string;
    howItWorksDesc: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    ctaTitle: string;
    ctaDesc: string;
    viewRooms: string;
    // Values strip
    v1Label: string; v1Desc: string;
    v2Label: string; v2Desc: string;
    v3Label: string; v3Desc: string;
    v4Label: string; v4Desc: string;
  };
  // Room list
  rooms: {
    title: string;
    subtitle: string;
    filters: string;
    roomType: string;
    allTypes: string;
    maxPrice: string;
    minCapacity: string;
    allCapacities: string;
    personsPlus: string;
    resetFilters: string;
    loading: string;
    noRooms: string;
    clearFilters: string;
    perNight: string;
    view: string;
    unavailable: string;
    page: string;
    of: string;
  };
  // Room detail
  roomDetail: {
    back: string;
    bookRoom: string;
    perNight: string;
    capacity: string;
    surface: string;
    amenities: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    nights: string;
    total: string;
    book: string;
    noPhotos: string;
    unavailable: string;
  };
  // Chatbot
  chatbot: {
    title: string;
    placeholder: string;
    send: string;
    welcome: string;
    typing: string;
    error: string;
    close: string;
    open: string;
    perNight: string;
    capacity: string;
    available: string;
    unavailable: string;
    viewRoom: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    backToRooms: string;
    home: string;
    rooms: string;
  };
}

const FR: Translations = {
  nav: {
    rooms: 'Chambres',
    contact: 'Contact',
    admin: 'Administration',
    book: 'Réserver',
    logout: 'Déconnexion',
    toggleDark: 'Mode sombre',
  },
  contact: {
    title: 'Contactez-nous',
    subtitle: 'Nous sommes là pour vous. Choisissez votre moyen de contact préféré.',
    whatsappTitle: 'WhatsApp',
    whatsappDesc: 'Chattez avec nous en temps réel sur WhatsApp.',
    whatsappBtn: 'Ouvrir WhatsApp',
    instagramTitle: 'Instagram',
    instagramDesc: 'Suivez nos actualités et découvrez nos photos.',
    instagramBtn: 'Voir notre Instagram',
    emailTitle: 'Email',
    emailDesc: 'Envoyez-nous un message, nous vous répondrons rapidement.',
    emailBtn: 'Envoyer un email',
    formTitle: 'Envoyer un message',
    name: 'Nom complet',
    namePlaceholder: 'Jean Dupont',
    email: 'Adresse email',
    emailPlaceholder: 'jean@exemple.com',
    subject: 'Sujet',
    subjectPlaceholder: 'Demande de réservation',
    message: 'Message',
    messagePlaceholder: 'Votre message…',
    send: 'Envoyer',
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Adresse email invalide',
    successMsg: 'Votre client email va s\'ouvrir. Merci !',
    whatsappMessage: 'Bonjour, je souhaite obtenir des informations sur le Riad Lee.',
  },
  home: {
    heroSubtitle: 'بيت الضيافة الأصيل',
    heroDesc: "Une demeure ancienne au cœur de la médina de Marrakech, où l'architecture traditionnelle rencontre le confort contemporain.",
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guests: 'Voyageurs',
    search: 'Rechercher',
    person: 'personne',
    persons: 'personnes',
    featuredRooms: 'Nos Chambres en Vedette',
    featuredRoomsDesc: 'Découvrez nos hébergements les plus appréciés',
    viewAll: 'Voir toutes les chambres',
    howItWorks: 'Comment ça marche ?',
    howItWorksDesc: 'Un processus simple et rapide, sans inscription',
    step1Title: 'Choisissez une chambre',
    step1Desc: 'Parcourez nos chambres et suites, découvrez les photos et les équipements.',
    step2Title: 'Remplissez le formulaire',
    step2Desc: 'Indiquez vos dates, vos coordonnées et envoyez votre demande en quelques clics.',
    step3Title: 'Recevez la confirmation',
    step3Desc: 'Notre équipe vous contacte rapidement pour confirmer votre réservation.',
    ctaTitle: 'Prêt pour un séjour inoubliable ?',
    ctaDesc: 'Réservez dès maintenant et bénéficiez d\'un accueil traditionnel marocain chaleureux.',
    viewRooms: 'Voir les chambres',
    v1Label: 'Architecture authentique', v1Desc: 'Bâtiment du XIXe siècle',
    v2Label: 'Service personnalisé', v2Desc: 'Disponible 24h/24',
    v3Label: 'Jardin & patio', v3Desc: 'Oasis de sérénité',
    v4Label: 'Petit-déjeuner marocain', v4Desc: 'Inclus sur demande',
  },
  rooms: {
    title: 'Nos Chambres & Suites',
    subtitle: 'Choisissez votre havre de paix',
    filters: 'Filtres',
    roomType: 'Type de chambre',
    allTypes: 'Tous les types',
    maxPrice: 'Prix max / nuit (MAD)',
    minCapacity: 'Capacité min.',
    allCapacities: 'Toutes',
    personsPlus: '+ personnes',
    resetFilters: 'Réinitialiser les filtres',
    loading: 'Chargement des chambres…',
    noRooms: 'Aucune chambre disponible pour ces critères.',
    clearFilters: 'Effacer les filtres',
    perNight: '/ nuit',
    view: 'Voir →',
    unavailable: 'Indisponible',
    page: 'Page',
    of: '/',
  },
  roomDetail: {
    back: '← Retour aux chambres',
    bookRoom: 'Réserver cette chambre',
    perNight: '/ nuit',
    capacity: 'personnes',
    surface: 'm²',
    amenities: 'Équipements',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guests: 'Voyageurs',
    nights: 'nuits',
    total: 'Total estimé',
    book: 'Réserver maintenant',
    noPhotos: 'Aucune photo disponible',
    unavailable: 'Chambre non disponible',
  },
  chatbot: {
    title: 'Assistant Riad Lee',
    placeholder: 'Posez votre question…',
    send: 'Envoyer',
    welcome: 'Bonjour ! Je suis l\'assistant virtuel du Riad Lee. Je peux vous aider avec les chambres, la disponibilité, les tarifs, les réservations et des informations sur Marrakech. Comment puis-je vous aider ?',
    typing: 'L\'assistant rédige une réponse…',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    close: 'Fermer le chat',
    open: 'Ouvrir le chat',
    perNight: '/ nuit',
    capacity: 'pers.',
    available: 'Disponible',
    unavailable: 'Indisponible',
    viewRoom: 'Voir la chambre',
  },
  common: {
    loading: 'Chargement…',
    error: 'Erreur',
    backToRooms: 'Retour aux chambres',
    home: 'Accueil',
    rooms: 'Chambres',
  },
};

const EN: Translations = {
  nav: {
    rooms: 'Rooms',
    contact: 'Contact',
    admin: 'Administration',
    book: 'Book',
    logout: 'Logout',
    toggleDark: 'Dark mode',
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'We are here for you. Choose your preferred way to reach us.',
    whatsappTitle: 'WhatsApp',
    whatsappDesc: 'Chat with us in real time on WhatsApp.',
    whatsappBtn: 'Open WhatsApp',
    instagramTitle: 'Instagram',
    instagramDesc: 'Follow our updates and discover our photos.',
    instagramBtn: 'View our Instagram',
    emailTitle: 'Email',
    emailDesc: 'Send us a message and we will reply promptly.',
    emailBtn: 'Send an email',
    formTitle: 'Send a message',
    name: 'Full name',
    namePlaceholder: 'John Doe',
    email: 'Email address',
    emailPlaceholder: 'john@example.com',
    subject: 'Subject',
    subjectPlaceholder: 'Booking enquiry',
    message: 'Message',
    messagePlaceholder: 'Your message…',
    send: 'Send',
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    successMsg: 'Your email client will open. Thank you!',
    whatsappMessage: 'Hello, I would like to get information about Riad Lee.',
  },
  home: {
    heroSubtitle: 'An Authentic Guesthouse',
    heroDesc: 'A historic residence in the heart of the Marrakech medina, where traditional architecture meets contemporary comfort.',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    search: 'Search',
    person: 'person',
    persons: 'persons',
    featuredRooms: 'Featured Rooms',
    featuredRoomsDesc: 'Discover our most popular accommodations',
    viewAll: 'View all rooms',
    howItWorks: 'How It Works',
    howItWorksDesc: 'A simple and fast process, no registration required',
    step1Title: 'Choose a room',
    step1Desc: 'Browse our rooms and suites, discover photos and amenities.',
    step2Title: 'Fill out the form',
    step2Desc: 'Enter your dates, contact details and submit your request in a few clicks.',
    step3Title: 'Receive confirmation',
    step3Desc: 'Our team will contact you quickly to confirm your reservation.',
    ctaTitle: 'Ready for an Unforgettable Stay?',
    ctaDesc: 'Book now and enjoy a warm traditional Moroccan welcome.',
    viewRooms: 'View rooms',
    v1Label: 'Authentic Architecture', v1Desc: '19th century building',
    v2Label: 'Personalized Service', v2Desc: 'Available 24/7',
    v3Label: 'Garden & Patio', v3Desc: 'Oasis of serenity',
    v4Label: 'Moroccan Breakfast', v4Desc: 'Included on request',
  },
  rooms: {
    title: 'Our Rooms & Suites',
    subtitle: 'Choose your haven of peace',
    filters: 'Filters',
    roomType: 'Room type',
    allTypes: 'All types',
    maxPrice: 'Max price / night (MAD)',
    minCapacity: 'Min. capacity',
    allCapacities: 'All',
    personsPlus: '+ persons',
    resetFilters: 'Reset filters',
    loading: 'Loading rooms…',
    noRooms: 'No rooms available for these criteria.',
    clearFilters: 'Clear filters',
    perNight: '/ night',
    view: 'View →',
    unavailable: 'Unavailable',
    page: 'Page',
    of: '/',
  },
  roomDetail: {
    back: '← Back to rooms',
    bookRoom: 'Book this room',
    perNight: '/ night',
    capacity: 'persons',
    surface: 'm²',
    amenities: 'Amenities',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    nights: 'nights',
    total: 'Estimated total',
    book: 'Book now',
    noPhotos: 'No photos available',
    unavailable: 'Room not available',
  },
  chatbot: {
    title: 'Riad Lee Assistant',
    placeholder: 'Ask your question…',
    send: 'Send',
    welcome: 'Hello! I am the virtual assistant of Riad Lee. I can help you with rooms, availability, prices, reservations, and information about Marrakech. How can I assist you?',
    typing: 'The assistant is typing…',
    error: 'An error occurred. Please try again.',
    close: 'Close chat',
    open: 'Open chat',
    perNight: '/ night',
    capacity: 'pers.',
    available: 'Available',
    unavailable: 'Unavailable',
    viewRoom: 'View room',
  },
  common: {
    loading: 'Loading…',
    error: 'Error',
    backToRooms: 'Back to rooms',
    home: 'Home',
    rooms: 'Rooms',
  },
};

const AR: Translations = {
  nav: {
    rooms: 'الغرف',
    contact: 'اتصل بنا',
    admin: 'الإدارة',
    book: 'احجز',
    logout: 'تسجيل الخروج',
    toggleDark: 'الوضع الداكن',
  },
  contact: {
    title: 'اتصل بنا',
    subtitle: 'نحن هنا من أجلك. اختر طريقة التواصل المفضلة لديك.',
    whatsappTitle: 'واتساب',
    whatsappDesc: 'تحدث معنا في الوقت الفعلي عبر واتساب.',
    whatsappBtn: 'فتح واتساب',
    instagramTitle: 'إنستغرام',
    instagramDesc: 'تابع أخبارنا واكتشف صورنا.',
    instagramBtn: 'زيارة إنستغرامنا',
    emailTitle: 'البريد الإلكتروني',
    emailDesc: 'أرسل لنا رسالة وسنرد عليك في أقرب وقت.',
    emailBtn: 'إرسال بريد إلكتروني',
    formTitle: 'أرسل رسالة',
    name: 'الاسم الكامل',
    namePlaceholder: 'محمد أحمد',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'mohammed@example.com',
    subject: 'الموضوع',
    subjectPlaceholder: 'استفسار عن الحجز',
    message: 'الرسالة',
    messagePlaceholder: 'رسالتك…',
    send: 'إرسال',
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'عنوان البريد الإلكتروني غير صالح',
    successMsg: 'سيتم فتح تطبيق البريد الإلكتروني. شكراً!',
    whatsappMessage: 'مرحباً، أود الحصول على معلومات حول رياض لي.',
  },
  home: {
    heroSubtitle: 'بيت الضيافة الأصيل',
    heroDesc: 'دار تاريخية في قلب مدينة مراكش العتيقة، حيث تلتقي العمارة التقليدية بالراحة العصرية.',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    guests: 'الضيوف',
    search: 'بحث',
    person: 'شخص',
    persons: 'أشخاص',
    featuredRooms: 'الغرف المميزة',
    featuredRoomsDesc: 'اكتشف أكثر إقامتنا شعبية',
    viewAll: 'عرض جميع الغرف',
    howItWorks: 'كيف يعمل؟',
    howItWorksDesc: 'عملية بسيطة وسريعة، دون تسجيل',
    step1Title: 'اختر غرفة',
    step1Desc: 'تصفح غرفنا وأجنحتنا، اكتشف الصور والمرافق.',
    step2Title: 'املأ النموذج',
    step2Desc: 'أدخل تواريخك ومعلومات الاتصال وأرسل طلبك بنقرات قليلة.',
    step3Title: 'تلقَّ التأكيد',
    step3Desc: 'سيتواصل معك فريقنا بسرعة لتأكيد حجزك.',
    ctaTitle: 'هل أنت مستعد لإقامة لا تُنسى؟',
    ctaDesc: 'احجز الآن واستمتع بترحيب مغربي تقليدي دافئ.',
    viewRooms: 'عرض الغرف',
    v1Label: 'هندسة معمارية أصيلة', v1Desc: 'مبنى من القرن التاسع عشر',
    v2Label: 'خدمة شخصية', v2Desc: 'متاح على مدار الساعة',
    v3Label: 'حديقة وفناء', v3Desc: 'واحة من الهدوء',
    v4Label: 'إفطار مغربي', v4Desc: 'مشمول عند الطلب',
  },
  rooms: {
    title: 'غرفنا وأجنحتنا',
    subtitle: 'اختر ملاذك الهادئ',
    filters: 'فلاتر',
    roomType: 'نوع الغرفة',
    allTypes: 'جميع الأنواع',
    maxPrice: 'السعر الأقصى / ليلة (درهم)',
    minCapacity: 'الحد الأدنى للسعة',
    allCapacities: 'الكل',
    personsPlus: '+ أشخاص',
    resetFilters: 'إعادة تعيين الفلاتر',
    loading: 'جارٍ تحميل الغرف…',
    noRooms: 'لا توجد غرف متاحة لهذه المعايير.',
    clearFilters: 'مسح الفلاتر',
    perNight: '/ ليلة',
    view: 'عرض →',
    unavailable: 'غير متاح',
    page: 'صفحة',
    of: '/',
  },
  roomDetail: {
    back: '← العودة إلى الغرف',
    bookRoom: 'احجز هذه الغرفة',
    perNight: '/ ليلة',
    capacity: 'أشخاص',
    surface: 'م²',
    amenities: 'المرافق',
    checkIn: 'تاريخ الوصول',
    checkOut: 'تاريخ المغادرة',
    guests: 'الضيوف',
    nights: 'ليالٍ',
    total: 'الإجمالي المقدر',
    book: 'احجز الآن',
    noPhotos: 'لا توجد صور متاحة',
    unavailable: 'الغرفة غير متاحة',
  },
  chatbot: {
    title: 'مساعد رياض لي',
    placeholder: 'اطرح سؤالك…',
    send: 'إرسال',
    welcome: 'مرحباً! أنا المساعد الافتراضي لرياض لي. يمكنني مساعدتك في الغرف والتوافر والأسعار والحجوزات ومعلومات عن مراكش. كيف يمكنني مساعدتك؟',
    typing: 'المساعد يكتب رداً…',
    error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    close: 'إغلاق الدردشة',
    open: 'فتح الدردشة',
    perNight: '/ ليلة',
    capacity: 'شخص',
    available: 'متاح',
    unavailable: 'غير متاح',
    viewRoom: 'عرض الغرفة',
  },
  common: {
    loading: 'جارٍ التحميل…',
    error: 'خطأ',
    backToRooms: 'العودة إلى الغرف',
    home: 'الرئيسية',
    rooms: 'الغرف',
  },
};

const ES: Translations = {
  nav: {
    rooms: 'Habitaciones',
    contact: 'Contacto',
    admin: 'Administración',
    book: 'Reservar',
    logout: 'Cerrar sesión',
    toggleDark: 'Modo oscuro',
  },
  contact: {
    title: 'Contáctenos',
    subtitle: 'Estamos aquí para usted. Elija su forma de contacto preferida.',
    whatsappTitle: 'WhatsApp',
    whatsappDesc: 'Chatea con nosotros en tiempo real por WhatsApp.',
    whatsappBtn: 'Abrir WhatsApp',
    instagramTitle: 'Instagram',
    instagramDesc: 'Síganos y descubra nuestras fotos.',
    instagramBtn: 'Ver nuestro Instagram',
    emailTitle: 'Correo electrónico',
    emailDesc: 'Envíenos un mensaje y le responderemos pronto.',
    emailBtn: 'Enviar correo',
    formTitle: 'Enviar un mensaje',
    name: 'Nombre completo',
    namePlaceholder: 'Juan García',
    email: 'Correo electrónico',
    emailPlaceholder: 'juan@ejemplo.com',
    subject: 'Asunto',
    subjectPlaceholder: 'Consulta de reserva',
    message: 'Mensaje',
    messagePlaceholder: 'Su mensaje…',
    send: 'Enviar',
    required: 'Este campo es obligatorio',
    invalidEmail: 'Dirección de correo inválida',
    successMsg: '¡Su cliente de correo se abrirá. ¡Gracias!',
    whatsappMessage: 'Hola, me gustaría obtener información sobre el Riad Lee.',
  },
  home: {
    heroSubtitle: 'Casa de huéspedes auténtica',
    heroDesc: 'Una residencia histórica en el corazón de la medina de Marrakech, donde la arquitectura tradicional se encuentra con el confort contemporáneo.',
    checkIn: 'Llegada',
    checkOut: 'Salida',
    guests: 'Huéspedes',
    search: 'Buscar',
    person: 'persona',
    persons: 'personas',
    featuredRooms: 'Habitaciones Destacadas',
    featuredRoomsDesc: 'Descubra nuestros alojamientos más populares',
    viewAll: 'Ver todas las habitaciones',
    howItWorks: '¿Cómo funciona?',
    howItWorksDesc: 'Un proceso simple y rápido, sin registro requerido',
    step1Title: 'Elija una habitación',
    step1Desc: 'Explore nuestras habitaciones y suites, descubra fotos y comodidades.',
    step2Title: 'Complete el formulario',
    step2Desc: 'Ingrese sus fechas, datos de contacto y envíe su solicitud en pocos clics.',
    step3Title: 'Reciba la confirmación',
    step3Desc: 'Nuestro equipo le contactará rápidamente para confirmar su reserva.',
    ctaTitle: '¿Listo para una estancia inolvidable?',
    ctaDesc: 'Reserve ahora y disfrute de una cálida bienvenida marroquí tradicional.',
    viewRooms: 'Ver habitaciones',
    v1Label: 'Arquitectura auténtica', v1Desc: 'Edificio del siglo XIX',
    v2Label: 'Servicio personalizado', v2Desc: 'Disponible 24/7',
    v3Label: 'Jardín y patio', v3Desc: 'Oasis de serenidad',
    v4Label: 'Desayuno marroquí', v4Desc: 'Incluido bajo petición',
  },
  rooms: {
    title: 'Nuestras Habitaciones y Suites',
    subtitle: 'Elija su refugio de paz',
    filters: 'Filtros',
    roomType: 'Tipo de habitación',
    allTypes: 'Todos los tipos',
    maxPrice: 'Precio máx / noche (MAD)',
    minCapacity: 'Capacidad mín.',
    allCapacities: 'Todas',
    personsPlus: '+ personas',
    resetFilters: 'Restablecer filtros',
    loading: 'Cargando habitaciones…',
    noRooms: 'No hay habitaciones disponibles para estos criterios.',
    clearFilters: 'Borrar filtros',
    perNight: '/ noche',
    view: 'Ver →',
    unavailable: 'No disponible',
    page: 'Página',
    of: '/',
  },
  roomDetail: {
    back: '← Volver a habitaciones',
    bookRoom: 'Reservar esta habitación',
    perNight: '/ noche',
    capacity: 'personas',
    surface: 'm²',
    amenities: 'Comodidades',
    checkIn: 'Llegada',
    checkOut: 'Salida',
    guests: 'Huéspedes',
    nights: 'noches',
    total: 'Total estimado',
    book: 'Reservar ahora',
    noPhotos: 'No hay fotos disponibles',
    unavailable: 'Habitación no disponible',
  },
  chatbot: {
    title: 'Asistente Riad Lee',
    placeholder: 'Haga su pregunta…',
    send: 'Enviar',
    welcome: '¡Hola! Soy el asistente virtual del Riad Lee. Puedo ayudarle con habitaciones, disponibilidad, precios, reservas e información sobre Marrakech. ¿Cómo puedo ayudarle?',
    typing: 'El asistente está escribiendo…',
    error: 'Ocurrió un error. Por favor, inténtelo de nuevo.',
    close: 'Cerrar chat',
    open: 'Abrir chat',
    perNight: '/ noche',
    capacity: 'pers.',
    available: 'Disponible',
    unavailable: 'No disponible',
    viewRoom: 'Ver habitación',
  },
  common: {
    loading: 'Cargando…',
    error: 'Error',
    backToRooms: 'Volver a habitaciones',
    home: 'Inicio',
    rooms: 'Habitaciones',
  },
};

const TRANSLATIONS: Record<Language, Translations> = { fr: FR, en: EN, ar: AR, es: ES };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Language>(this.getInitialLang());

  get t(): Translations {
    return TRANSLATIONS[this.lang()];
  }

  setLang(lang: Language) {
    this.lang.set(lang);
    localStorage.setItem('riad-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  isRtl(): boolean {
    return this.lang() === 'ar';
  }

  private getInitialLang(): Language {
    const stored = localStorage.getItem('riad-lang') as Language | null;
    if (stored === 'fr' || stored === 'en' || stored === 'ar' || stored === 'es') return stored;
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'ar') return 'ar';
    if (browserLang === 'en') return 'en';
    if (browserLang === 'es') return 'es';
    return 'fr';
  }
}
