const fs = require('fs');
const file = 'd:/eslam/wep/moho/src/lib/messages.js';
let content = fs.readFileSync(file, 'utf8');

const translations = {
  en: {
    title: 'Entertainment',
    subtitle: 'The most important events and entertainment shows across Egypt',
    available: 'Available Events',
    noEvents: 'No events currently added in this section',
  },
  ar: {
    title: 'ترفيهي',
    subtitle: 'أهم الفعاليات والحفلات الترفيهية في جميع أنحاء مصر',
    available: 'الفعاليات المتاحة',
    noEvents: 'لا توجد فعاليات مضافة حالياً في هذا القسم',
  },
  de: {
    title: 'Unterhaltung',
    subtitle: 'Die wichtigsten Veranstaltungen und Unterhaltungsshows in ganz Ägypten',
    available: 'Verfügbare Veranstaltungen',
    noEvents: 'Derzeit keine Veranstaltungen in diesem Bereich hinzugefügt',
  },
  fr: {
    title: 'Divertissement',
    subtitle: 'Les événements et spectacles de divertissement les plus importants en Égypte',
    available: 'Événements disponibles',
    noEvents: "Aucun événement ajouté dans cette section pour l'instant",
  },
  es: {
    title: 'Entretenimiento',
    subtitle: 'Los eventos y espectáculos de entretenimiento más importantes de Egipto',
    available: 'Eventos disponibles',
    noEvents: 'No hay eventos añadidos actualmente en esta sección',
  },
  it: {
    title: 'Intrattenimento',
    subtitle: 'I più importanti eventi e spettacoli di intrattenimento in tutto il Egitto',
    available: 'Eventi disponibili',
    noEvents: 'Nessun evento attualmente aggiunto in questa sezione',
  },
  ru: {
    title: 'Развлечения',
    subtitle: 'Самые важные события и развлекательные шоу по всему Египту',
    available: 'Доступные мероприятия',
    noEvents: 'В этом разделе пока нет добавленных событий',
  },
  tr: {
    title: 'Eğlence',
    subtitle: 'Mısır genelinde en önemli etkinlikler ve eğlence gösterileri',
    available: 'Mevcut Etkinlikler',
    noEvents: 'Bu bölüme şu an herhangi bir etkinlik eklenmemiştir',
  },
  zh: {
    title: '娱乐活动',
    subtitle: '埃及各地最重要的活动和娱乐演出',
    available: '可用活动',
    noEvents: '此板块目前尚未添加任何活动',
  },
  ja: {
    title: 'エンターテインメント',
    subtitle: 'エジプト全土で最も重要なイベントとエンターテインメントショー',
    available: '利用可能なイベント',
    noEvents: '現在このセクションにイベントは追加されていません',
  }
};

const languages = ['en', 'ar', 'de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja'];

for (const lang of languages) {
  const t = translations[lang];
  const noEventsEscaped = t.noEvents.replace(/'/g, "\\'");
  const blockToInsert = `    entertainment: {
      title: '${t.title}',
      subtitle: '${t.subtitle}',
      available: '${t.available}',
      noEvents: '${noEventsEscaped}',
    },\n`;
    
  const langRegex = new RegExp(`(\\n  ${lang}: \\{[\\s\\S]*?\\n    booking: \\{[\\s\\S]*?\\n    \\},)(\\n)`);
  content = content.replace(langRegex, (match, p1, p2) => {
    return p1 + '\n' + blockToInsert + p2.substring(1);
  });
}

fs.writeFileSync(file, content, 'utf8');
console.log('Modified messages.js successfully');
