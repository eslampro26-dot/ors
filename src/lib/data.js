// Cities and their service categories - core data for the platform
export const cities = [
  {
    id: "hurghada",
    nameAr: "الغردقة",
    nameEn: "Hurghada",
    slug: "hurghada",
    emoji: "🌊",
    image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "تُعد الغردقة عاصمة الغوص والرحلات البحرية على ساحل البحر الأحمر، وهي وجهة سياحية عالمية لا مثيل لها بفضل شعابها المرجانية الخلابة ومياهها الفيروزية الصافية. تتميز بمنتجعاتها الفاخرة مثل سهل حشيش والجونة، وتُقدّم أفضل رحلات جزيرة الجفتون ورحلات مشاهدة الدلافين وسنوركل الشعاب المرجانية التي تبدأ من 20 يورو. للمغامرين، تتوفر رحلات سفاري رباعي الدفع وركوب الجمال في الصحراء. تضم الغردقة معالم ثقافية هامة كمسجد الميناء الكبير ومتحف الغردقة الأثري.",
    descriptionEn: "Hurghada is Egypt's premier Red Sea resort city and the top destination for snorkeling, scuba diving, and boat trips. Famous for its vibrant coral reefs, crystal-clear turquoise water, and world-class marine life, Hurghada offers the best day trips including Giftun Island excursions, dolphin watching cruises, and coral reef snorkeling starting from €20. Adventure seekers enjoy quad bike desert safaris and camel rides. Luxury resort areas like Sahl Hasheesh and El Gouna, alongside the historic Hurghada Museum, make it a complete holiday destination.",
    names: {
      en: "Hurghada",
      ar: "الغردقة",
      de: "Hurghada",
      fr: "Hourgada",
      es: "Hurgada",
      it: "Hurghada",
      ru: "Хургада",
      tr: "Hurgada",
      zh: "赫尔格达",
      ja: "ハルガダ"
    },
    descriptions: {
      en: "Hurghada is Egypt's premier Red Sea resort city and the top destination for snorkeling, scuba diving, and boat trips. Famous for its vibrant coral reefs, crystal-clear turquoise water, and world-class marine life, Hurghada offers the best day trips including Giftun Island excursions, dolphin watching cruises, and coral reef snorkeling starting from €20. Adventure seekers enjoy quad bike desert safaris and camel rides. Luxury resort areas like Sahl Hasheesh and El Gouna, alongside the historic Hurghada Museum, make it a complete holiday destination.",
      ar: "تُعد الغردقة عاصمة الغوص والرحلات البحرية على ساحل البحر الأحمر، وهي وجهة سياحية عالمية لا مثيل لها بفضل شعابها المرجانية الخلابة ومياهها الفيروزية الصافية. تتميز بمنتجعاتها الفاخرة مثل سهل حشيش والجونة، وتُقدّم أفضل رحلات جزيرة الجفتون ورحلات مشاهدة الدلافين وسنوركل الشعاب المرجانية التي تبدأ من 20 يورو. للمغامرين، تتوفر رحلات سفاري رباعي الدفع وركوب الجمال في الصحراء.",
      de: "Tauchhauptstadt - Unvergessliche Unterwasserabenteuer und sonnenverwöhnte Strände",
      fr: "Capitale de la plongée - Aventures sous-marines inoubliables et plages ensoleillées",
      es: "Capital del buceo: inolvidables aventuras submarinas y playas bañadas por el sol",
      it: "Capitale della subacquea - Avventure sottomarine indimenticabili e spiagge assolate",
      ru: "Столица дайвинга - незабываемые подводные приключения и солнечные пляжи",
      tr: "Dalışın Başkenti - Unutulmaz su altı maceraları ve güneşli plajlar",
      zh: "潜水之都 - 令人难忘的水下海洋冒险和阳光明媚的海滩",
      ja: "ダイビングの首都 - 忘れられない水中アドベンチャーと日差しが降り注ぐビーチ"
    },
    categories: [
      { id: "sea-trips", slots: 20 },
      { id: "desert-trips", slots: 20 },
      { id: "city-tours", slots: 20 },
      { id: "internal-packages", slots: 20 },
      { id: "restaurants", slots: 20 },
      { id: "cafes", slots: 20 },
      { id: "shopping", slots: 20 },
      { id: "transfers", slots: 20 },
      { id: "entertainment", slots: 20 },
    ],
  },
  {
    id: "marsa-alam",
    nameAr: "مرسى علم",
    nameEn: "Marsa Alam",
    slug: "marsa-alam",
    emoji: "🐬",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "مرسى علم هي الجنة البحرية المخفية على ساحل البحر الأحمر، وجهة الغوص والسياحة البيئية الأولى في مصر. تشتهر عالمياً بأفضل مواقع السنوركل والغوص مثل شعب صمدي (بيت الدلافين) حيث يمكن السباحة مع الدلافين البرية، والفيستون الأسطوري للسلاحف البحرية النادرة وأبقار البحر. تقع بالقرب من محمية وادي الجمال الطبيعية، مما يجعلها وجهة مثالية لعشاق الطبيعة والمغامرة بعيداً عن الازدحام.",
    descriptionEn: "Marsa Alam is Egypt's best-kept secret for eco-tourism and world-class diving. Home to legendary dive sites including Samadai Reef — also known as the Dolphin House — where snorkelers swim alongside wild spinner dolphins, and Elphinstone Reef, rated among the top 10 dive sites in the world. Rare sea turtles and gentle dugongs make this a bucket-list destination. Located near Wadi El Gemal National Park, Marsa Alam offers pristine, uncrowded beaches and an authentic nature experience unlike anywhere else in Egypt.",
    names: {
      en: "Marsa Alam",
      ar: "مرسى علم",
      de: "Marsa Alam",
      fr: "Marsa Alam",
      es: "Marsa Alam",
      it: "Marsa Alam",
      ru: "Марса-Алам",
      tr: "Marsa Alam",
      zh: "马萨阿拉姆",
      ja: "マルサ・アラム"
    },
    descriptions: {
      en: "Marsa Alam is Egypt's best-kept secret for eco-tourism and world-class diving. Home to legendary dive sites including Samadai Reef — also known as the Dolphin House — where snorkelers swim alongside wild spinner dolphins, and Elphinstone Reef, rated among the top 10 dive sites in the world. Rare sea turtles and gentle dugongs make this a bucket-list destination. Located near Wadi El Gemal National Park, Marsa Alam offers pristine, uncrowded beaches and an authentic nature experience unlike anywhere else in Egypt.",
      ar: "مرسى علم هي الجنة البحرية المخفية على ساحل البحر الأحمر، وجهة الغوص والسياحة البيئية الأولى في مصر. تشتهر عالمياً بأفضل مواقع السنوركل والغوص مثل شعب صمدي (بيت الدلافين) حيث يمكن السباحة مع الدلافين البرية، والفيستون الأسطوري للسلاحف البحرية النادرة وأبقار البحر. تقع بالقرب من محمية وادي الجمال الطبيعية، مما يجعلها وجهة مثالية لعشاق الطبيعة والمغامرة بعيداً عن الازدحام.",
      de: "Verstecktes Paradies - Unberührte Strände, Schwimmen mit wilden Delfinen und reiche Korallenreservate",
      fr: "Paradis caché - Plages vierges, nage avec les dauphins sauvages et riches réserves de corail",
      es: "Paraíso escondido: playas vírgenes, nado con delfines salvajes y ricas reservas de coral",
      it: "Paradiso Nascosto - Spiagge incontaminate, nuotate con delfini selvatici e ricche riserve di corallo",
      ru: "Скрытый рай - нетронутые пляжи, плавание с дикими дельфинами и богатые коралловые заповедники",
      tr: "Gizli Cennet - El değmemiş plajlar, vahşi yunuslarla yüzme ve zengin mercan rezervleri",
      zh: "隐藏的天堂 - 原始的海滩、与野生海豚共泳以及丰富的珊瑚保护区",
      ja: "隠れた楽園 - 手つかずのビーチ、野生のイルカとの水泳、豊かなサンゴ保護区"
    },
    categories: [
      { id: "sea-trips", slots: 20 },
      { id: "desert-trips", slots: 20 },
      { id: "city-tours", slots: 20 },
      { id: "internal-packages", slots: 20 },
      { id: "transfers", slots: 20 },
      { id: "restaurants", slots: 20 },
      { id: "cafes", slots: 20 },
      { id: "shopping", slots: 20 },
      { id: "entertainment", slots: 20 },
    ],
  },
  {
    id: "sharm-el-sheikh",
    nameAr: "شرم الشيخ",
    nameEn: "Sharm El Sheikh",
    slug: "sharm-el-sheikh",
    emoji: "🏖️",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "شرم الشيخ 'مدينة السلام' هي أشهر وجهة سياحية في مصر وواحدة من أفضل منتجعات البحر الأحمر في العالم. تُقدّم أفضل الرحلات البحرية لجزيرة تيران، وسنوركل محمية رأس محمد الوطنية بشعابها المرجانية النادرة، ورحلات الغواصة والقارب الزجاجي، فضلاً عن سفاري رباعي الدفع وعشاء بدوي في قلب الصحراء. تضم خليج نعمة النابض بالحياة ليلاً ونهاراً، وهي بوابة دير سانت كاترين التاريخي وجبل موسى المقدس.",
    descriptionEn: "Sharm El Sheikh, the 'City of Peace', is Egypt's most famous resort and one of the world's top diving and snorkeling destinations. Offering the best Red Sea experiences including Tiran Island day cruises, Ras Mohammed National Park snorkeling with its rare coral reefs, submarine trips, glass bottom boat tours, and thrilling quad bike desert safaris from €25. The vibrant Naama Bay comes alive every night, and Sharm is the gateway to St. Catherine's Monastery, Mount Sinai, and Dahab's legendary Blue Hole.",
    names: {
      en: "Sharm El Sheikh",
      ar: "شرم الشيخ",
      de: "Scharm El-Scheich",
      fr: "Charm el-Cheikh",
      es: "Sharm el-Sheij",
      it: "Sharm el-Sheikh",
      ru: "Шарм-эш-Шейх",
      tr: "Şarm El Şeyh",
      zh: "沙姆沙伊赫",
      ja: "シャルム・エル・シェイク"
    },
    descriptions: {
      en: "Sharm El Sheikh, the 'City of Peace', is Egypt's most famous resort and one of the world's top diving and snorkeling destinations. Offering the best Red Sea experiences including Tiran Island day cruises, Ras Mohammed National Park snorkeling with its rare coral reefs, submarine trips, glass bottom boat tours, and thrilling quad bike desert safaris from €25. The vibrant Naama Bay comes alive every night, and Sharm is the gateway to St. Catherine's Monastery, Mount Sinai, and Dahab's legendary Blue Hole.",
      ar: "شرم الشيخ 'مدينة السلام' هي أشهر وجهة سياحية في مصر وواحدة من أفضل منتجعات البحر الأحمر في العالم. تُقدّم أفضل الرحلات البحرية لجزيرة تيران، وسنوركل محمية رأس محمد الوطنية بشعابها المرجانية النادرة، ورحلات الغواصة والقارب الزجاجي، فضلاً عن سفاري رباعي الدفع وعشاء بدوي في قلب الصحراء.",
      de: "Juwel des Roten Meeres - Exquisite Korallenriffe, Tauchen und aufregende Wüstensafaris",
      fr: "Joyau de la mer Rouge - Récifs coralliens exquis, plongée et safaris passionnants dans le désert",
      es: "Joya del Mar Rojo: exquisitos arrecifes de coral, buceo y emocionante safaris por el desierto",
      it: "Gioiello del Mar Rosso - Splendide barriere coralline, immersioni ed emozionanti safari nel deserto",
      ru: "Жемчужина Красного моря - великолепные коралловые рифы, дайвинг и увлекательное сафари в пустыне",
      tr: "Kızıldeniz Mücevheri - Enfes mercan resifleri, dalış ve heyecan verici çöl safarileri",
      zh: "红海明珠 - 精美的珊瑚礁、潜水 and 令人兴奋的沙漠探险",
      ja: "红海の宝石 - 美しいサンゴ礁、ダイビング、そしてエキサイティングな砂漠サファリ"
    },
    categories: [
      { id: "sea-trips", slots: 20 },
      { id: "desert-trips", slots: 20 },
      { id: "city-tours", slots: 20 },
      { id: "internal-packages", slots: 20 },
      { id: "restaurants", slots: 20 },
      { id: "cafes", slots: 20 },
      { id: "shopping", slots: 20 },
      { id: "transfers", slots: 20 },
      { id: "entertainment", slots: 20 },
    ],
  },
  {
    id: "north-coast",
    nameAr: "الساحل الشمالي",
    nameEn: "North Coast",
    slug: "north-coast",
    emoji: "🏖️",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "الساحل الشمالي المصري هو الوجهة الصيفية الأولى والأفضل في مصر، حيث تمتد شواطئه الساحرة على ساحل البحر الأبيض المتوسط بمياه فيروزية صافية ورمال بيضاء ناعمة تُضاهي جزر المالديف. يضم أرقى المنتجعات الفاخرة مثل مراسي وهاسيندا باي ومدينة العلمين الجديدة، التي تحتضن مسرحها الروماني الأثري وأبراجها الحديثة الشاهقة. يتميز الساحل بأجواء ترفيهية استثنائية ليلاً ونهاراً، مع قربه من مقبرة العلمين الحربية ومتحف العلمين العسكري ذي القيمة التاريخية العالية.",
    descriptionEn: "Egypt's North Coast is the ultimate summer destination on the Mediterranean Sea, offering stunning turquoise waters and powdery white sands that rival the Maldives. It is home to Egypt's most exclusive beach resorts including Marassi, Hacienda Bay, and Stella Di Mare, alongside the futuristic Al Alamein New City with its iconic towers and ancient Roman theatre. The region buzzes with world-class entertainment, beach clubs, and outdoor dining. History lovers can visit the El Alamein WWII Museum and the Allied War Cemetery, making it Egypt's perfect blend of luxury and heritage.",
    names: {
      en: "North Coast",
      ar: "الساحل الشمالي",
      de: "Nordküste",
      fr: "Côte Nord",
      es: "Costa Norte",
      it: "Costa Nord",
      ru: "Северное побережье",
      tr: "Kuzey Kıyısı",
      zh: "北海岸",
      ja: "北海岸"
    },
    descriptions: {
      en: "Egypt's North Coast is the ultimate summer destination on the Mediterranean Sea, offering stunning turquoise waters and powdery white sands that rival the Maldives. It is home to Egypt's most exclusive beach resorts including Marassi, Hacienda Bay, and Stella Di Mare, alongside the futuristic Al Alamein New City with its iconic towers and ancient Roman theatre. The region buzzes with world-class entertainment, beach clubs, and outdoor dining. History lovers can visit the El Alamein WWII Museum and the Allied War Cemetery, making it Egypt's perfect blend of luxury and heritage.",
      ar: "الساحل الشمالي المصري هو الوجهة الصيفية الأولى والأفضل في مصر، حيث تمتد شواطئه الساحرة على ساحل البحر الأبيض المتوسط بمياه فيروزية صافية ورمال بيضاء ناعمة تُضاهي جزر المالديف. يضم أرقى المنتجعات الفاخرة مثل مراسي وهاسيندا باي ومدينة العلمين الجديدة، التي تحتضن مسرحها الروماني الأثري وأبراجها الحديثة الشاهقة. يتميز الساحل بأجواء ترفيهية استثنائية ليلاً ونهاراً.",
      de: "Goldene Küste - Türkisfarbenes Wasser, schöne Sandstrände und erstklassige Unterhaltung",
      fr: "Côte d'Or - Eaux turquoise, belles beaches de sable et ambiance de divertissement haut de gamme",
      es: "Costa Dorada: aguas turquesas, hermosas playas de arena y ambiente de entretenimiento premium",
      it: "Costa d'Oro - Acque turchesi, splendide spiagge sabbiose e intrattenimento premium",
      ru: "Золотой берег - бирюзовая вода, песчаные пляжи и первоклассные развлечения",
      tr: "Altın Sahil - Turkuaz sular, güzel kumsallar ve birinci sınıf eğlence atmosferi",
      zh: "黄金海岸 - 碧绿的海水、美丽的沙滩和高档...的娱乐氛围",
      ja: "黄金海岸 - ターコイズブルー...の海、美しい砂浜、そしてプレミアムなエンターテインメント"
    },
    categories: [
      { id: "sea-trips", slots: 20 },
      { id: "desert-trips", slots: 20 },
      { id: "city-tours", slots: 20 },
      { id: "internal-packages", slots: 20 },
      { id: "restaurants", slots: 20 },
      { id: "cafes", slots: 20 },
      { id: "shopping", slots: 20 },
      { id: "transfers", slots: 20 },
      { id: "entertainment", slots: 20 },
    ],
  },
];

export const internalPackages = [
  {
    id: "relaxation",
    names: {
      en: "Relaxation Packages", ar: "باقات استرخاء استثنائية", de: "Entspannungspakete", fr: "Formules de Relaxation",
      es: "Paquetes de Relajación", it: "Pacchetti Relax", ru: "Пакеты отдыха", tr: "Rahatlama Paketleri",
      zh: "休闲度假套餐", ja: "リラクゼーションパック"
    },
    descriptions: {
      en: "Hotel + Flight + Private Airport Transfer", ar: "فندق + طيران + ترانسفير خاص من المطار", de: "Hotel + Flug + Privater Flughafentransfer", fr: "Hôtel + Vol + Transfert Privé Aéroport",
      es: "Hotel + Vuelo + Traslado Privado al Aeropuerto", it: "Hotel + Volo + Trasferimento Privato in Aeroporto", ru: "Отель + Авиаперелет + Индивидуальный трансфер", tr: "Otel + Uçuş + Özel Havalimanı Transferi",
      zh: "酒店 + 机票 + 私人机场接送", ja: "ホテル + フライト + プライベート空港送迎"
    },
    icon: "🧖", slots: 20
  },
  {
    id: "cultural",
    names: {
      en: "Cultural Packages", ar: "جولات سياحية ثقافية", de: "Kulturpakete", fr: "Formules Culturelles",
      es: "Paquetes Culturales", it: "Pacchetti Culturali", ru: "Культурные туры", tr: "Kültür Paketleri",
      zh: "文化之旅套餐", ja: "文化歴史パッケージ"
    },
    descriptions: {
      en: "Guided cultural tours, museum tickets, and historic sightseeing", ar: "جولات ثقافية وتاريخية برفقة مرشدين وتذاكر المتاحف والمعالم", de: "Geführte Kulturreisen, Museumstickets und historische Sehenswürdigkeiten", fr: "Visites culturelles guidées, billets de musée et visites historiques",
      es: "Visitas culturales guiadas, entradas a museos y turismo histórico", it: "Tour culturali guidati, biglietti per i musei e visite storiche", ru: "Экскурсии с гидом, билеты в музеи и исторические достопримечательности", tr: "Rehberli kültür turları, müze biletleri ve tarihi geziler",
      zh: "导游文化之旅、博物馆门票和历史古迹观光", ja: "ガイド付き文化ツアー、美術館のチケット、歴史的観光名所の見学"
    },
    icon: "🏺", slots: 20
  },
  {
    id: "relaxation-cultural",
    names: {
      en: "Relaxation & Cultural", ar: "باقات استرخاء وثقافة", de: "Entspannung & Kultur", fr: "Détente & Culture",
      es: "Relajación y Cultura", it: "Relax e Cultura", ru: "Отдых и культура", tr: "Dinlenme ve Kültür",
      zh: "休闲与文化融合套餐", ja: "リラックス & カルチャー"
    },
    descriptions: {
      en: "An elegant combination of resort luxury and historical explorations", ar: "مزيج فاخر من استجمام المنتجع واستكشاف المعالم التاريخية لمصر", de: "Eine elegante Kombination aus Resort-Luxus und historischen Entdeckungen", fr: "Une combinaison élégante de luxe balnéaire et d'explorations historiques",
      es: "Una elegante combinación de lujo en complejos turísticos y exploraciones históricas", it: "Un elegante connubio tra resort di lusso ed esplorazioni storiche", ru: "Элегантное сочетание роскошного курорта и исторических исследований", tr: "Resort lüksü ve tarihi keşiflerin zarif bir kombinasyonu",
      zh: "度假村奢华与历史探索的优雅结合", ja: "リゾートの贅沢さと歴史的な探検の優雅な組み合わせ"
    },
    icon: "🌟", slots: 20
  },
  {
    id: "nile-cruise",
    names: {
      en: "Nile Cruise Packages", ar: "باقات كروز النيل الفاخرة", de: "Nilkreuzfahrt-Pakete", fr: "Formules Croisière sur le Nil",
      es: "Paquetes de Crucero por el Nilo", it: "Pacchetti Crociere sul Nilo", ru: "Круизы по Нилу", tr: "Nil Nehri Gemi Turları",
      zh: "尼罗河游轮度假套餐", ja: "ナイル川クルーズツアー"
    },
    descriptions: {
      en: "Full board cruise journey between Luxor and Aswan on a luxury ship", ar: "رحلة كروز كاملة الإقامة بين الأقصر وأسوان على متن سفينة فاخرة", de: "Nilkreuzfahrt mit Vollpension zwischen Luxor und Assuan auf einem Luxusschiff", fr: "Voyage en croisière pension complète entre Louxor et Assouan sur un bateau de luxe",
      es: "Viaje de crucero con pensión completa entre Luxor y Asuán en un barco de lujo", it: "Crociera in pensione completa tra Luxor e Assuan su una nave di lusso", ru: "Круиз по Нилу с полным пансионом между Луксором и Асуаном на роскошном теплоходе", tr: "Lüks bir gemide Luksor ve Aswan arasında tam pansiyon gemi yolculuğu",
      zh: "在豪华游轮上享受卢克索与阿斯旺之间的全包游轮之旅", ja: "豪華客船によるルクソールとアスワンの間のフルボードクルーズ旅行"
    },
    icon: "🛳️", slots: 20
  },
  {
    id: "beach",
    names: {
      en: "Beach Packages", ar: "باقات شاطئية شاملة", de: "Strandurlaubspakete", fr: "Formules Plage",
      es: "Paquetes de Playa", it: "Pacchetti Mare", ru: "Пляжные пакеты", tr: "Plaj Paketleri",
      zh: "海滩度假套餐", ja: "ビーチパッケージ"
    },
    descriptions: {
      en: "All-inclusive beach vacation at Egypt's top resorts", ar: "إجازة شاطئية شاملة كلياً في أرقى المنتجعات المصرية", de: "All-inclusive-Strandurlaub in den besten Resorts Ägyptens", fr: "Vacances à la plage tout compris dans les meilleurs complexes d'Égypte",
      es: "Vacaciones de playa con todo incluido en los mejores complejos de Egipto", it: "Vacanze al mare tutto compreso nei migliori resort dell'Egitto", ru: "Пляжный отдых «все включено» на лучших курортах Египта", tr: "Mısır'ın en iyi tatil köylerinde her şey dahil plaj tatili",
      zh: "埃及顶级度假村的全包海滩假期", ja: "エジプトのトップリゾートでのオールインクルーシブビーチバケーション"
    },
    icon: "🏝️", slots: 20
  },
  {
    id: "entertainment-pkg",
    names: {
      en: "Entertainment Packages", ar: "باقات فعاليات ترفيهية", de: "Unterhaltungspakete", fr: "Formules de Divertissement",
      es: "Paquetes de Entretenimiento", it: "Pacchetti Intrattenimento", ru: "Развлекательные туры", tr: "Eğlence Paketleri",
      zh: "娱乐观光套餐", ja: "エンターテイメントパック"
    },
    descriptions: {
      en: "Event access, nightlife tickets, and family theme parks packages", ar: "حضور الفعاليات وتذاكر السهرات ومدن الألعاب الترفيهية العائلية", de: "Veranstaltungszugang, Tickets für das Nachtleben und Pakete für Familien-Freizeitparks", fr: "Accès aux événements, billets de discothèque et parcs à thèmes familiaux",
      es: "Acceso a eventos, entradas a espectáculos nocturnos y parques temáticos familiares", it: "Accesso a eventi, biglietti per la vita notturna e parcs tematici per famiglie", ru: "Доступ к мероприятиям, билеты в ночные клубы и пакеты развлечений для всей семьи", tr: "Etkinlik girişleri, gece hayatı biletleri ve aile tema parkı paketleri",
      zh: "包含活动门票、夜生活门票和家庭主题公园的套餐", ja: "イベント入場、ナイトライフチケット、家族向けテーマパークのパッケージ"
    },
    icon: "🎉", slots: 20
  },
];

export const categoryTranslations = {
  "sea-trips": {
    en: "Sea Trips", ar: "رحلات بحرية", de: "Seekreuzfahrten", fr: "Croisières Maritimes",
    es: "Cruceros Marítimos", it: "Crociere in Barca", ru: "Морские круизы", tr: "Deniz Turları",
    zh: "海洋巡游", ja: "クルーズツアー"
  },
  "desert-trips": {
    en: "Desert Trips", ar: "سفاري الصحراء", de: "Wüstensafaris", fr: "Safaris Désert",
    es: "Safaris por el Desierto", it: "Safari nel Deserto", ru: "Сафари в пустыне", tr: "Çöl Safarileri",
    zh: "沙漠探险", ja: "砂漠サファリ"
  },
  "city-tours": {
    en: "City Tours", ar: "جولات المدينة", de: "Stadttouren", fr: "Visites de la Ville",
    es: "Tours por la Ciudad", it: "Tour della Città", ru: "Городские экскурсии", tr: "Şehir Turları",
    zh: "城市观光", ja: "市内観光ツアー"
  },
  "internal-packages": {
    en: "Internal Packages", ar: "رحلات باكدج داخلية", de: "Inlands-Pauschalreisen", fr: "Formules Internes",
    es: "Paquetes Internos", it: "Pacchetti Interni", ru: "Внутренние пакеты", tr: "Dahili Paketler",
    zh: "国内度假套餐", ja: "国内パッケージ"
  },
  "restaurants": {
    en: "Restaurants", ar: "مطاعم", de: "Restaurants", fr: "Restaurants",
    es: "Restaurantes", it: "Ristoranti", ru: "Рестораны", tr: "Restoranlar",
    zh: "餐厅", ja: "レストラン"
  },
  "cafes": {
    en: "Cafes", ar: "كافيهات", de: "Cafés", fr: "Cafés",
    es: "Cafeterías", it: "Caffetterie", ru: "Кафе", tr: "Kafeler",
    zh: "咖啡馆", ja: "カフェ"
  },
  "shopping": {
    en: "Shopping", ar: "تسوق", de: "Shopping", fr: "Shopping",
    es: "Compras", it: "Shopping", ru: "Шопинг", tr: "Alışveriş",
    zh: "购物", ja: "ショッピング"
  },
  "transfers": {
    en: "Transfers", ar: "ترانسفير", de: "Transfers", fr: "Transferts",
    es: "Traslados", it: "Trasferimenti", ru: "Трансферы", tr: "Transferler",
    zh: "接送服务", ja: "送迎サービス"
  },
  "entertainment": {
    en: "Entertainment", ar: "ترفيه", de: "Unterhaltung", fr: "Divertissement",
    es: "Entretenimiento", it: "Intrattenimento", ru: "Развлечения", tr: "Eğlence",
    zh: "娱乐项目", ja: "エンターテイメント"
  },
  "packages": {
    en: "Packages", ar: "باقات سياحية", de: "Reisepakete", fr: "Formules",
    es: "Paquetes", it: "Pacchetti", ru: "Туристические пакеты", tr: "Paketler",
    zh: "度假套餐", ja: "パッケージ"
  }
};

export function getLocalizedCity(city, locale = 'en') {
  if (!city) return {};
  const names = city.names || {};
  const descs = city.descriptions || {};
  return {
    ...city,
    name: names[locale] || city.nameEn || city.nameAr,
    description: descs[locale] || city.descriptionEn || city.descriptionAr
  };
}

export function getLocalizedPackage(pkg, locale = 'en') {
  if (!pkg) return {};
  const names = pkg.names || {};
  const descs = pkg.descriptions || {};
  return {
    ...pkg,
    name: names[locale] || pkg.nameEn || pkg.nameAr,
    description: descs[locale] || pkg.descriptionEn || pkg.descriptionAr
  };
}

export function getCategoryName(categoryId, locale = 'en') {
  const cat = categoryTranslations[categoryId];
  return cat ? (cat[locale] || cat.en) : categoryId;
}

// Stats for homepage
export const platformStats = [
  { valueAr: "+500", labelAr: "رحلة متاحة", valueEn: "+500", labelEn: "Available Trips", icon: "🚤" },
  { valueAr: "+50", labelAr: "وجهة سياحية", valueEn: "+50", labelEn: "Destinations", icon: "📍" },
  { valueAr: "+10K", labelAr: "عميل سعيد", valueEn: "+10K", labelEn: "Happy Clients", icon: "😊" },
  { valueAr: "+200", labelAr: "وكيل نشط", valueEn: "+200", labelEn: "Active Agents", icon: "🤝" },
];

// Sample trip data for demo
export const sampleTrips = {
  "sharm-el-sheikh": {
    "sea-trips": [
      {
        id: 1,
        titleAr: "رحلة جزيرة تيران الكاملة",
        titleEn: "Tiran Island Full Day Cruise",
        descriptionAr: "رحلة بحرية ليوم كامل إلى جزيرة تيران الساحرة في خليج العقبة. تشمل سنوركل في أجمل الشعاب المرجانية، وجبة غداء على متن القارب، وقت حر على الشاطئ. مناسبة للعائلات والأزواج والمجموعات.",
        descriptionEn: "Full day boat trip to the stunning Tiran Island in the Gulf of Aqaba. Includes snorkeling at world-class coral reefs, onboard lunch, free beach time, and hotel transfers. Suitable for all ages. One of the best things to do in Sharm El Sheikh.",
        price: 35, currency: "€", rating: 4.8, reviews: 234,
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80",
        duration: "Full Day", includes: "Snorkeling gear, lunch, transfers"
      },
      {
        id: 2,
        titleAr: "رحلة سنوركل محمية رأس محمد",
        titleEn: "Ras Mohammed National Park Snorkeling",
        descriptionAr: "استكشف الشعاب المرجانية النادرة في محمية رأس محمد الوطنية، أفضل موقع غوص وسنوركل في البحر الأحمر. تشمل الرحلة معدات السنوركل، وجبة غداء، وترانسفير من الفندق.",
        descriptionEn: "Snorkel the rare coral reefs of Ras Mohammed National Park — rated among the world's best dive and snorkel sites. Includes snorkeling equipment, lunch, and hotel transfers. A must-do Sharm El Sheikh experience.",
        price: 30, currency: "€", rating: 4.9, reviews: 189,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
        duration: "Full Day", includes: "Snorkeling gear, lunch, park entry, transfers"
      },
      {
        id: 3,
        titleAr: "تجربة غوص سكوبا للمبتدئين",
        titleEn: "Beginner Scuba Diving Experience — Red Sea",
        descriptionAr: "جرّب الغوص للمرة الأولى في البحر الأحمر مع مدرب معتمد. لا تحتاج إلى خبرة سابقة. مناسب للمبتدئين تماماً. يشمل جلسة تدريب، معدات الغوص الكاملة، وجبة خفيفة.",
        descriptionEn: "Try scuba diving for the first time in the crystal-clear Red Sea with a certified PADI instructor. No prior experience needed. Includes training session, full diving equipment, and snacks. One of the most popular activities in Sharm El Sheikh for beginners.",
        price: 50, currency: "€", rating: 4.7, reviews: 156,
        image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=400&q=80",
        duration: "Half Day", includes: "PADI instructor, full equipment, snacks"
      },
      {
        id: 4,
        titleAr: "رحلة الغواصة في البحر الأحمر",
        titleEn: "Red Sea Submarine Trip — Sharm El Sheikh",
        descriptionAr: "استكشف أعماق البحر الأحمر على متن غواصة حديثة دون الحاجة إلى السباحة أو الغوص. شاهد الشعاب المرجانية الملونة والأسماك الاستوائية من نافذة مريحة. تجربة مثالية للعائلات والأطفال.",
        descriptionEn: "Explore the depths of the Red Sea aboard a modern submarine — no swimming or diving required! Watch colorful coral reefs and tropical fish through a large glass window. The perfect family-friendly Sharm El Sheikh activity for all ages.",
        price: 45, currency: "€", rating: 4.6, reviews: 312,
        image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=400&q=80",
        duration: "3 Hours", includes: "Submarine ride, transfers"
      },
      {
        id: 5,
        titleAr: "جولة القارب الزجاجي",
        titleEn: "Glass Bottom Boat Tour — Coral Reef Viewing",
        descriptionAr: "شاهد جمال الشعاب المرجانية والأسماك الملونة من خلال قاع القارب الزجاجي دون البلل. رحلة ممتعة ومناسبة لجميع أفراد العائلة بما فيهم الأطفال والكبار في السن.",
        descriptionEn: "View stunning coral reefs and colorful fish through the glass bottom of a boat without getting wet. A fun and relaxed Sharm El Sheikh boat trip suitable for the whole family including children and elderly visitors.",
        price: 25, currency: "€", rating: 4.5, reviews: 278,
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80",
        duration: "2 Hours", includes: "Glass bottom boat, refreshments"
      },
    ],
    "desert-trips": [
      {
        id: 6,
        titleAr: "سفاري رباعي الدفع في صحراء سيناء",
        titleEn: "Quad Bike Desert Safari — Sinai",
        descriptionAr: "مغامرة صحراوية مثيرة على متن دراجات رباعية الدفع عبر كثبان سيناء الرملية وتضاريسها الجبلية. يشمل مرشداً متخصصاً، تعليمات السلامة، وعرض غروب الشمس الساحر.",
        descriptionEn: "Thrilling quad bike adventure through the sand dunes and rocky terrain of Sinai desert. Includes safety briefing, expert guide, and a spectacular sunset view. One of the most exciting things to do in Sharm El Sheikh for adventure lovers.",
        price: 40, currency: "€", rating: 4.7, reviews: 198,
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80",
        duration: "Half Day", includes: "Quad bike, guide, safety gear"
      },
      {
        id: 7,
        titleAr: "عشاء بدوي مع عرض فلكلوري",
        titleEn: "Bedouin Dinner & Traditional Show — Sinai Desert",
        descriptionAr: "تجربة سيناوية بدوية أصيلة تحت النجوم. يشمل ركوب الجمال، شاي بدوي بالمضارب، عشاء تقليدي شهي، وعرض موسيقي وراقص فلكلوري لا يُنسى.",
        descriptionEn: "Authentic Bedouin experience under the Sinai stars. Includes camel ride to the camp, Bedouin tea, traditional Egyptian dinner, and a mesmerizing music and dance folklore show. Unforgettable evening activity in Sharm El Sheikh.",
        price: 30, currency: "€", rating: 4.8, reviews: 267,
        image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=400&q=80",
        duration: "Evening", includes: "Camel ride, dinner, show, transfers"
      },
      {
        id: 8,
        titleAr: "ركوب الجمال في صحراء سيناء",
        titleEn: "Traditional Camel Ride — Sinai Desert",
        descriptionAr: "تجربة سفاري الجمال الكلاسيكية في صحراء سيناء مع مرشد بدوي محلي. ركوب هادئ ومريح يصحبه شاي بدوي وفرصة للتصوير وسط المناظر الصحراوية الخلابة.",
        descriptionEn: "Classic camel ride safari in the Sinai desert with a local Bedouin guide. A relaxing and memorable experience with Bedouin tea and stunning desert scenery photo opportunities. A traditional Egypt activity loved by all ages.",
        price: 25, currency: "€", rating: 4.4, reviews: 145,
        image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80",
        duration: "3 Hours", includes: "Camel ride, Bedouin tea, guide"
      },
    ],
  },
  "hurghada": {
    "sea-trips": [
      {
        id: 9,
        titleAr: "رحلة جزيرة الجفتون ليوم كامل",
        titleEn: "Giftun Island Full Day Excursion — Hurghada",
        descriptionAr: "اكتشف جمال جزيرة الجفتون البكر على بُعد 40 دقيقة من الغردقة. يشمل سنوركل في شعاب مرجانية بديعة، شاطئ رملي رائع، وجبة غداء شهية، وقت حر وترانسفير من الفندق.",
        descriptionEn: "Discover the pristine beauty of Giftun Island, just 40 minutes from Hurghada. Includes snorkeling at spectacular coral reefs, stunning white sandy beach, delicious lunch buffet, free time, and hotel transfers. The #1 rated Hurghada day trip.",
        price: 25, currency: "€", rating: 4.8, reviews: 432,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
        duration: "Full Day", includes: "Snorkeling gear, lunch, transfers"
      },
      {
        id: 10,
        titleAr: "رحلة مشاهدة الدلافين في البحر الأحمر",
        titleEn: "Dolphin Watching Cruise — Hurghada Red Sea",
        descriptionAr: "رحلة بحرية لمشاهدة الدلافين البرية في بيئتها الطبيعية في البحر الأحمر. فرصة ذهبية للسباحة مع الدلافين حول الجزر. تشمل وجبة غداء وترانسفير وفريق بحري متخصص.",
        descriptionEn: "Cruise the Red Sea to watch wild dolphins in their natural habitat. Golden opportunity to swim with dolphins around the islands. Includes lunch, hotel transfers, and an experienced marine crew. A magical Hurghada experience families will never forget.",
        price: 35, currency: "€", rating: 4.9, reviews: 356,
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80",
        duration: "Full Day", includes: "Lunch, guide, transfers"
      },
      {
        id: 11,
        titleAr: "سنوركل الشعاب المرجانية",
        titleEn: "Coral Reef Snorkeling Tour — Hurghada",
        descriptionAr: "استكشف الشعاب المرجانية الملونة والأسماك الاستوائية الرائعة في مياه الغردقة الصافية. مناسب للمبتدئين وذوي الخبرة. يشمل معدات السنوركل الكاملة ومرشداً متخصصاً.",
        descriptionEn: "Explore vibrant coral reefs and incredible tropical fish in Hurghada's crystal-clear waters. Suitable for beginners and experienced snorkelers alike. Includes full snorkeling equipment and a knowledgeable guide. Best value snorkeling in Hurghada.",
        price: 20, currency: "€", rating: 4.6, reviews: 289,
        image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=400&q=80",
        duration: "Half Day", includes: "Snorkeling gear, guide"
      },
    ],
  },
};

// Generates 3 tiers for a given trip
export function getTripTiers(trip) {
  const basePrice = Number(trip.price) || 30;
  return [
    {
      id: "economy",
      names: {
        en: "Economy Class", ar: "الدرجة الاقتصادية", de: "Economy-Klasse", fr: "Classe Économique",
        es: "Clase Turista", it: "Classe Economica", ru: "Эконом-класс", tr: "Ekonomi Sınıfı",
        zh: "经济舱", ja: "エコノミークラス"
      },
      price: basePrice,
      descriptions: {
        en: "Standard group excursion with basic entry and guidance.",
        ar: "جولة جماعية قياسية شاملة الدخول الأساسي والإرشاد.",
        de: "Standard-Gruppenausflug mit Standard-Eintritt und Führung.",
        fr: "Excursion de groupe standard avec entrée et guidage de base.",
        es: "Excursión grupal estándar con entrada y guía básicas.",
        it: "Escursione di gruppo standard con ingresso e guida di base.",
        ru: "Стандартная групповая экскурсия с базовым входом и гидом.",
        tr: "Temel giriş ve rehberlik içeren standart grup gezisi.",
        zh: "标准团体游览，包含基础门票和导游服务。",
        ja: "基本的な入場とガイドが含まれる標準的なグループツアー。"
      }
    },
    {
      id: "business",
      names: {
        en: "Business Class", ar: "درجة رجال الأعمال", de: "Business-Klasse", fr: "Classe Affaires",
        es: "Clase Ejecutiva", it: "Classe Business", ru: "Бизнес-класс", tr: "İş Sınıfı",
        zh: "公务舱", ja: "ビジネスクラス"
      },
      price: Math.round(basePrice * 1.5),
      descriptions: {
        en: "Upgraded amenities, premium lunch, and priority access.",
        ar: "مرافق مطورة، وجبة غداء ممتازة، ودخول سريع ذو أولوية.",
        de: "Verbesserter Komfort, erstklassiges Mittagessen und bevorzugter Einlass.",
        fr: "Prestations améliorées, déjeuner de qualité et accès prioritaire.",
        es: "Servicios mejorados, almuerzo premium y acceso prioritario.",
        it: "Servizi avanzati, pranzo premium e accesso prioritario.",
        ru: "Улучшенные удобства, премиум-обед и приоритетный доступ.",
        tr: "Yükseltilmiş olanaklar, premium öğle yemeği ve öncelikli erişim.",
        zh: "升级服务、高端午餐和优先入场通道。",
        ja: "アップグレードされたアメニティ、プレミアムランチ、優先入場。"
      }
    },
    {
      id: "vip",
      names: {
        en: "VIP Premium", ar: "VIP فاخرة", de: "VIP-Klasse", fr: "Classe VIP",
        es: "Clase VIP", it: "Classe VIP", ru: "VIP Премиум", tr: "VIP Sınıfı",
        zh: "VIP 豪华舱", ja: "VIPクラス"
      },
      price: Math.round(basePrice * 2.3),
      descriptions: {
        en: "Luxury private transfers, dedicated private guide, and elite amenities.",
        ar: "انتقالات خاصة فاخرة، مرشد خاص مخصص، ومرافق النخبة الراقية.",
        de: "Luxuriöse Privattransfers, eigener Reiseleiter und exklusive Annehmlichkeiten.",
        fr: "Transferts privés de luxe, guide privé dédié et prestations d'élite.",
        es: "Traslados privados de lujo, guía privado exclusivo y comodidades de élite.",
        it: "Trasferimenti privati di lusso, guida privata dedicata e servizi d'élite.",
        ru: "Роскошные индивидуальные трансферы, персональный гид и эксклюзивные услуги.",
        tr: "Lüks özel transferler, size özel rehber ve seçkin olanaklar.",
        zh: "豪华私人接送、专属私人导游及顶级贵宾礼遇。",
        ja: "豪華なプライベート送迎、専属ガイド、一流のアメニティ。"
      }
    }
  ];
}

// Agent tier configuration
export const tierConfig = {
  bronze: { nameAr: "برونزي", nameEn: "Bronze", color: "#cd7f32", icon: "🥉", commission: 10 },
  silver: {
    nameAr: "فضي", nameEn: "Silver", color: "#95a5a6", icon: "🥈", commission: 15,
    criteria: {
      annualSalesEur: 96000,
      annualTransactions: 1920,
      activeSilverPartners: { min: 5, max: 10 },
    },
  },
  gold: { nameAr: "ذهبي", nameEn: "Gold", color: "#f39c12", icon: "🥇", commission: 20 },
  platinum: { nameAr: "بلاتيني", nameEn: "Platinum", color: "#3498db", icon: "💎", commission: 25 },
};
