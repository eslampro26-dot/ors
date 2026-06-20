// SEO City Metadata — All cities and categories with targeted keywords
// Used by generateMetadata() in city and category layout files

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

// ============================================================
// CITY SEO DATA
// ============================================================
export const citySeoData = {
  'sharm-el-sheikh': {
    en: {
      title: 'Sharm El Sheikh Tours & Day Trips 2025 | ORLUXUS',
      description:
        'Book the best Sharm El Sheikh tours with ORLUXUS. Snorkeling at Ras Mohammed, Tiran Island cruises, quad bike desert safari, submarine trips & more. Family-friendly experiences from €25.',
      keywords:
        'Sharm El Sheikh tours, Sharm El Sheikh day trips, Ras Mohammed snorkeling, Tiran Island cruise, scuba diving Sharm El Sheikh, quad bike safari Sinai, Red Sea boat trips, things to do in Sharm El Sheikh, Naama Bay excursions, Sharm El Sheikh family activities, submarine trip Red Sea, glass bottom boat Sharm',
      image: `${SITE_URL}/og-sharm.jpg`,
    },
    ar: {
      title: 'رحلات شرم الشيخ وجولات البحر الأحمر 2025 | أورلوكسوس',
      description:
        'احجز أفضل رحلات شرم الشيخ مع أورلوكسوس. رحلات جزيرة تيران، غوص في رأس محمد، سفاري رباعي الدفع، رحلات الغواصة والقارب الزجاجي. أسعار تبدأ من 25 يورو.',
      keywords:
        'رحلات شرم الشيخ, جولات بحرية شرم الشيخ, رحلة جزيرة تيران, غوص رأس محمد, سنوركل شرم الشيخ, سفاري صحراء سيناء, رحلات البحر الاحمر, ما يمكن فعله في شرم الشيخ, رحلة الغواصة, القارب الزجاجي شرم',
    },
  },
  'hurghada': {
    en: {
      title: 'Hurghada Boat Trips, Snorkeling & Desert Safari 2025 | ORLUXUS',
      description:
        'Discover the best Hurghada day trips with ORLUXUS. Giftun Island excursions, dolphin watching cruises, coral reef snorkeling, quad bike desert safari & El Gouna tours. Book from €20.',
      keywords:
        'Hurghada day trips, Giftun Island tour, Hurghada snorkeling, dolphin watching Hurghada, quad bike Hurghada, Red Sea diving Hurghada, things to do in Hurghada, El Gouna excursions, Hurghada boat trips, Sahl Hasheesh tours, coral reef Hurghada, Hurghada family activities 2025',
      image: `${SITE_URL}/og-hurghada.jpg`,
    },
    ar: {
      title: 'رحلات الغردقة وجولات البحر الأحمر 2025 | أورلوكسوس',
      description:
        'اكتشف أفضل رحلات الغردقة مع أورلوكسوس. جزيرة الجفتون، مشاهدة الدلافين، سنوركل الشعاب المرجانية، سفاري رباعي الدفع وجولات الجونة. احجز من 20 يورو.',
      keywords:
        'رحلات الغردقة, جزيرة الجفتون, سنوركل الغردقة, مشاهدة الدلافين الغردقة, سفاري رباعي الدفع الغردقة, غوص البحر الأحمر, ما تفعله في الغردقة, جولات الجونة, سهل حشيش, شعاب مرجانية الغردقة',
    },
  },
  'marsa-alam': {
    en: {
      title: 'Marsa Alam Diving, Dolphin House & Eco Tours 2025 | ORLUXUS',
      description:
        'Experience Marsa Alam\'s pristine Red Sea with ORLUXUS. Dolphin House snorkeling at Samadai Reef, Elphinstone diving, sea turtle encounters, Wadi El Gemal eco-tours. Unspoiled Egypt at its best.',
      keywords:
        'Marsa Alam tours, Dolphin House Marsa Alam, Samadai reef snorkeling, Elphinstone diving, sea turtles Marsa Alam, Marsa Alam eco tourism, Wadi El Gemal national park, dugong Marsa Alam, things to do in Marsa Alam, Marsa Alam day trips, Red Sea diving Marsa Alam, Marsa Alam liveaboard',
      image: `${SITE_URL}/og-marsa-alam.jpg`,
    },
    ar: {
      title: 'رحلات مرسى علم وغوص بيت الدلافين 2025 | أورلوكسوس',
      description:
        'استكشف البحر الأحمر البكر في مرسى علم مع أورلوكسوس. سنوركل شعب صمدي (بيت الدلافين)، غوص الفيستون، السلاحف البحرية، ومحمية وادي الجمال الطبيعية.',
      keywords:
        'رحلات مرسى علم, بيت الدلافين مرسى علم, شعب صمدي سنوركل, غوص الفيستون, سلاحف البحر مرسى علم, سياحة بيئية مرسى علم, وادي الجمال, ابقار البحر مرسى علم, ما تفعله في مرسى علم, غوص البحر الأحمر',
    },
  },
  'north-coast': {
    en: {
      title: 'North Coast Egypt — Luxury Beach Resorts & Summer Trips 2025 | ORLUXUS',
      description:
        'Plan your perfect North Coast Egypt vacation with ORLUXUS. Marassi beach resort, Hacienda Bay, Al Alamein new city, Mediterranean beach clubs & summer entertainment packages from Cairo.',
      keywords:
        'North Coast Egypt, Marassi beach Egypt, Hacienda Bay North Coast, North Coast summer vacation, Al Alamein Egypt, Mediterranean beach Egypt, North Coast resorts, Sahel Egypt, things to do North Coast Egypt, North Coast entertainment, summer trips Egypt, Marina El Alamein',
      image: `${SITE_URL}/og-north-coast.jpg`,
    },
    ar: {
      title: 'الساحل الشمالي مصر — منتجعات فاخرة ورحلات صيفية 2025 | أورلوكسوس',
      description:
        'خطط لإجازتك المثالية في الساحل الشمالي مع أورلوكسوس. مراسي، هاسيندا باي، مدينة العلمين الجديدة، شاطئ المتوسط ومراكز الترفيه الصيفية.',
      keywords:
        'الساحل الشمالي مصر, مراسي الساحل الشمالي, هاسيندا باي, إجازة صيفية الساحل, العلمين الجديدة, شاطئ المتوسط مصر, منتجعات الساحل الشمالي, الساحل الشمالي ترفيه, رحلات صيف مصر, مارينا العلمين',
    },
  },
};

// ============================================================
// CATEGORY SEO DATA
// ============================================================
export const categorySeoData = {
  'sea-trips': {
    en: {
      title: (cityName) => `${cityName} Boat Trips & Snorkeling Tours 2025 | ORLUXUS`,
      description: (cityName) =>
        `Book the best sea trips in ${cityName} with ORLUXUS. Snorkeling, scuba diving, dolphin cruises, glass bottom boats & island excursions. All-inclusive packages from €20. Family-friendly.`,
      keywords: (cityName) =>
        `${cityName} boat trips, ${cityName} snorkeling, ${cityName} scuba diving, ${cityName} sea excursions, Red Sea trips ${cityName}, ${cityName} island tour, ${cityName} dolphin cruise, glass bottom boat ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `رحلات بحرية ${cityNameAr} وسنوركل 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `احجز أفضل الرحلات البحرية في ${cityNameAr} مع أورلوكسوس. سنوركل وغوص ورحلات الدلافين والقوارب الزجاجية. باقات شاملة من 20 يورو.`,
    },
  },
  'desert-trips': {
    en: {
      title: (cityName) => `${cityName} Desert Safari & Quad Bike Tours 2025 | ORLUXUS`,
      description: (cityName) =>
        `Experience thrilling desert adventures in ${cityName} with ORLUXUS. Quad bike safaris, camel rides, Bedouin dinner shows & ATV trips under the stars. Book from €25.`,
      keywords: (cityName) =>
        `${cityName} desert safari, quad bike ${cityName}, camel ride ${cityName}, Bedouin dinner ${cityName}, ATV safari ${cityName}, desert adventure ${cityName}, sand dunes ${cityName}, Sinai safari`,
    },
    ar: {
      title: (cityNameAr) => `سفاري الصحراء ${cityNameAr} وركوب الجمال 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `استمتع بمغامرات الصحراء في ${cityNameAr} مع أورلوكسوس. سفاري رباعي الدفع، ركوب الجمال، عشاء بدوي وأنشطة ATV تحت النجوم.`,
    },
  },
  'city-tours': {
    en: {
      title: (cityName) => `${cityName} Sightseeing & City Tours 2025 | ORLUXUS`,
      description: (cityName) =>
        `Explore ${cityName} with expert local guides from ORLUXUS. Historical sightseeing, museum visits, cultural tours, shopping experiences & private guided excursions. Best prices guaranteed.`,
      keywords: (cityName) =>
        `${cityName} city tour, ${cityName} sightseeing, ${cityName} guided tour, ${cityName} cultural tour, ${cityName} historical sites, ${cityName} museums, things to see in ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `جولات مدينة ${cityNameAr} ومعالم سياحية 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `استكشف ${cityNameAr} مع مرشدين محليين خبراء من أورلوكسوس. جولات تاريخية وثقافية وزيارات للمتاحف ومراكز التسوق.`,
    },
  },
  'internal-packages': {
    en: {
      title: (cityName) => `${cityName} Holiday Packages — Hotel, Flight & Transfer | ORLUXUS`,
      description: (cityName) =>
        `All-inclusive holiday packages to ${cityName} with ORLUXUS. Hotel, flights & private airport transfers included. Relaxation, cultural, beach & Nile cruise packages from €200.`,
      keywords: (cityName) =>
        `${cityName} holiday package, ${cityName} all inclusive, ${cityName} vacation package, Egypt beach package, Nile cruise package, ${cityName} hotel deals, Egypt tourism package 2025`,
    },
    ar: {
      title: (cityNameAr) => `باقات سياحية شاملة ${cityNameAr} — فندق وطيران 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `باقات إجازة شاملة إلى ${cityNameAr} مع أورلوكسوس. فندق وطيران وترانسفير خاص. باقات استرخاء وثقافية وشاطئية وكروز النيل.`,
    },
  },
  'transfers': {
    en: {
      title: (cityName) => `${cityName} Airport Transfers & Private Transport | ORLUXUS`,
      description: (cityName) =>
        `Safe and reliable private airport transfers in ${cityName} with ORLUXUS. Meet & greet service, AC vehicles, on-time guaranteed. Book your transfer from €15.`,
      keywords: (cityName) =>
        `${cityName} airport transfer, private transfer ${cityName}, ${cityName} taxi, airport pickup ${cityName}, transport ${cityName}, shuttle ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `ترانسفير مطار ${cityNameAr} ونقل خاص 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `خدمة ترانسفير آمنة وموثوقة من وإلى مطار ${cityNameAr} مع أورلوكسوس. استقبال شخصي، سيارات مكيفة، ضمان الدقة في المواعيد.`,
    },
  },
  'restaurants': {
    en: {
      title: (cityName) => `Best Restaurants in ${cityName} 2025 | ORLUXUS`,
      description: (cityName) =>
        `Discover the finest dining experiences in ${cityName} with ORLUXUS. Egyptian cuisine, seafood, international restaurants, Bedouin dinners & beach clubs. Reserve your table today.`,
      keywords: (cityName) =>
        `restaurants in ${cityName}, best food ${cityName}, ${cityName} seafood, Egyptian cuisine ${cityName}, where to eat ${cityName}, dinner ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `أفضل مطاعم ${cityNameAr} 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `اكتشف تجارب الطعام الأفضل في ${cityNameAr} مع أورلوكسوس. مأكولات مصرية وبحرية وعالمية وعشاء بدوي.`,
    },
  },
  'entertainment': {
    en: {
      title: (cityName) => `${cityName} Entertainment & Nightlife 2025 | ORLUXUS`,
      description: (cityName) =>
        `Enjoy the best entertainment in ${cityName} with ORLUXUS. Nightlife shows, water parks, beach clubs, family events & VIP experiences. Book your night out today.`,
      keywords: (cityName) =>
        `${cityName} entertainment, ${cityName} nightlife, ${cityName} shows, ${cityName} water parks, family fun ${cityName}, ${cityName} events`,
    },
    ar: {
      title: (cityNameAr) => `ترفيه وحياة ليلية ${cityNameAr} 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `استمتع بأفضل الترفيه في ${cityNameAr} مع أورلوكسوس. عروض ليلية وحفلات وأنشطة عائلية ومراكز مائية.`,
    },
  },
  'cafes': {
    en: {
      title: (cityName) => `Best Cafes & Coffee Shops in ${cityName} 2025 | ORLUXUS`,
      description: (cityName) =>
        `Find the most beautiful cafes in ${cityName} with ORLUXUS. Beachfront coffee shops, shisha lounges, rooftop cafes & cozy spots for the perfect relaxation.`,
      keywords: (cityName) =>
        `cafes in ${cityName}, coffee shops ${cityName}, shisha ${cityName}, best cafe ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `أفضل كافيهات ${cityNameAr} 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `اكتشف أجمل الكافيهات في ${cityNameAr} مع أورلوكسوس. كافيهات على الشاطئ وأماكن الشيشة والأسطح وأماكن الاسترخاء.`,
    },
  },
  'shopping': {
    en: {
      title: (cityName) => `Shopping in ${cityName} — Markets, Malls & Souvenirs 2025 | ORLUXUS`,
      description: (cityName) =>
        `Discover the best shopping in ${cityName} with ORLUXUS. Local markets, souvenir shops, malls, spice bazaars & handcraft stores. Find the perfect Egyptian gift.`,
      keywords: (cityName) =>
        `shopping in ${cityName}, ${cityName} markets, ${cityName} souvenirs, ${cityName} mall, Egyptian handicrafts ${cityName}`,
    },
    ar: {
      title: (cityNameAr) => `تسوق في ${cityNameAr} — أسواق ومولات وهدايا 2025 | أورلوكسوس`,
      description: (cityNameAr) =>
        `اكتشف أفضل أماكن التسوق في ${cityNameAr} مع أورلوكسوس. أسواق محلية وتذكارات ومولات وتوابل وحرف يدوية.`,
    },
  },
};

/**
 * Get full SEO metadata for a city page
 */
export function getCitySeoMetadata(slug, locale = 'en') {
  const data = citySeoData[slug];
  if (!data) return null;
  const locData = data[locale] || data.en;
  const path = locale === 'en' ? `/city/${slug}` : `/ar/city/${slug}`;

  return {
    title: locData.title,
    description: locData.description,
    keywords: locData.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}${locale === 'en' ? '' : '/ar'}/city/${slug}`,
      languages: {
        en: `${SITE_URL}/city/${slug}`,
        ar: `${SITE_URL}/ar/city/${slug}`,
        'x-default': `${SITE_URL}/city/${slug}`,
      },
    },
    openGraph: {
      title: locData.title,
      description: locData.description,
      url: `${SITE_URL}${path}`,
      siteName: 'ORLUXUS',
      images: [{ url: locData.image || `${SITE_URL}/og-image.jpg`, alt: locData.title, width: 1200, height: 630 }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locData.title,
      description: locData.description,
      images: [locData.image || `${SITE_URL}/og-image.jpg`],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Get full SEO metadata for a city/category page
 */
export function getCategorySeoMetadata(slug, category, cityNameEn, cityNameAr, locale = 'en') {
  const catData = categorySeoData[category];
  if (!catData) return null;
  const locData = catData[locale] || catData.en;

  const cityName = locale === 'ar' ? cityNameAr : cityNameEn;
  const title = typeof locData.title === 'function' ? locData.title(cityName) : locData.title;
  const description = typeof locData.description === 'function' ? locData.description(cityName) : locData.description;
  const keywords = locData.keywords && typeof locData.keywords === 'function' ? locData.keywords(cityNameEn) : (locData.keywords || '');
  const path = locale === 'en' ? `/city/${slug}/${category}` : `/ar/city/${slug}/${category}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}${locale === 'en' ? '' : '/ar'}/city/${slug}/${category}`,
      languages: {
        en: `${SITE_URL}/city/${slug}/${category}`,
        ar: `${SITE_URL}/ar/city/${slug}/${category}`,
        'x-default': `${SITE_URL}/city/${slug}/${category}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'ORLUXUS',
      images: [{ url: `${SITE_URL}/og-image.jpg`, alt: title, width: 1200, height: 630 }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    robots: { index: true, follow: true },
  };
}
