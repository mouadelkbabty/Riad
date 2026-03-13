import { Injectable, signal } from '@angular/core';

export type Language = 'fr' | 'en' | 'ar';

export interface Translations {
  // Navbar
  nav: {
    rooms: string;
    admin: string;
    book: string;
    logout: string;
    toggleDark: string;
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
    admin: 'Administration',
    book: 'Réserver',
    logout: 'Déconnexion',
    toggleDark: 'Mode sombre',
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
    admin: 'Administration',
    book: 'Book',
    logout: 'Logout',
    toggleDark: 'Dark mode',
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
    admin: 'الإدارة',
    book: 'احجز',
    logout: 'تسجيل الخروج',
    toggleDark: 'الوضع الداكن',
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
  common: {
    loading: 'جارٍ التحميل…',
    error: 'خطأ',
    backToRooms: 'العودة إلى الغرف',
    home: 'الرئيسية',
    rooms: 'الغرف',
  },
};

const TRANSLATIONS: Record<Language, Translations> = { fr: FR, en: EN, ar: AR };

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
    if (stored === 'fr' || stored === 'en' || stored === 'ar') return stored;
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'ar') return 'ar';
    if (browserLang === 'en') return 'en';
    return 'fr';
  }
}
