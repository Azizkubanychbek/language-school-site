/* Maison Babel — lexicon: greetings, scripts, words of the day.
   Pure data, no DOM access. Exposed as window.LEXICON. */
(function () {
  'use strict';

  // Language names, keyed by ISO code, in every UI language.
  var LANG_NAMES = {
    ru: { ru: 'русский', en: 'Russian', ky: 'орус тили' },
    en: { ru: 'английский', en: 'English', ky: 'англис тили' },
    ky: { ru: 'кыргызский', en: 'Kyrgyz', ky: 'кыргыз тили' },
    fr: { ru: 'французский', en: 'French', ky: 'француз тили' },
    ja: { ru: 'японский', en: 'Japanese', ky: 'жапон тили' },
    zh: { ru: 'китайский', en: 'Chinese', ky: 'кытай тили' },
    es: { ru: 'испанский', en: 'Spanish', ky: 'испан тили' },
    ar: { ru: 'арабский', en: 'Arabic', ky: 'араб тили' },
    de: { ru: 'немецкий', en: 'German', ky: 'немис тили' },
    ko: { ru: 'корейский', en: 'Korean', ky: 'корей тили' },
    tr: { ru: 'турецкий', en: 'Turkish', ky: 'түрк тили' },
    pt: { ru: 'португальский', en: 'Portuguese', ky: 'португал тили' }
  };

  // Greetings: word, BCP-47 code, transliteration / pronunciation.
  var GREETINGS = [
    { w: 'Привет', l: 'ru', tr: 'privét' },
    { w: 'Hello', l: 'en', tr: 'həˈləʊ' },
    { w: 'Bonjour', l: 'fr', tr: 'bɔ̃.ʒuʁ' },
    { w: 'こんにちは', l: 'ja', tr: 'konnichiwa' },
    { w: '你好', l: 'zh', tr: 'nǐ hǎo' },
    { w: 'Hola', l: 'es', tr: 'ˈo.la' },
    { w: 'مرحبا', l: 'ar', tr: 'marḥaban' },
    { w: 'Салам', l: 'ky', tr: 'salam' },
    { w: 'Guten Tag', l: 'de', tr: 'ˈɡuːtn̩ taːk' },
    { w: '안녕하세요', l: 'ko', tr: 'annyeonghaseyo' },
    { w: 'Merhaba', l: 'tr', tr: 'merhaba' }
  ];

  // Glyph pools for the decode / scramble effect, per writing system.
  var POOLS = {
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzéàçñüß',
    cyrillic: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзийклмнопрстуфхцчшэюяңөү',
    kana: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
    hanzi: '的一是不了人我在有他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现分将外但身些与高意进把法此实回二理美点月明',
    hangul: '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후',
    arabic: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
  };

  // Map a language code to the pool used while decoding it.
  var SCRIPT_OF = { ru: 'cyrillic', ky: 'cyrillic', en: 'latin', fr: 'latin', es: 'latin', de: 'latin', tr: 'latin', pt: 'latin', ja: 'kana', zh: 'hanzi', ko: 'hangul', ar: 'arabic' };

  // Alphabet strip stages (section transitions that swap alphabets).
  var STRIP = [
    { key: 'script.latin', chars: 'ABCDEFGHIJKL', l: 'en' },
    { key: 'script.cyrillic', chars: 'АБВГДЕЖЗИЙКЛ', l: 'ru' },
    { key: 'script.hangul', chars: '가나다라마바사아자차카타', l: 'ko' },
    { key: 'script.kana', chars: 'あいうえおかきくけこさし', l: 'ja' },
    { key: 'script.hanzi', chars: '一二三四五六七八九十百千', l: 'zh' },
    { key: 'script.arabic', chars: 'ابتثجحخدذرزس', l: 'ar' }
  ];

  // "Untranslatable" words of the day.
  var WORDS = [
    { w: 'Saudade', l: 'pt', tr: 'sawˈda.dɨ', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Светлая тоска по тому, что любимо и далеко — и, возможно, уже не вернётся.',
           en: 'A tender longing for something loved and far away — that may never return.',
           ky: 'Сүйүктүү жана алыс нерсеге болгон назик сагыныч — балким, ал эми кайтпайт.' } },
    { w: '木漏れ日', l: 'ja', tr: 'komorebi', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Солнечный свет, пробивающийся сквозь листву деревьев.',
           en: 'Sunlight filtering through the leaves of trees.',
           ky: 'Дарактардын жалбырактары аркылуу өткөн күн нуру.' } },
    { w: '정', l: 'ko', tr: 'jeong', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Глубокая привязанность, которая рождается из времени, проведённого вместе.',
           en: 'A deep attachment that grows out of time spent together.',
           ky: 'Бирге өткөргөн убакыттан жаралган терең жакындык.' } },
    { w: 'Sobremesa', l: 'es', tr: 'so.βɾeˈme.sa', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Неспешная беседа за столом, когда трапеза уже окончена.',
           en: 'The unhurried conversation that lingers at the table after a meal.',
           ky: 'Тамактан кийин дасторкон башында шашылбай уланган маек.' } },
    { w: 'Flâner', l: 'fr', tr: 'flɑ.ne', pos: { ru: 'гл.', en: 'verb', ky: 'этиш' },
      m: { ru: 'Бесцельно и с удовольствием бродить по городу, наблюдая за жизнью.',
           en: 'To stroll aimlessly through a city, savouring the life around you.',
           ky: 'Шаарды максатсыз, ырахаттанып кыдырып, жашоону байкоо.' } },
    { w: 'Gemütlichkeit', l: 'de', tr: 'ɡəˈmyːtlɪçkaɪ̯t', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Чувство уюта, тепла и душевного покоя в хорошей компании.',
           en: 'A feeling of warmth, cosiness and peace of mind in good company.',
           ky: 'Жакшы чөйрөдөгү жылуулук, ыңгайлуулук жана жан тынчтыгы сезими.' } },
    { w: 'Yakamoz', l: 'tr', tr: 'ja.ka.moz', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Отражение луны на воде; ночное свечение моря.',
           en: 'The moon’s reflection on water; the glow of the sea at night.',
           ky: 'Айдын сууга түшкөн чагылышы; түнкү деңиздин жаркырашы.' } },
    { w: 'طرب', l: 'ar', tr: 'ṭarab', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Состояние восторга и упоения, которое дарит музыка.',
           en: 'The ecstatic rapture that music stirs in a listener.',
           ky: 'Музыка тартуулаган толкундануу жана кубаныч абалы.' } },
    { w: 'Мээрим', l: 'ky', tr: 'meerim', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Безусловная доброта и сердечное тепло по отношению к людям.',
           en: 'Unconditional kindness and warmth of heart towards others.',
           ky: 'Адамдарга болгон шартсыз боорукердик жана жүрөк жылуулугу.' } },
    { w: '缘分', l: 'zh', tr: 'yuánfèn', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Судьбоносная связь, которая сводит людей вместе.',
           en: 'The fateful bond that brings people together.',
           ky: 'Адамдарды бириктирген тагдырдын байланышы.' } },
    { w: 'Тоска', l: 'ru', tr: 'toská', pos: { ru: 'сущ.', en: 'noun', ky: 'зат атооч' },
      m: { ru: 'Томление души без видимой причины — смутное, глубокое, почти музыкальное.',
           en: 'A yearning of the soul without apparent cause — vague, deep, almost musical.',
           ky: 'Көрүнөөр себепсиз жан зарыгуусу — бүдөмүк, терең, дээрлик обондуу.' } }
  ];

  // Cities for the globe (lat, lon) with the native name of the language.
  var CITIES = [
    { code: 'en', native: 'English', lat: 51.5, lon: -0.12, a: -160, d: 62 },
    { code: 'de', native: 'Deutsch', lat: 52.52, lon: 13.4, a: -78, d: 46 },
    { code: 'fr', native: 'Français', lat: 48.86, lon: 2.35, a: 178, d: 40 },
    { code: 'es', native: 'Español', lat: 40.42, lon: -3.7, a: 150, d: 30 },
    { code: 'zh', native: '中文', lat: 39.9, lon: 116.4, a: -110, d: 34 },
    { code: 'ko', native: '한국어', lat: 37.57, lon: 126.98, a: 95, d: 34 },
    { code: 'ja', native: '日本語', lat: 35.68, lon: 139.69, a: -25, d: 26 },
    { code: 'tr', native: 'Türkçe', lat: 41.01, lon: 28.98, a: 120, d: 30 },
    { code: 'ar', native: 'العربية', lat: 30.04, lon: 31.24, a: 160, d: 30 },
    { code: 'ru', native: 'Русский', lat: 55.76, lon: 37.62, a: -60, d: 34 }
  ];
  var HOME = { lat: 42.87, lon: 74.6 };

  window.LEXICON = {
    LANG_NAMES: LANG_NAMES, GREETINGS: GREETINGS, POOLS: POOLS, SCRIPT_OF: SCRIPT_OF,
    STRIP: STRIP, WORDS: WORDS, CITIES: CITIES, HOME: HOME
  };
})();
