package com.riad.service;

import com.riad.domain.entity.Photo;
import com.riad.domain.entity.Room;
import com.riad.dto.response.ChatbotResponse;
import com.riad.dto.response.ChatbotRoomInfo;
import com.riad.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final RoomRepository roomRepository;

    @Value("${chatbot.huggingface.api-token:}")
    private String huggingfaceToken;

    @Value("${chatbot.huggingface.model:HuggingFaceH4/zephyr-7b-beta}")
    private String huggingfaceModel;

    private static final String HF_API_URL = "https://api-inference.huggingface.co/models/";

    // ─────────────────────────────────────────────────────────────
    // Public API helpers
    // ─────────────────────────────────────────────────────────────

    public List<ChatbotRoomInfo> getAllRooms() {
        return roomRepository.findAll().stream().map(this::toRoomInfo).toList();
    }

    public List<ChatbotRoomInfo> getAvailableRooms() {
        return roomRepository.findByAvailableTrue().stream().map(this::toRoomInfo).toList();
    }

    public ChatbotRoomInfo getRoomById(Long id) {
        return roomRepository.findById(id).map(this::toRoomInfo).orElse(null);
    }

    // ─────────────────────────────────────────────────────────────
    // Message processing
    // ─────────────────────────────────────────────────────────────

    public ChatbotResponse processMessage(String rawMessage, String language) {
        String lang = (language != null && !language.isBlank()) ? language : "fr";
        String message = sanitizeInput(rawMessage);

        if (message.isEmpty()) {
            return ChatbotResponse.text(getErrorMessage(lang));
        }

        String lower = message.toLowerCase();

        // Detect intent by keywords (multilingual)
        if (matchesAvailability(lower)) {
            return handleAvailability(lang);
        }
        if (matchesRoomList(lower)) {
            return handleRoomList(lang);
        }
        if (matchesPrice(lower)) {
            return handlePrice(lang);
        }
        if (matchesAddress(lower)) {
            return handleAddress(lang);
        }
        if (matchesReservation(lower)) {
            return handleReservation(lang);
        }
        if (matchesCapacity(lower)) {
            return handleCapacity(lower, lang);
        }
        if (matchesMarrakech(lower)) {
            return handleMarrakech(lang);
        }
        if (matchesAmenities(lower)) {
            return handleAmenities(lang);
        }
        if (matchesGreeting(lower)) {
            return handleGreeting(lang);
        }

        // Fallback: try HuggingFace if configured, otherwise generic response
        if (huggingfaceToken != null && !huggingfaceToken.isBlank()) {
            return callHuggingFace(message, lang);
        }

        return handleGeneric(lang);
    }

    // ─────────────────────────────────────────────────────────────
    // Intent matchers
    // ─────────────────────────────────────────────────────────────

    private boolean matchesGreeting(String lower) {
        return lower.matches(".*(bonjour|bonsoir|salut|hello|hi|hola|buenos|مرحبا|السلام|أهلا).*");
    }

    private boolean matchesAvailability(String lower) {
        return lower.matches(".*(disponible|dispo|available|availability|libre|فاضي|متاح|disponib).*");
    }

    private boolean matchesRoomList(String lower) {
        return lower.matches(".*(chambre|chambre|room|rooms|suite|غرف|غرفة|habitaci).*")
                && !lower.matches(".*(réserver|réservation|book|reservar|احجز|حجز).*");
    }

    private boolean matchesPrice(String lower) {
        return lower.matches(".*(prix|price|tarif|coût|cost|combien|how much|cuánto|سعر|تكلفة|ثمن).*");
    }

    private boolean matchesAddress(String lower) {
        return lower.matches(".*(adresse|address|où|where|localisation|location|situé|dirección|عنوان|أين|مكان).*");
    }

    private boolean matchesReservation(String lower) {
        return lower.matches(".*(réserver|réservation|booking|book|reservar|reservación|احجز|حجز|reservation).*");
    }

    private boolean matchesCapacity(String lower) {
        return lower.matches(".*(personne|person|capacité|capacity|personnes|guests|personas|أشخاص|شخص|\\d+\\s*pers).*");
    }

    private boolean matchesMarrakech(String lower) {
        return lower.matches(".*(marrakech|médina|medina|majorelle|jemaa|djemaa|fna|souk|مراكش|جامع الفنا|المدينة).*");
    }

    private boolean matchesAmenities(String lower) {
        return lower.matches(".*(équipement|amenity|amenities|service|wifi|piscine|pool|petit.déjeuner|breakfast|desayuno|مرافق|خدمات).*");
    }

    // ─────────────────────────────────────────────────────────────
    // Intent handlers
    // ─────────────────────────────────────────────────────────────

    private ChatbotResponse handleGreeting(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> "Hello! Welcome to Riad Lee. 🌟 I'm your virtual assistant. I can help you with rooms, availability, prices, reservations, and information about Marrakech. How can I assist you today?";
            case "ar" -> "مرحباً! أهلاً وسهلاً في رياض لي. 🌟 أنا مساعدك الافتراضي. يمكنني مساعدتك في الغرف والتوافر والأسعار والحجوزات ومعلومات عن مراكش. كيف يمكنني مساعدتك اليوم؟";
            case "es" -> "¡Hola! Bienvenido al Riad Lee. 🌟 Soy tu asistente virtual. Puedo ayudarte con habitaciones, disponibilidad, precios, reservas e información sobre Marrakech. ¿Cómo puedo ayudarte hoy?";
            default  -> "Bonjour ! Bienvenue au Riad Lee. 🌟 Je suis votre assistant virtuel. Je peux vous aider avec les chambres, la disponibilité, les tarifs, les réservations et des informations sur Marrakech. Comment puis-je vous aider ?";
        });
    }

    private ChatbotResponse handleAvailability(String lang) {
        List<ChatbotRoomInfo> available = getAvailableRooms();
        if (available.isEmpty()) {
            return ChatbotResponse.text(switch (lang) {
                case "en" -> "I'm sorry, there are currently no available rooms. Please check back later or contact us directly.";
                case "ar" -> "عذراً، لا توجد غرف متاحة حالياً. يرجى المراجعة لاحقاً أو التواصل معنا مباشرة.";
                case "es" -> "Lo siento, actualmente no hay habitaciones disponibles. Por favor, vuelva más tarde o contáctenos directamente.";
                default  -> "Je suis désolé, il n'y a actuellement aucune chambre disponible. Veuillez réessayer plus tard ou nous contacter directement.";
            });
        }

        String intro = switch (lang) {
            case "en" -> "Here are our " + available.size() + " available room(s) right now:";
            case "ar" -> "إليك " + available.size() + " غرفة متاحة حالياً:";
            case "es" -> "Aquí están nuestras " + available.size() + " habitación(es) disponibles ahora mismo:";
            default  -> "Voici nos " + available.size() + " chambre(s) disponible(s) en ce moment :";
        };

        return ChatbotResponse.withRooms(intro, available);
    }

    private ChatbotResponse handleRoomList(String lang) {
        List<ChatbotRoomInfo> rooms = getAllRooms();
        if (rooms.isEmpty()) {
            return ChatbotResponse.text(switch (lang) {
                case "en" -> "We currently have no rooms configured. Please contact us for more information.";
                case "ar" -> "لا توجد غرف مضافة حالياً. يرجى التواصل معنا للمزيد من المعلومات.";
                case "es" -> "Actualmente no tenemos habitaciones configuradas. Contáctenos para más información.";
                default  -> "Nous n'avons actuellement aucune chambre configurée. Contactez-nous pour plus d'informations.";
            });
        }

        String intro = switch (lang) {
            case "en" -> "Here are all our rooms (" + rooms.size() + " in total):";
            case "ar" -> "إليك جميع غرفنا (" + rooms.size() + " في المجموع):";
            case "es" -> "Aquí están todas nuestras habitaciones (" + rooms.size() + " en total):";
            default  -> "Voici toutes nos chambres (" + rooms.size() + " au total) :";
        };

        return ChatbotResponse.withRooms(intro, rooms);
    }

    private ChatbotResponse handlePrice(String lang) {
        List<ChatbotRoomInfo> rooms = getAvailableRooms();
        if (rooms.isEmpty()) {
            return ChatbotResponse.text(switch (lang) {
                case "en" -> "Please contact us for pricing information.";
                case "ar" -> "يرجى التواصل معنا للحصول على معلومات الأسعار.";
                case "es" -> "Por favor, contáctenos para información sobre precios.";
                default  -> "Veuillez nous contacter pour obtenir des informations sur les tarifs.";
            });
        }

        var minPrice = rooms.stream().map(ChatbotRoomInfo::pricePerNight).min(java.math.BigDecimal::compareTo);
        var maxPrice = rooms.stream().map(ChatbotRoomInfo::pricePerNight).max(java.math.BigDecimal::compareTo);

        String priceRange = minPrice.get().compareTo(maxPrice.get()) == 0
                ? minPrice.get() + " MAD"
                : minPrice.get() + " – " + maxPrice.get() + " MAD";

        String intro = switch (lang) {
            case "en" -> "Our room rates range from " + priceRange + " per night. Here are the details:";
            case "ar" -> "تتراوح أسعار غرفنا من " + priceRange + " في الليلة. إليك التفاصيل:";
            case "es" -> "Las tarifas de nuestras habitaciones oscilan entre " + priceRange + " por noche. Aquí los detalles:";
            default  -> "Nos tarifs vont de " + priceRange + " par nuit. Voici les détails :";
        };

        return ChatbotResponse.withRooms(intro, rooms);
    }

    private ChatbotResponse handleAddress(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> """
                    📍 Riad Lee is located in the heart of the historic Medina of Marrakech.
                    
                    Address: Derb Lalla Azzouna, Médina, Marrakech 40000, Morocco
                    
                    How to get there:
                    • From Marrakech-Menara Airport: ~25 min by taxi (approx. 80–100 MAD)
                    • From Jemaa el-Fna Square: ~10 min walk through the Medina
                    • GPS coordinates available on request
                    
                    Our team will send you a detailed map and directions upon reservation confirmation. 🗺️""";
            case "ar" -> """
                    📍 رياض لي يقع في قلب المدينة القديمة التاريخية في مراكش.
                    
                    العنوان: درب للا عزونة، المدينة القديمة، مراكش 40000، المغرب
                    
                    كيف تصل إلينا:
                    • من مطار مراكش-منارة: حوالي 25 دقيقة بالتاكسي (حوالي 80-100 درهم)
                    • من ساحة جامع الفنا: حوالي 10 دقائق سيراً عبر المدينة القديمة
                    • إحداثيات GPS متاحة عند الطلب
                    
                    سيُرسل إليك فريقنا خريطة مفصلة وتعليمات الوصول عند تأكيد الحجز. 🗺️""";
            case "es" -> """
                    📍 El Riad Lee está ubicado en el corazón de la histórica Medina de Marrakech.
                    
                    Dirección: Derb Lalla Azzouna, Médina, Marrakech 40000, Marruecos
                    
                    Cómo llegar:
                    • Desde el aeropuerto Marrakech-Menara: ~25 min en taxi (aprox. 80-100 MAD)
                    • Desde la Plaza Jemaa el-Fna: ~10 min a pie por la Medina
                    • Coordenadas GPS disponibles a pedido
                    
                    Nuestro equipo le enviará un mapa detallado e instrucciones al confirmar su reserva. 🗺️""";
            default  -> """
                    📍 Le Riad Lee est situé au cœur de la Médina historique de Marrakech.
                    
                    Adresse : Derb Lalla Azzouna, Médina, Marrakech 40000, Maroc
                    
                    Comment nous rejoindre :
                    • Depuis l'aéroport de Marrakech-Menara : ~25 min en taxi (environ 80–100 MAD)
                    • Depuis la place Jemaa el-Fna : ~10 min à pied dans la Médina
                    • Coordonnées GPS disponibles sur demande
                    
                    Notre équipe vous enverra un plan détaillé et des instructions lors de la confirmation de votre réservation. 🗺️""";
        });
    }

    private ChatbotResponse handleReservation(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> """
                    📋 How to make a reservation at Riad Lee:
                    
                    1. Browse our rooms in the "Rooms" section
                    2. Choose the room that suits you
                    3. Click "Book this room"
                    4. Fill in your details: name, email, phone, dates
                    5. Submit your request
                    
                    ✅ Our team will confirm your reservation by email within 24 hours.
                    
                    No prepayment required at this stage. Payment is made upon arrival.
                    For any questions: contact@riad-lee.ma""";
            case "ar" -> """
                    📋 كيفية إجراء حجز في رياض لي:
                    
                    1. تصفح غرفنا في قسم "الغرف"
                    2. اختر الغرفة التي تناسبك
                    3. انقر على "احجز هذه الغرفة"
                    4. أدخل بياناتك: الاسم، البريد الإلكتروني، رقم الهاتف، التواريخ
                    5. أرسل طلبك
                    
                    ✅ سيؤكد فريقنا حجزك عبر البريد الإلكتروني خلال 24 ساعة.
                    
                    لا يلزم الدفع المسبق في هذه المرحلة. يتم الدفع عند الوصول.
                    للاستفسار: contact@riad-lee.ma""";
            case "es" -> """
                    📋 Cómo hacer una reserva en Riad Lee:
                    
                    1. Explore nuestras habitaciones en la sección "Habitaciones"
                    2. Elija la habitación que le convenga
                    3. Haga clic en "Reservar esta habitación"
                    4. Complete sus datos: nombre, email, teléfono, fechas
                    5. Envíe su solicitud
                    
                    ✅ Nuestro equipo confirmará su reserva por correo electrónico en 24 horas.
                    
                    No se requiere prepago en esta etapa. El pago se realiza a la llegada.
                    Para consultas: contact@riad-lee.ma""";
            default  -> """
                    📋 Comment effectuer une réservation au Riad Lee :
                    
                    1. Parcourez nos chambres dans la section « Chambres »
                    2. Choisissez la chambre qui vous convient
                    3. Cliquez sur « Réserver cette chambre »
                    4. Remplissez vos coordonnées : nom, email, téléphone, dates
                    5. Soumettez votre demande
                    
                    ✅ Notre équipe confirmera votre réservation par email dans les 24h.
                    
                    Aucun prépaiement requis à ce stade. Le règlement s'effectue à l'arrivée.
                    Pour tout renseignement : contact@riad-lee.ma""";
        });
    }

    private ChatbotResponse handleCapacity(String lower, String lang) {
        // Try to extract a number
        int guests = 2;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(lower);
        if (m.find()) {
            guests = Integer.parseInt(m.group(1));
        }

        final int finalGuests = guests;
        List<ChatbotRoomInfo> rooms = getAllRooms().stream()
                .filter(r -> r.capacity() >= finalGuests)
                .toList();

        if (rooms.isEmpty()) {
            return ChatbotResponse.text(switch (lang) {
                case "en" -> "Unfortunately, we have no rooms that can accommodate " + guests + " person(s). Please contact us for a customized solution.";
                case "ar" -> "للأسف، لا توجد لدينا غرف تستوعب " + guests + " شخص/أشخاص. يرجى التواصل معنا للحصول على حل مخصص.";
                case "es" -> "Lamentablemente, no tenemos habitaciones para " + guests + " persona(s). Contáctenos para una solución personalizada.";
                default  -> "Malheureusement, nous n'avons pas de chambre pouvant accueillir " + guests + " personne(s). Contactez-nous pour une solution personnalisée.";
            });
        }

        String intro = switch (lang) {
            case "en" -> "Here are the rooms that can accommodate " + guests + " person(s):";
            case "ar" -> "إليك الغرف التي تستوعب " + guests + " شخص/أشخاص:";
            case "es" -> "Aquí están las habitaciones que pueden alojar a " + guests + " persona(s):";
            default  -> "Voici les chambres pouvant accueillir " + guests + " personne(s) :";
        };

        return ChatbotResponse.withRooms(intro, rooms);
    }

    private ChatbotResponse handleMarrakech(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> """
                    🌟 Marrakech – The Red City
                    
                    Top places to visit:
                    🔸 Jemaa el-Fna Square – The iconic main square, bustling with performers, food stalls and storytellers
                    🔸 Jardin Majorelle – A stunning botanical garden, home to the Yves Saint Laurent Museum
                    🔸 Bahia Palace – A magnificent 19th-century palace with beautiful gardens
                    🔸 The Medina souks – Labyrinthine markets for spices, leather, crafts and jewelry
                    🔸 Koutoubia Mosque – The iconic 12th-century minaret
                    🔸 Saadian Tombs – Beautifully restored royal mausoleum
                    🔸 Mellah (Jewish Quarter) – Historic neighborhood with unique architecture
                    
                    🍽️ Must try: tagine, couscous, mint tea, msemen, pastilla
                    
                    Best time to visit: October–April for pleasant temperatures.""";
            case "ar" -> """
                    🌟 مراكش – المدينة الحمراء
                    
                    أبرز الأماكن التي يجب زيارتها:
                    🔸 ساحة جامع الفنا – الميدان الرئيسي الأيقوني المليء بالعروض ومحلات الطعام والحكائين
                    🔸 حديقة ماجوريل – حديقة نباتية رائعة، تضم متحف إيف سان لوران
                    🔸 قصر الباهية – قصر رائع يعود للقرن التاسع عشر مع حدائق جميلة
                    🔸 أسواق المدينة القديمة – أسواق متشعبة للتوابل والجلود والحرف اليدوية والمجوهرات
                    🔸 مسجد الكتبية – المئذنة الأيقونية من القرن الثاني عشر
                    🔸 مقابر السعديين – ضريح ملكي مرمم بشكل رائع
                    🔸 الملاح (الحي اليهودي) – حي تاريخي بهندسة معمارية فريدة
                    
                    🍽️ لا تفوتك: الطاجين والكسكس والشاي بالنعناع والمسمن والبسطيلة
                    
                    أفضل وقت للزيارة: أكتوبر–أبريل لدرجات حرارة مناسبة.""";
            case "es" -> """
                    🌟 Marrakech – La Ciudad Roja
                    
                    Lugares imperdibles:
                    🔸 Plaza Jemaa el-Fna – La icónica plaza principal, llena de artistas, puestos de comida y cuentacuentos
                    🔸 Jardín Majorelle – Un impresionante jardín botánico, hogar del Museo Yves Saint Laurent
                    🔸 Palacio de la Bahía – Un magnífico palacio del siglo XIX con hermosos jardines
                    🔸 Los zocos de la Medina – Mercados laberínticos de especias, cuero, artesanía y joyería
                    🔸 Mezquita Koutoubia – El icónico minarete del siglo XII
                    🔸 Tumbas Saadíes – Mausoleo real bellamente restaurado
                    🔸 Mellah (Barrio Judío) – Barrio histórico con arquitectura única
                    
                    🍽️ Imprescindible probar: tagine, cuscús, té de menta, msemen, pastilla
                    
                    Mejor época para visitar: octubre–abril para temperaturas agradables.""";
            default  -> """
                    🌟 Marrakech – La Ville Rouge
                    
                    À ne pas manquer :
                    🔸 Place Jemaa el-Fna – La place emblématique animée par des artistes, stands de cuisine et conteurs
                    🔸 Jardin Majorelle – Un splendide jardin botanique, abritant le Musée Yves Saint Laurent
                    🔸 Palais de la Bahia – Un magnifique palais du XIXe siècle avec de beaux jardins
                    🔸 Les souks de la Médina – Marchés labyrinthiques d'épices, cuir, artisanat et bijoux
                    🔸 Mosquée Koutoubia – L'emblématique minaret du XIIe siècle
                    🔸 Tombeaux Saadiens – Mausolée royal magnifiquement restauré
                    🔸 Mellah (Quartier Juif) – Quartier historique à l'architecture unique
                    
                    🍽️ À goûter absolument : tagine, couscous, thé à la menthe, msemen, pastilla
                    
                    Meilleure période : octobre–avril pour des températures agréables.""";
        });
    }

    private ChatbotResponse handleAmenities(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> """
                    🏡 Services & Amenities at Riad Lee:
                    
                    ✅ Free Wi-Fi throughout the riad
                    ✅ Air conditioning in all rooms
                    ✅ Traditional Moroccan breakfast (on request)
                    ✅ Rooftop terrace with panoramic views
                    ✅ Inner courtyard with fountain
                    ✅ Hammam & spa on request
                    ✅ Concierge service (tours, transport)
                    ✅ 24/7 reception
                    ✅ Airport transfer (on request)
                    ✅ Laundry service
                    
                    Each room may have additional specific amenities. Feel free to ask about a specific room!""";
            case "ar" -> """
                    🏡 الخدمات والمرافق في رياض لي:
                    
                    ✅ واي-فاي مجاني في جميع أنحاء الرياض
                    ✅ تكييف هواء في جميع الغرف
                    ✅ إفطار مغربي تقليدي (عند الطلب)
                    ✅ شرفة على السطح مع إطلالات بانورامية
                    ✅ فناء داخلي مع نافورة
                    ✅ حمام مغربي وسبا عند الطلب
                    ✅ خدمة الكونسيرج (جولات، نقل)
                    ✅ استقبال على مدار الساعة
                    ✅ نقل من/إلى المطار (عند الطلب)
                    ✅ خدمة الغسيل
                    
                    قد تحتوي كل غرفة على مرافق إضافية خاصة. لا تتردد في السؤال عن غرفة محددة!""";
            case "es" -> """
                    🏡 Servicios y comodidades en el Riad Lee:
                    
                    ✅ Wi-Fi gratuito en todo el riad
                    ✅ Aire acondicionado en todas las habitaciones
                    ✅ Desayuno marroquí tradicional (bajo petición)
                    ✅ Terraza en la azotea con vistas panorámicas
                    ✅ Patio interior con fuente
                    ✅ Hammam y spa bajo petición
                    ✅ Servicio de conserjería (tours, transporte)
                    ✅ Recepción 24/7
                    ✅ Traslado al aeropuerto (bajo petición)
                    ✅ Servicio de lavandería
                    
                    Cada habitación puede tener comodidades adicionales específicas. ¡No dude en preguntar por una habitación concreta!""";
            default  -> """
                    🏡 Services et équipements du Riad Lee :
                    
                    ✅ Wi-Fi gratuit dans tout le riad
                    ✅ Climatisation dans toutes les chambres
                    ✅ Petit-déjeuner marocain traditionnel (sur demande)
                    ✅ Terrasse sur le toit avec vue panoramique
                    ✅ Patio intérieur avec fontaine
                    ✅ Hammam & spa sur demande
                    ✅ Service de conciergerie (excursions, transport)
                    ✅ Réception 24h/24
                    ✅ Transfert aéroport (sur demande)
                    ✅ Service de blanchisserie
                    
                    Chaque chambre peut avoir des équipements supplémentaires spécifiques. N'hésitez pas à me demander une chambre en particulier !""";
        });
    }

    private ChatbotResponse handleGeneric(String lang) {
        return ChatbotResponse.text(switch (lang) {
            case "en" -> """
                    I'm not sure I understand your question. Here's what I can help you with:
                    
                    • 🛏️ View available rooms
                    • 💰 Check room prices
                    • 📍 Get our address and directions
                    • 📋 Learn how to make a reservation
                    • 🏡 Discover our services and amenities
                    • 🌟 Get information about Marrakech
                    
                    Feel free to ask me any of these questions!""";
            case "ar" -> """
                    لست متأكداً من فهم سؤالك. إليك ما يمكنني مساعدتك به:
                    
                    • 🛏️ عرض الغرف المتاحة
                    • 💰 الاطلاع على أسعار الغرف
                    • 📍 الحصول على عنواننا وتعليمات الوصول
                    • 📋 معرفة كيفية إجراء حجز
                    • 🏡 اكتشاف خدماتنا ومرافقنا
                    • 🌟 الحصول على معلومات عن مراكش
                    
                    لا تتردد في طرح أي من هذه الأسئلة!""";
            case "es" -> """
                    No estoy seguro de entender su pregunta. Esto es en lo que puedo ayudarle:
                    
                    • 🛏️ Ver habitaciones disponibles
                    • 💰 Consultar precios de habitaciones
                    • 📍 Obtener nuestra dirección e indicaciones
                    • 📋 Conocer cómo hacer una reserva
                    • 🏡 Descubrir nuestros servicios y comodidades
                    • 🌟 Obtener información sobre Marrakech
                    
                    ¡No dude en preguntarme cualquiera de estas cosas!""";
            default  -> """
                    Je ne suis pas sûr de comprendre votre question. Voici ce que je peux faire pour vous :
                    
                    • 🛏️ Voir les chambres disponibles
                    • 💰 Consulter les tarifs des chambres
                    • 📍 Obtenir notre adresse et comment nous rejoindre
                    • 📋 Savoir comment effectuer une réservation
                    • 🏡 Découvrir nos services et équipements
                    • 🌟 Obtenir des informations sur Marrakech
                    
                    N'hésitez pas à me poser l'une de ces questions !""";
        });
    }

    // ─────────────────────────────────────────────────────────────
    // HuggingFace integration (optional)
    // ─────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private ChatbotResponse callHuggingFace(String message, String lang) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(huggingfaceToken);

            String systemPrompt = buildSystemPrompt(lang);
            String formattedInput = "<|system|>\n" + systemPrompt + "</s>\n<|user|>\n" + message + "</s>\n<|assistant|>";

            Map<String, Object> payload = Map.of(
                    "inputs", formattedInput,
                    "parameters", Map.of(
                            "max_new_tokens", 300,
                            "temperature", 0.7,
                            "return_full_text", false
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            String url = HF_API_URL + huggingfaceModel;

            ResponseEntity<List> response = restTemplate.postForEntity(url, entity, List.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> result = (Map<String, Object>) response.getBody().get(0);
                String generatedText = (String) result.get("generated_text");
                if (generatedText != null && !generatedText.isBlank()) {
                    return ChatbotResponse.text(generatedText.trim());
                }
            }
        } catch (Exception e) {
            log.warn("HuggingFace API call failed: {}", e.getMessage());
        }
        return handleGeneric(lang);
    }

    private String buildSystemPrompt(String lang) {
        List<ChatbotRoomInfo> rooms = getAllRooms();
        StringBuilder roomContext = new StringBuilder();
        for (ChatbotRoomInfo r : rooms) {
            roomContext.append("- ").append(r.name())
                    .append(": ").append(r.pricePerNight()).append(" MAD/night, ")
                    .append(r.capacity()).append(" person(s), ")
                    .append(r.available() ? "available" : "unavailable").append("\n");
        }

        return switch (lang) {
            case "en" -> "You are a helpful virtual receptionist for Riad Lee, a traditional Moroccan guesthouse in the Medina of Marrakech. Answer only public, safe questions about the riad, rooms, and Marrakech. Never share private, admin, or sensitive information. Rooms available:\n" + roomContext;
            case "ar" -> "أنت موظف استقبال افتراضي مفيد لرياض لي، دار ضيافة مغربية تقليدية في المدينة القديمة بمراكش. أجب فقط على الأسئلة العامة والآمنة المتعلقة بالرياض والغرف ومراكش. لا تشارك أبداً معلومات خاصة أو إدارية أو حساسة. الغرف المتاحة:\n" + roomContext;
            case "es" -> "Eres un recepcionista virtual útil del Riad Lee, una posada marroquí tradicional en la Medina de Marrakech. Responde solo preguntas públicas y seguras sobre el riad, las habitaciones y Marrakech. Nunca compartas información privada, administrativa o sensible. Habitaciones disponibles:\n" + roomContext;
            default  -> "Tu es un réceptionniste virtuel serviable pour le Riad Lee, une maison d'hôtes marocaine traditionnelle dans la Médina de Marrakech. Réponds uniquement aux questions publiques et sûres sur le riad, les chambres et Marrakech. Ne partage jamais d'informations privées, administratives ou sensibles. Chambres disponibles :\n" + roomContext;
        };
    }

    // ─────────────────────────────────────────────────────────────
    // Security helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Sanitizes input to prevent prompt injection and removes dangerous patterns.
     */
    String sanitizeInput(String input) {
        if (input == null) return "";
        // Remove HTML/script tags
        String cleaned = input.replaceAll("<[^>]*>", "");
        // Remove prompt injection patterns
        cleaned = cleaned.replaceAll("(?i)(ignore|forget|disregard).*(previous|above|instruction|prompt|system)", "");
        cleaned = cleaned.replaceAll("(?i)(you are now|act as|pretend|roleplay|jailbreak)", "");
        // Trim and limit length
        cleaned = cleaned.trim();
        if (cleaned.length() > 500) {
            cleaned = cleaned.substring(0, 500);
        }
        return cleaned;
    }

    private String getErrorMessage(String lang) {
        return switch (lang) {
            case "en" -> "I'm sorry, I couldn't process your message. Please try again.";
            case "ar" -> "عذراً، لم أتمكن من معالجة رسالتك. يرجى المحاولة مرة أخرى.";
            case "es" -> "Lo siento, no pude procesar su mensaje. Por favor, inténtelo de nuevo.";
            default  -> "Je suis désolé, je n'ai pas pu traiter votre message. Veuillez réessayer.";
        };
    }

    // ─────────────────────────────────────────────────────────────
    // Mapper
    // ─────────────────────────────────────────────────────────────

    private ChatbotRoomInfo toRoomInfo(Room room) {
        String coverPhotoUrl = room.getPhotos().stream()
                .filter(Photo::isCoverPhoto)
                .findFirst()
                .map(Photo::getFileUrl)
                .orElse(room.getPhotos().isEmpty() ? null : room.getPhotos().get(0).getFileUrl());

        return new ChatbotRoomInfo(
                room.getId(),
                room.getName(),
                room.getDescription(),
                room.getType().getLabel(),
                room.getPricePerNight(),
                room.getCapacity(),
                room.getSurface(),
                room.isAvailable(),
                Collections.unmodifiableList(room.getAmenities()),
                coverPhotoUrl
        );
    }
}
