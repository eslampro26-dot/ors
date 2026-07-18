const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'messages.js');
let content = fs.readFileSync(filePath, 'utf8');

// ================================================================
// Helper: Insert key-value pairs before the closing } of a section
// ================================================================
function insertIntoSection(content, lang, section, keyValuePairs) {
  const langMarker = `  ${lang}: {`;
  const langPos = content.indexOf(langMarker);
  if (langPos === -1) { console.log(`❌ Lang ${lang} not found`); return content; }

  const sectionMarker = `    ${section}: {`;
  const sectionPos = content.indexOf(sectionMarker, langPos);

  // Make sure we're in the right lang block
  const nextLang = content.slice(langPos + langMarker.length).search(/\n  [a-z]{2}: \{/);
  const langEnd = nextLang === -1 ? content.length : langPos + langMarker.length + nextLang;

  if (sectionPos === -1 || sectionPos >= langEnd) {
    console.log(`❌ Section ${section} not found in lang ${lang}`);
    return content;
  }

  // Find the closing bracket using bracket counting
  let depth = 0;
  let i = sectionPos;
  let closePos = -1;
  while (i < langEnd) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { closePos = i; break; }
    }
    i++;
  }
  if (closePos === -1) { console.log(`❌ No close for ${lang}.${section}`); return content; }

  const sectionContent = content.slice(sectionPos, closePos);

  // Build insertion text for missing keys
  let insertText = '';
  for (const [key, value] of Object.entries(keyValuePairs)) {
    if (sectionContent.includes(`${key}:`)) {
      console.log(`  ⏩ ${lang}.${section}.${key} already exists, skipping`);
      continue;
    }
    if (Array.isArray(value)) {
      const items = value.map(v => {
        const esc = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `        '${esc}'`;
      });
      insertText += `      ${key}: [\n${items.join(',\n')}\n      ],\n`;
    } else {
      const esc = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      insertText += `      ${key}: '${esc}',\n`;
    }
  }

  if (!insertText) return content;

  // Insert before the closing brace line
  const lineStart = content.lastIndexOf('\n', closePos);
  content = content.slice(0, lineStart + 1) + insertText + content.slice(lineStart + 1);
  console.log(`  ✅ Inserted into ${lang}.${section}: ${Object.keys(keyValuePairs).join(', ')}`);
  return content;
}

// ================================================================
// All translations to add
// ================================================================
const translations = {
  en: {
    nav: { myBooking: '🔑 My Booking' },
  },
  ar: {
    nav: { myBooking: '🔑 حجزي' },
  },
  de: {
    nav: { myBooking: '🔑 Meine Buchung' },
    hero: {
      storyQuote: 'Mehr als eine Buchung… Eine Geschichte, die Sie nie vergessen werden.',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'Warum ORLUXUS?',
      story: [
        'Stellen Sie sich vor, Sie haben beschlossen, sich ein paar Tage Ruhe und Glück zu gönnen…',
        'Tage, an denen Sie dem Druck des Alltags entfliehen, um unvergessliche Erinnerungen zu schaffen.',
        'Genau hier haben wir begonnen.',
        'Bevor wir Sie um eine Buchung bitten, haben wir uns selbst eine Frage gestellt: Wie können wir jemandem ermöglichen, Ägypten zu besuchen und das Gefühl zu haben, die schönsten Tage seines Lebens erlebt zu haben?',
        'Deshalb haben wir nicht einfach irgendeinen Service gesucht, nicht einfach irgendeinen Ort gewählt und nicht mit irgendjemandem zusammengearbeitet. Wir sind gereist… haben ausprobiert… gefragt… verglichen… und die Details selbst getestet. Denn wir glauben, dass ein außergewöhnliches Erlebnis nicht dem Zufall überlassen wird.',
        'Wir haben unsere Dienstleister nach echten Erfahrungen ausgewählt, denn wir möchten Ihnen nichts anbieten, das wir unserer eigenen Familie und unseren Freunden nicht zumuten würden.',
        'Dann begannen wir ORLUXUS Stück für Stück aufzubauen… Wir haben ein System geschaffen, das jeden Schritt einfach und klar macht, damit Sie sich nicht um Details kümmern müssen, sondern sich nur auf eine Sache konzentrieren können… Genießen.',
        'Wir haben bei jedem Schritt auf Sicherheit geachtet, denn Seelenfrieden ist der erste Schritt zu echtem Genuss.',
        'Wir haben auf die kleinen Details geachtet, denn wir glauben, dass die schönsten Erinnerungen aus Dingen entstehen, die nicht jeder bemerkt… aber die alles bedeuten.',
        'Am Ende haben wir einen Ort geschaffen, an dem Sie ganz Ägypten an einem Ort finden können… Sein Meer und seine Inseln… Seine Abenteuer und seine Ruhe… Seinen Luxus und seine Einfachheit… Seine besten Erlebnisse und seine besten Dienstleister.',
        "Aber die wichtigste Wahrheit ist, dass ORLUXUS nicht nur aus einer kommerziellen Idee entstanden ist… Es entstand aus einem Traum. Einem Traum, bei dem jeder, der zu uns kommt, geht und sagt: 'Es war nicht nur eine Reise… es war ein Erlebnis, das mein Gefühl für Ägypten verändert hat.'",
        'Und deshalb… Wir verkaufen keine Buchungen. Wir verkaufen keine Reisen. Und wir verkaufen keine Aktivitäten. Wir erschaffen Momente… wir schaffen Erinnerungen… und wir bieten ein anderes Erlebnis, denn Sie verdienen es, jede Minute zu leben, als wäre sie speziell für Sie gemacht.',
      ],
    },
  },
  fr: {
    nav: { myBooking: '🔑 Ma réservation' },
    hero: {
      storyQuote: "Plus qu'une réservation… Une histoire que vous n'oublierez jamais.",
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'Pourquoi ORLUXUS ?',
      story: [
        "Imaginez que vous ayez décidé de vous offrir quelques jours de repos et de bonheur…",
        "Des jours où vous échappez aux pressions de la vie pour créer des souvenirs inoubliables.",
        "C'est là que nous avons commencé.",
        "Avant de vous demander de réserver avec nous, nous nous sommes posé une question : Comment permettre à quelqu'un de visiter l'Égypte et de ressentir qu'il a vécu les plus beaux jours de sa vie ?",
        "C'est pourquoi nous n'avons pas cherché n'importe quel service, nous n'avons pas choisi n'importe quel endroit, et nous ne nous sommes pas associés à n'importe qui. Nous avons voyagé… essayé… demandé… comparé… et testé les détails nous-mêmes. Parce que nous croyons qu'une expérience exceptionnelle ne se crée pas par hasard.",
        "Nous avons choisi nos prestataires après de véritables expériences, parce que nous ne voulons pas vous offrir quelque chose que nous ne voudrions pas que nos propres familles et amis vivent.",
        "Puis nous avons commencé à construire ORLUXUS pièce par pièce… Nous avons mis en place un système qui rend chaque étape facile et claire, pour que vous ne vous préoccupiez pas des détails, mais que vous vous concentriez sur une seule chose… Profiter.",
        "Nous avons veillé à la sécurité à chaque étape, car la tranquillité d'esprit est la première étape vers un vrai plaisir.",
        "Nous avons veillé aux petits détails, car nous croyons que les plus beaux souvenirs naissent de choses que tout le monde ne remarque pas forcément… mais qui signifient tout.",
        "En fin de compte, nous avons créé un endroit où vous pouvez trouver toute l'Égypte en un seul lieu… Sa mer et ses îles… Ses aventures et sa sérénité… Son luxe et sa simplicité… Ses meilleures expériences et ses meilleurs prestataires.",
        "Mais la vérité la plus importante est qu'ORLUXUS n'est pas née d'une idée commerciale seulement… Elle est née d'un rêve. Un rêve que chaque personne qui vient chez nous reparte en disant : 'Ce n'était pas seulement un voyage… c'était une expérience qui a changé ma vision de l'Égypte.'",
        "Et c'est pourquoi… Nous ne vendons pas des réservations. Nous ne vendons pas des voyages. Et nous ne vendons pas des activités. Nous créons des moments… nous créons des souvenirs… et nous offrons une expérience différente, parce que vous méritez de vivre chaque minute comme si elle avait été créée spécialement pour vous.",
      ],
    },
  },
  es: {
    nav: { myBooking: '🔑 Mi reserva' },
    hero: {
      storyQuote: 'Más que una reserva… Una historia que nunca olvidarás.',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: '¿Por qué ORLUXUS?',
      story: [
        'Imagina que has decidido darte unos días de descanso y felicidad…',
        'Días en los que escapas de las presiones de la vida para crear recuerdos inolvidables.',
        'Aquí fue donde comenzamos.',
        '¿Antes de pedirte que reserves con nosotros, nos hicimos una pregunta: Cómo podemos hacer que alguien visite Egipto y sienta que ha vivido los días más hermosos de su vida?',
        'Es por eso que no buscamos cualquier servicio, no elegimos cualquier lugar y no nos asociamos con cualquier persona. Viajamos… probamos… preguntamos… comparamos… y probamos los detalles nosotros mismos. Porque creemos que una experiencia excepcional no se crea por casualidad.',
        'Elegimos a nuestros proveedores de servicios después de experiencias reales, porque no queremos ofrecerte nada que no quisiéramos que nuestra propia familia y amigos experimentaran.',
        'Luego comenzamos a construir ORLUXUS pieza por pieza… Implementamos un sistema que hace que cada paso sea fácil y claro, para que no te preocupes por los detalles, sino que te enfoques en una sola cosa… Disfrutar.',
        'Nos preocupamos por la seguridad en cada etapa, porque la tranquilidad es el primer paso para el disfrute verdadero.',
        'Nos preocupamos por los pequeños detalles, porque creemos que los recuerdos más hermosos nacen de cosas que no todos notan… pero que lo significan todo.',
        'Al final, creamos un lugar donde puedes encontrar todo Egipto en un solo lugar… Su mar y sus islas… Sus aventuras y su serenidad… Su lujo y su simplicidad… Sus mejores experiencias y sus mejores proveedores.',
        "Pero la verdad más importante es que ORLUXUS no nació solo de una idea comercial… Nació de un sueño. Un sueño en el que cada persona que viene a nosotros se va diciendo: 'No fue solo un viaje… fue una experiencia que cambió mi sentimiento por Egipto.'",
        'Y es por eso… No vendemos reservas. No vendemos viajes. Y no vendemos actividades. Creamos momentos… creamos recuerdos… y ofrecemos una experiencia diferente, porque mereces vivir cada minuto como si hubiera sido hecho especialmente para ti.',
      ],
    },
  },
  it: {
    nav: { myBooking: '🔑 La mia prenotazione' },
    hero: {
      storyQuote: 'Più di una prenotazione… Una storia che non dimenticherai mai.',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'Perché ORLUXUS?',
      story: [
        "Immagina di aver deciso di regalarti qualche giorno di riposo e felicità…",
        "Giorni in cui fuggi dalle pressioni della vita per creare ricordi indimenticabili.",
        "È qui che abbiamo iniziato.",
        "Prima di chiederti di prenotare con noi, ci siamo posti una domanda: Come possiamo fare in modo che qualcuno visiti l'Egitto e senta di aver vissuto i giorni più belli della propria vita?",
        "Ecco perché non abbiamo cercato un servizio qualsiasi, non abbiamo scelto un posto qualsiasi e non ci siamo associati con chiunque. Abbiamo viaggiato… provato… chiesto… confrontato… e testato i dettagli noi stessi. Perché crediamo che un'esperienza eccezionale non si crei per caso.",
        "Abbiamo scelto i nostri fornitori di servizi dopo esperienze reali, perché non vogliamo offrirti qualcosa che non vorremmo che le nostre stesse famiglie e amici vivessero.",
        "Poi abbiamo iniziato a costruire ORLUXUS pezzo per pezzo… Abbiamo creato un sistema che rende ogni passo semplice e chiaro, in modo che tu non ti preoccupi dei dettagli, ma ti concentri solo su una cosa… Goderti.",
        "Ci siamo preoccupati della sicurezza in ogni fase, perché la tranquillità è il primo passo verso il vero godimento.",
        "Ci siamo preoccupati dei piccoli dettagli, perché crediamo che i ricordi più belli nascano da cose che non tutti notano… ma che significano tutto.",
        "Alla fine abbiamo creato un luogo dove puoi trovare tutta l'Egitto in un unico posto… Il suo mare e le sue isole… Le sue avventure e la sua serenità… Il suo lusso e la sua semplicità… Le sue migliori esperienze e i suoi migliori fornitori.",
        "Ma la verità più importante è che ORLUXUS non è nata solo da un'idea commerciale… È nata da un sogno. Un sogno in cui ogni persona che viene da noi se ne va dicendo: 'Non è stato solo un viaggio… è stata un'esperienza che ha cambiato il mio sentimento verso l'Egitto.'",
        "Ed è per questo… Non vendiamo prenotazioni. Non vendiamo viaggi. E non vendiamo attività. Creiamo momenti… creiamo ricordi… e offriamo un'esperienza diversa, perché meriti di vivere ogni minuto come se fosse stato creato appositamente per te.",
      ],
    },
  },
  ru: {
    nav: { myBooking: '🔑 Моё бронирование' },
    hero: {
      storyQuote: 'Больше, чем бронирование… История, которую вы никогда не забудете.',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'Почему ORLUXUS?',
      story: [
        'Представьте, что вы решили подарить себе несколько дней отдыха и счастья…',
        'Дни, когда вы убегаете от давления жизни, чтобы создать незабываемые воспоминания.',
        'Именно здесь мы начали.',
        'Прежде чем просить вас забронировать у нас, мы задали себе один вопрос: Как сделать так, чтобы кто-то посетил Египет и почувствовал, что прожил самые прекрасные дни своей жизни?',
        'Вот почему мы не искали просто какой-либо сервис, не выбирали просто какое-либо место и не сотрудничали с кем попало. Мы путешествовали… пробовали… спрашивали… сравнивали… и сами тестировали детали. Потому что мы верим, что исключительный опыт не создаётся случайно.',
        'Мы выбирали поставщиков услуг после реального опыта, потому что не хотим предлагать вам то, чего не захотели бы для наших собственных семей и друзей.',
        'Затем мы начали строить ORLUXUS шаг за шагом… Мы создали систему, которая делает каждый шаг простым и понятным, чтобы вы не беспокоились о деталях, а сосредоточились только на одном… Получать удовольствие.',
        'Мы заботились о безопасности на каждом этапе, потому что спокойствие — это первый шаг к настоящему наслаждению.',
        'Мы заботились о мелких деталях, потому что верим, что самые красивые воспоминания рождаются из вещей, которые не все замечают… но которые значат всё.',
        'В итоге мы создали место, где вы можете найти весь Египет в одном месте… Его моря и острова… Его приключения и спокойствие… Его роскошь и простоту… Его лучший опыт и лучших поставщиков услуг.',
        "Но самая важная истина заключается в том, что ORLUXUS родился не только из коммерческой идеи… Он родился из мечты. Мечты, в которой каждый, кто приходит к нам, уходит со словами: 'Это была не просто поездка… это был опыт, который изменил моё ощущение Египта.'",
        'И вот почему… Мы не продаём бронирования. Мы не продаём поездки. И мы не продаём мероприятия. Мы создаём моменты… мы создаём воспоминания… и мы предлагаем другой опыт, потому что вы заслуживаете прожить каждую минуту, словно она была создана специально для вас.',
      ],
    },
  },
  tr: {
    nav: { myBooking: '🔑 Rezervasyonum' },
    hero: {
      storyQuote: 'Sadece bir rezervasyon değil… Asla unutamayacağınız bir hikaye.',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'Neden ORLUXUS?',
      story: [
        'Kendinize birkaç günlük dinlenme ve mutluluk vermeye karar verdiğinizi hayal edin…',
        "Hayatın baskılarından kaçıp unutulmaz anılar yaratacağınız günler.",
        'Biz buradan başladık.',
        "Sizden bizimle rezervasyon yapmanızı istemeden önce kendimize bir soru sorduk: Birinin Mısır'ı ziyaret edip hayatının en güzel günlerini yaşadığını hissetmesini nasıl sağlarız?",
        "İşte bu yüzden herhangi bir hizmet aramadık, herhangi bir yer seçmedik ve herhangi biriyle ortak olmadık. Seyahat ettik… denedik… sorduk… karşılaştırdık… ve detayları kendimiz test ettik. Çünkü olağanüstü bir deneyimin şans eseri yaratılmadığına inanıyoruz.",
        'Hizmet sağlayıcılarımızı gerçek deneyimlerden sonra seçtik, çünkü kendi ailelerimizin ve dostlarımızın yaşamasını istemeyeceğimiz hiçbir şeyi size sunmak istemiyoruz.',
        "Ardından ORLUXUS'u parça parça inşa etmeye başladık… Her adımı kolay ve anlaşılır kılan bir sistem oluşturduk; detaylarla uğraşmak zorunda kalmadan yalnızca tek bir şeye odaklanmanız için… Keyif almak.",
        'Her aşamada güvenliğe önem verdik, çünkü huzur, gerçek zevkin ilk adımıdır.',
        'Küçük detaylara önem verdik, çünkü en güzel anıların herkesin fark etmeyebileceği şeylerden doğduğuna inanıyoruz… ama bunlar her şey demektir.',
        "Sonunda, tüm Mısır'ı tek bir yerde bulabileceğiniz bir yer yarattık… Denizi ve adaları… Maceraları ve dinginliği… Lüksü ve sadeliği… En iyi deneyimleri ve en iyi hizmet sağlayıcıları.",
        "Ancak en önemli gerçek şu ki ORLUXUS yalnızca ticari bir fikirden doğmadı… Bir hayalden doğdu. Bize gelen herkesin şunu söyleyerek ayrıldığı bir hayal: 'Bu sadece bir seyahat değildi… Mısır hakkındaki duygularımı değiştiren bir deneyimdi.'",
        "Ve işte bu yüzden… Rezervasyon satmıyoruz. Seyahat satmıyoruz. Ve etkinlik satmıyoruz. Anlar yaratıyoruz… anılar yaratıyoruz… ve farklı bir deneyim sunuyoruz, çünkü her dakikayı sanki özellikle sizin için yapılmış gibi yaşamayı hak ediyorsunuz.",
      ],
    },
  },
  zh: {
    nav: { myBooking: '🔑 我的预订' },
    hero: {
      storyQuote: '不只是预订……一个您永远不会忘记的故事。',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: '为什么选择ORLUXUS？',
      story: [
        '想象一下，您决定给自己几天休息和快乐的时光……',
        '逃离生活压力、创造难忘回忆的日子。',
        '我们就是从这里开始的。',
        '在邀请您预订之前，我们先问了自己一个问题：如何让人们游览埃及时，感受到自己经历了生命中最美好的时光？',
        '正因如此，我们没有随便寻找服务，没有随便选择地点，也没有随便与人合作。我们旅行……尝试……询问……比较……并亲自测试每一个细节。因为我们相信，卓越的体验不是偶然创造出来的。',
        '我们在真实体验之后选择了我们的服务提供商，因为我们不想向您提供任何我们不想让自己的家人和朋友体验的东西。',
        '然后我们开始一块一块地构建ORLUXUS……我们建立了一套让每一步都简单清晰的系统，让您无需担心细节，只需专注于一件事……享受。',
        '我们在每个阶段都关注安全，因为内心的平静是真正享受的第一步。',
        '我们关注小细节，因为我们相信最美好的回忆往往来自那些并非所有人都会注意到的事情……但它们意味着一切。',
        '最终，我们创造了一个可以在一处找到整个埃及的地方……它的海洋和岛屿……它的冒险与宁静……它的奢华与简约……它最好的体验和最好的服务提供商。',
        "但最重要的事实是，ORLUXUS不仅仅诞生于商业理念……它诞生于一个梦想。一个让每位来访者离开时都会说的梦想：'这不只是一次旅行……而是一次改变了我对埃及感受的体验。'",
        '正是因此……我们不销售预订。我们不销售旅行。我们也不销售活动。我们创造时刻……创造记忆……提供不同的体验，因为您值得每分每秒都活得像是为您量身定制的一样。',
      ],
    },
  },
  ja: {
    nav: { myBooking: '🔑 マイ予約' },
    hero: {
      storyQuote: '単なる予約を超えた…決して忘れられない物語。',
      storyQuoteSub: 'أكثر من مجرد حجز… إنها قصة ستبقى معك إلى الأبد. ✨🇪🇬',
    },
    whyChooseUs: {
      storyTitle: 'なぜORLUXUSなのか？',
      story: [
        '数日間の休息と幸せを自分に与えることを決めたと想像してください…',
        '人生のプレッシャーから逃れ、忘れられない思い出を作る日々。',
        'ここから私たちは始まりました。',
        '予約をお願いする前に、私たちは自分たちに一つの質問をしました：どうすれば人がエジプトを訪れ、人生で最も美しい日々を過ごしたと感じられるのか？',
        'だからこそ、私たちはただのサービスを探さず、ただの場所を選ばず、誰とでも提携しませんでした。旅をし…試し…聞き…比較し…そして自分たちで細部をテストしました。なぜなら、卓越した体験は偶然に作られるものではないと信じているからです。',
        '私たちは自分たちの家族や友人に経験させたくないものを提供したくないので、実際の経験の後にサービスプロバイダーを選びました。',
        'そして私たちはORLUXUSを一つひとつ築き始めました…すべてのステップを簡単で明確にするシステムを作り、細部を心配することなく、ただ一つのことに集中できるようにしました…楽しむこと。',
        '私たちはすべての段階で安全に気を配りました。なぜなら、心の平和こそが本当の楽しみへの第一歩だからです。',
        '私たちは小さな細部に気を配りました。なぜなら、最も美しい思い出は全員が気づくわけではない事柄から生まれると信じているからです…しかしそれらは全てを意味します。',
        '最終的に、エジプトのすべてを一か所で見つけられる場所を作りました…その海と島々…その冒険と静寂…その贅沢とシンプルさ…その最高の体験と最高のサービスプロバイダー。',
        "しかし最も重要な真実は、ORLUXUSは商業的なアイデアだけから生まれたのではありません…夢から生まれました。私たちのもとを訪れるすべての人が去り際にこう言う夢：'ただの旅ではなかった…エジプトに対する感覚を変えた体験だった。'",
        'だからこそ…私たちは予約を売りません。旅行を売りません。そしてアクティビティを売りません。瞬間を作り…思い出を作り…違う体験を提供します。なぜならあなたは、すべての瞬間をまるで特別にあなたのために作られたかのように生きる価値があるからです。',
      ],
    },
  },
};

// ================================================================
// Apply all translations
// ================================================================
for (const [lang, sections] of Object.entries(translations)) {
  console.log(`\nProcessing language: ${lang}`);
  for (const [section, keys] of Object.entries(sections)) {
    content = insertIntoSection(content, lang, section, keys);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ messages.js updated successfully!');
