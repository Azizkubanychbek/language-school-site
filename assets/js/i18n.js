/* Maison Babel — i18n engine.
   Dictionary format: key: [ru, en, ky]. RU is the default language.
   Markup hooks:
     data-i18n="key"            -> textContent
     data-i18n-html="key"       -> innerHTML (trusted, authored strings only)
     data-i18n-attr="attr:key; attr2:key2" -> attributes
   Fires `i18n:change` on document with detail { lang }. */
(function () {
  'use strict';

  var LANGS = ['ru', 'en', 'ky'];
  var STORAGE_KEY = 'mb-lang';

  var D = {
    // meta
    'meta.title': ['Maison Babel — школа иностранных языков в Бишкеке', 'Maison Babel — School of Languages in Bishkek', 'Maison Babel — Бишкектеги чет тилдер мектеби'],
    'meta.desc': ['Десять языков, авторский метод и камерные группы. Английский, немецкий, французский, испанский, китайский, корейский, японский, турецкий, арабский и русский для иностранцев.', 'Ten languages, a signature method and intimate groups. English, German, French, Spanish, Chinese, Korean, Japanese, Turkish, Arabic and Russian for foreigners.', 'Он тил, өзгөчө ыкма жана чакан топтор. Англис, немис, француз, испан, кытай, корей, жапон, түрк, араб тилдери жана чет элдиктер үчүн орус тили.'],

    // chrome
    'a11y.skip': ['Перейти к содержанию', 'Skip to content', 'Мазмунга өтүү'],
    'a11y.lang': ['Язык сайта', 'Site language', 'Сайттын тили'],
    'a11y.menu': ['Открыть меню', 'Open menu', 'Менюну ачуу'],
    'a11y.close': ['Закрыть меню', 'Close menu', 'Менюну жабуу'],
    'a11y.home': ['Maison Babel — на главную', 'Maison Babel — home', 'Maison Babel — башкы бет'],
    'tip.greeting': ['приветствие', 'greeting', 'учурашуу'],
    'loader.label': ['Загрузка', 'Loading', 'Жүктөлүүдө'],

    'nav.method': ['Метод', 'Method', 'Ыкма'],
    'nav.languages': ['Языки', 'Languages', 'Тилдер'],
    'nav.formats': ['Форматы', 'Formats', 'Форматтар'],
    'nav.teachers': ['Преподаватели', 'Teachers', 'Мугалимдер'],
    'nav.test': ['Тест', 'Test', 'Тест'],
    'nav.prices': ['Цены', 'Prices', 'Баалар'],
    'nav.contact': ['Контакты', 'Contact', 'Байланыш'],
    'cta.signup': ['Записаться', 'Enrol', 'Жазылуу'],

    // hero
    'hero.eyebrow': ['Школа иностранных языков · Бишкек · с 2014', 'School of languages · Bishkek · since 2014', 'Чет тилдер мектеби · Бишкек · 2014-жылдан'],
    'hero.title': ['Мир начинается <em>со&nbsp;слова</em>', 'The world begins <em>with a word</em>', 'Дүйнө <em>сөздөн</em> башталат'],
    'hero.lead': ['Десять языков, авторский метод и преподаватели, которые говорят с вами на равных. Неспешно, глубоко — навсегда.', 'Ten languages, a signature method and teachers who speak with you as equals. Unhurried, profound — for life.', 'Он тил, өзгөчө ыкма жана сиз менен тең сүйлөшкөн мугалимдер. Шашылбай, терең — өмүр бою.'],
    'hero.cta1': ['Пройти тест уровня', 'Take the level test', 'Деңгээл тестин тапшыруу'],
    'hero.cta2': ['Выбрать язык', 'Choose a language', 'Тил тандоо'],
    'hero.scroll': ['Листайте', 'Scroll', 'Ылдый'],
    'hero.coords': ['42°52′ с. ш. · 74°36′ в. д.', '42°52′ N · 74°36′ E', '42°52′ т. к. · 74°36′ ч. у.'],
    'hero.statement': ['Десять языков.<br>Один метод.<br><em>Бесчисленное множество миров.</em>', 'Ten languages.<br>One method.<br><em>Countless worlds.</em>', 'Он тил.<br>Бир ыкма.<br><em>Сансыз көп дүйнө.</em>'],
    'hero.hover': ['Наведите на слово — узнаете, как оно звучит', 'Hover over a word to see how it sounds', 'Сөздүн үстүнө алып барыңыз — анын кантип айтыларын билесиз'],

    // method
    'method.kicker': ['I — Метод', 'I — Method', 'I — Ыкма'],
    'method.statement': ['Мы не учим язык как набор правил. Мы учим думать на нём: слышать музыку фраз, замечать оттенки и говорить свободно — с первого занятия.', 'We don’t teach language as a set of rules. We teach you to think in it: to hear the music of phrases, notice nuance and speak freely — from the very first lesson.', 'Биз тилди эрежелердин жыйындысы катары үйрөтпөйбүз. Биз ал тилде ойлонууга үйрөтөбүз: сүйлөмдөрдүн обонун угууга, маанинин нюанстарын байкоого жана эркин сүйлөөгө — биринчи сабактан баштап.'],
    'method.p1.t': ['Погружение', 'Immersion', 'Чөмүлүү'],
    'method.p1.d': ['Занятия полностью на изучаемом языке — с первого дня, мягко и без стресса.', 'Lessons held entirely in the target language from day one — gently, without stress.', 'Сабактар биринчи күндөн тартып толугу менен үйрөнүлгөн тилде — жумшак жана стресссиз.'],
    'method.p2.t': ['Камерность', 'Intimacy', 'Жакындык'],
    'method.p2.d': ['Не больше шести человек в группе. Каждый голос слышен.', 'No more than six people per group. Every voice is heard.', 'Топто алты кишиден ашпайт. Ар бир үн угулат.'],
    'method.p3.t': ['Контекст', 'Context', 'Контекст'],
    'method.p3.d': ['Литература, кино, гастрономия и деловая речь — язык в его живой среде.', 'Literature, cinema, cuisine and business talk — language in its living habitat.', 'Адабият, кино, ашкана маданияты жана иштиктүү кеп — тил өзүнүн жандуу чөйрөсүндө.'],
    'method.p4.t': ['Измеримость', 'Measurable', 'Өлчөнүмдүүлүк'],
    'method.p4.d': ['Диагностика по шкале CEFR каждые восемь недель и личная карта прогресса.', 'CEFR diagnostics every eight weeks and a personal progress map.', 'Ар бир сегиз жумада CEFR шкаласы боюнча диагностика жана жеке прогресс картасы.'],

    // scripts
    'script.latin': ['Латиница', 'Latin', 'Латын жазуусу'],
    'script.cyrillic': ['Кириллица', 'Cyrillic', 'Кирилл жазуусу'],
    'script.hangul': ['Хангыль', 'Hangul', 'Хангыль'],
    'script.kana': ['Хирагана', 'Hiragana', 'Хирагана'],
    'script.hanzi': ['Иероглифы', 'Hanzi', 'Иероглифтер'],
    'script.arabic': ['Арабское письмо', 'Arabic script', 'Араб жазуусу'],
    'strip.caption': ['Шесть систем письма, которые вы сможете читать', 'Six writing systems you will learn to read', 'Сиз окуй ала турган алты жазуу системасы'],

    // languages
    'lang.kicker': ['II — Языки', 'II — Languages', 'II — Тилдер'],
    'lang.title': ['Десять языков — <em>одна карта мира</em>', 'Ten languages — <em>one map of the world</em>', 'Он тил — <em>дүйнөнүн бир картасы</em>'],
    'lang.lead': ['Каждая линия ведёт из Бишкека туда, где язык звучит по-настоящему.', 'Every line leads from Bishkek to where the language truly lives.', 'Ар бир сызык Бишкектен тил чындап жаңырган жерге алып барат.'],
    'lang.home': ['Бишкек', 'Bishkek', 'Бишкек'],
    'l.en': ['Английский', 'English', 'Англис тили'],
    'l.de': ['Немецкий', 'German', 'Немис тили'],
    'l.fr': ['Французский', 'French', 'Француз тили'],
    'l.es': ['Испанский', 'Spanish', 'Испан тили'],
    'l.zh': ['Китайский', 'Chinese', 'Кытай тили'],
    'l.ko': ['Корейский', 'Korean', 'Корей тили'],
    'l.ja': ['Японский', 'Japanese', 'Жапон тили'],
    'l.tr': ['Турецкий', 'Turkish', 'Түрк тили'],
    'l.ar': ['Арабский', 'Arabic', 'Араб тили'],
    'l.ru': ['Русский для иностранцев', 'Russian for foreigners', 'Чет элдиктер үчүн орус тили'],

    // formats
    'fmt.kicker': ['III — Форматы', 'III — Formats', 'III — Форматтар'],
    'fmt.title': ['Формат, который <em>подходит именно вам</em>', 'A format <em>made for you</em>', 'Сизге <em>ылайыктуу</em> формат'],
    'fmt.hint': ['Листайте, чтобы увидеть все', 'Scroll to see them all', 'Баарын көрүү үчүн сүрүңүз'],
    'fmt.f1.t': ['Индивидуально', 'Private lessons', 'Жекече'],
    'fmt.f1.d': ['Программа, темп и расписание — полностью под вас. Онлайн или в нашем ателье на Эркиндик.', 'Curriculum, pace and schedule built entirely around you. Online or at our atelier on Erkindik.', 'Программа, темп жана график — толугу менен сиз үчүн. Онлайн же Эркиндиктеги биздин ательеде.'],
    'fmt.f1.m': ['60 / 90 мин', '60 / 90 min', '60 / 90 мүн'],
    'fmt.f2.t': ['Мини-группы', 'Small groups', 'Чакан топтор'],
    'fmt.f2.d': ['До шести человек одного уровня. Дважды в неделю — вечером или в выходные.', 'Up to six people of the same level. Twice a week — evenings or weekends.', 'Бир деңгээлдеги алты кишиге чейин. Жумасына эки жолу — кечинде же дем алыш күндөрү.'],
    'fmt.f2.m': ['2 × 90 мин в неделю', '2 × 90 min a week', 'Жумасына 2 × 90 мүн'],
    'fmt.f3.t': ['Дети и подростки', 'Children & teens', 'Балдар жана өспүрүмдөр'],
    'fmt.f3.d': ['От 6 до 16 лет. Игра, театр, проекты — язык как естественная часть детства.', 'Ages 6 to 16. Play, theatre and projects — language as a natural part of growing up.', '6 жаштан 16 жашка чейин. Оюн, театр, долбоорлор — тил балалыктын табигый бөлүгү катары.'],
    'fmt.f3.m': ['6–16 лет', 'Ages 6–16', '6–16 жаш'],
    'fmt.f4.t': ['Корпоративно', 'Corporate', 'Корпоративдик'],
    'fmt.f4.d': ['Обучение команд в офисе или онлайн: деловая переписка, переговоры, презентации.', 'Team training on-site or online: business correspondence, negotiations, presentations.', 'Командаларды кеңседе же онлайн окутуу: иштиктүү кат алышуу, сүйлөшүүлөр, презентациялар.'],
    'fmt.f4.m': ['от 4 человек', 'from 4 people', '4 кишиден баштап'],
    'fmt.f5.t': ['IELTS · TOEFL', 'IELTS · TOEFL', 'IELTS · TOEFL'],
    'fmt.f5.d': ['Интенсивная подготовка с пробными экзаменами в реальном формате и разбором каждой ошибки.', 'Intensive preparation with full-format mock exams and a review of every single mistake.', 'Чыныгы форматтагы сынак экзамендер жана ар бир катаны талдоо менен интенсивдүү даярдык.'],
    'fmt.f5.m': ['8 / 12 недель', '8 / 12 weeks', '8 / 12 жума'],

    // teachers
    'tch.kicker': ['IV — Преподаватели', 'IV — Teachers', 'IV — Мугалимдер'],
    'tch.title': ['Люди, которые <em>влюбляют в язык</em>', 'People who make you <em>fall for a language</em>', 'Тилге <em>ашык</em> кылган адамдар'],
    'tch.lead': ['Сертифицированные специалисты и носители языка. В среднем — одиннадцать лет практики.', 'Certified specialists and native speakers. Eleven years of practice on average.', 'Сертификаттуу адистер жана тилдин ээлери. Орточо он бир жылдык тажрыйба.'],
    'tch.note': ['Имена и портреты — иллюстративные.', 'Names and portraits are illustrative.', 'Ысымдар жана портреттер — мисал катары.'],
    't1.n': ['Амели Руссо', 'Amélie Rousseau', 'Амели Руссо'],
    't1.r': ['Французский · DALF C2', 'French · DALF C2', 'Француз тили · DALF C2'],
    't2.n': ['Тимур Асанов', 'Timur Asanov', 'Тимур Асанов'],
    't2.r': ['Английский · CELTA', 'English · CELTA', 'Англис тили · CELTA'],
    't3.n': ['Пак Со Юн', 'Park Seo-yun', 'Пак Со Юн'],
    't3.r': ['Корейский · TOPIK 6', 'Korean · TOPIK 6', 'Корей тили · TOPIK 6'],
    't4.n': ['Хана Мори', 'Hana Mori', 'Хана Мори'],
    't4.r': ['Японский · JLPT N1', 'Japanese · JLPT N1', 'Жапон тили · JLPT N1'],
    't5.n': ['Лукас Хофман', 'Lukas Hofmann', 'Лукас Хофман'],
    't5.r': ['Немецкий · Goethe C2', 'German · Goethe C2', 'Немис тили · Goethe C2'],
    't6.n': ['Лейла Хаддад', 'Leila Haddad', 'Лейла Хаддад'],
    't6.r': ['Арабский · 9 лет практики', 'Arabic · 9 years of practice', 'Араб тили · 9 жылдык тажрыйба'],
    'tch.years': ['лет опыта', 'years', 'жыл тажрыйба'],

    // word of the day
    'wotd.kicker': ['Слово дня', 'Word of the day', 'Күндүн сөзү'],
    'wotd.note': ['Слова, которые не переводятся одним словом.', 'Words that resist a one-word translation.', 'Бир сөз менен которулбаган сөздөр.'],
    'wotd.prev': ['Предыдущее слово', 'Previous word', 'Мурунку сөз'],
    'wotd.next': ['Следующее слово', 'Next word', 'Кийинки сөз'],

    // quiz
    'quiz.kicker': ['V — Тест уровня', 'V — Level test', 'V — Деңгээл тести'],
    'quiz.title': ['Три вопроса — <em>и мы подскажем ваш уровень</em>', 'Three questions — <em>and we’ll suggest your level</em>', 'Үч суроо — <em>жана деңгээлиңизди айтабыз</em>'],
    'quiz.lead': ['Короткий тест по английскому. Полная диагностика — бесплатно, на первом занятии.', 'A short English test. Full diagnostics are free at your first lesson.', 'Англис тили боюнча кыска тест. Толук диагностика — биринчи сабакта акысыз.'],
    'quiz.q': ['Вопрос', 'Question', 'Суроо'],
    'quiz.instr': ['Выберите правильный вариант', 'Choose the correct option', 'Туура вариантты тандаңыз'],
    'quiz.correct': ['Верно', 'Correct', 'Туура'],
    'quiz.wrong': ['Правильный ответ:', 'Correct answer:', 'Туура жооп:'],
    'quiz.next': ['Далее', 'Next', 'Кийинки'],
    'quiz.finish': ['Узнать результат', 'See my result', 'Жыйынтыкты көрүү'],
    'quiz.res.title': ['Ваш ориентировочный уровень', 'Your estimated level', 'Сиздин болжолдуу деңгээлиңиз'],
    'quiz.res.a': ['Начальный — A1–A2. Отличная точка старта: через три месяца вы заговорите уверенно.', 'Elementary — A1–A2. A perfect starting point: in three months you’ll speak with confidence.', 'Баштапкы — A1–A2. Мыкты баштоо чекити: үч айдан кийин ишенимдүү сүйлөйсүз.'],
    'quiz.res.b': ['Средний — B1. Прочный фундамент. Пора добавить свободы и нюансов.', 'Intermediate — B1. A solid foundation. Time to add fluency and nuance.', 'Орто — B1. Бекем пайдубал. Эми эркиндик жана нюанстарды кошуу убагы.'],
    'quiz.res.c': ['Продвинутый — B2+. Впечатляет. Вам подойдёт подготовка к IELTS или разговорный клуб C1.', 'Upper-intermediate — B2+. Impressive. IELTS preparation or our C1 conversation club would suit you.', 'Жогорку орто — B2+. Таасирдүү. Сизге IELTS даярдыгы же C1 сүйлөшүү клубу ылайык.'],
    'quiz.score': ['Правильных ответов: {n} из 3', 'Correct answers: {n} of 3', 'Туура жооптор: 3 ичинен {n}'],
    'quiz.restart': ['Пройти заново', 'Try again', 'Кайра тапшыруу'],
    'quiz.book': ['Записаться на диагностику', 'Book a full assessment', 'Диагностикага жазылуу'],

    // stats
    'st.kicker': ['VI — Результаты', 'VI — Results', 'VI — Жыйынтыктар'],
    'st.title': ['Цифры, которые <em>говорят сами</em>', 'Numbers that <em>speak for themselves</em>', 'Өздөрү <em>сүйлөгөн</em> сандар'],
    'st.s1': ['лет в Бишкеке', 'years in Bishkek', 'жыл Бишкекте'],
    'st.s2': ['выпускников', 'graduates', 'бүтүрүүчү'],
    'st.s3': ['сдают международные экзамены с первой попытки', 'pass international exams on the first attempt', 'эл аралык экзамендерди биринчи аракетте тапшырышат'],
    'st.s4': ['средний балл IELTS наших студентов', 'average IELTS band of our students', 'студенттерибиздин IELTS боюнча орточо баллы'],

    // prices
    'pr.kicker': ['VII — Стоимость', 'VII — Tuition', 'VII — Баасы'],
    'pr.title': ['Прозрачно. <em>Без мелкого шрифта.</em>', 'Transparent. <em>No fine print.</em>', 'Ачык-айкын. <em>Майда шрифтсиз.</em>'],
    'pr.from': ['от', 'from', 'баасы'],
    'pr.badge': ['Выбор студентов', 'Students’ choice', 'Студенттердин тандоосу'],
    'pr.t1': ['Мини-группа', 'Small group', 'Чакан топ'],
    'pr.t1.u': ['сом / месяц', 'som / month', 'сомдон баштап / ай'],
    'pr.t1.f1': ['8 занятий по 90 минут', '8 lessons × 90 minutes', '90 мүнөттөн 8 сабак'],
    'pr.t1.f2': ['Учебные материалы включены', 'All materials included', 'Окуу материалдары кирет'],
    'pr.t1.f3': ['Разговорный клуб по пятницам', 'Friday conversation club', 'Жума күнкү сүйлөшүү клубу'],
    'pr.t2': ['Индивидуально', 'Private', 'Жекече'],
    'pr.t2.u': ['сом / занятие', 'som / lesson', 'сомдон баштап / сабак'],
    'pr.t2.f1': ['Персональная программа', 'Personal curriculum', 'Жеке программа'],
    'pr.t2.f2': ['Гибкое расписание и онлайн', 'Flexible schedule & online', 'Ийкемдүү график жана онлайн'],
    'pr.t2.f3': ['Отчёт о прогрессе каждый месяц', 'Monthly progress report', 'Ай сайын прогресс отчету'],
    'pr.t3': ['IELTS / TOEFL интенсив', 'IELTS / TOEFL intensive', 'IELTS / TOEFL интенсив'],
    'pr.t3.u': ['сом / месяц', 'som / month', 'сомдон баштап / ай'],
    'pr.t3.f1': ['Три пробных экзамена', 'Three mock exams', 'Үч сынак экзамен'],
    'pr.t3.f2': ['Индивидуальный разбор эссе', 'One-to-one essay feedback', 'Эсселерди жеке талдоо'],
    'pr.t3.f3': ['Гарантия повторного курса', 'Free retake guarantee', 'Кайталоо курсуна кепилдик'],
    'pr.cta': ['Выбрать', 'Choose', 'Тандоо'],
    'pr.note': ['Корпоративные программы рассчитываются индивидуально. Первое пробное занятие — бесплатно.', 'Corporate programmes are priced individually. Your first trial lesson is free.', 'Корпоративдик программалар жекече эсептелет. Биринчи сынак сабак — акысыз.'],

    // voices
    'vo.kicker': ['VIII — Голоса', 'VIII — Voices', 'VIII — Үндөр'],
    'vo.title': ['Что говорят <em>наши студенты</em>', 'What our <em>students say</em>', 'Студенттерибиз <em>эмне дейт</em>'],
    'vo.q1': ['Через полгода я впервые посмотрела французский фильм без субтитров — и плакала не от сюжета, а от того, что понимаю каждое слово.', 'Six months in, I watched a French film without subtitles for the first time — and cried not at the plot, but because I understood every word.', 'Алты айдан кийин биринчи жолу француз тасмасын субтитрсиз көрдүм — сюжеттен эмес, ар бир сөздү түшүнгөнүмдөн ыйладым.'],
    'vo.a1': ['Студентка, французский B2', 'Student, French B2', 'Студент, француз тили B2'],
    'vo.q2': ['Готовился к IELTS восемь недель и получил 7.5. Здесь учат не угадывать ответы, а по-настоящему владеть языком.', 'I prepared for IELTS for eight weeks and scored 7.5. They don’t teach you to guess answers here — they teach you to truly own the language.', 'IELTSке сегиз жума даярдандым жана 7.5 алдым. Бул жерде жоопту табууга эмес, тилди чындап өздөштүрүүгө үйрөтүшөт.'],
    'vo.a2': ['Студент, подготовка к IELTS', 'Student, IELTS preparation', 'Студент, IELTS даярдыгы'],
    'vo.q3': ['Мы обучали отдел продаж корейскому. Через год переговоры в Сеуле прошли без переводчика.', 'We trained our sales team in Korean. A year later, negotiations in Seoul went ahead without an interpreter.', 'Сатуу бөлүмүн корей тилине окуттук. Бир жылдан кийин Сеулдагы сүйлөшүүлөр котормочусуз өттү.'],
    'vo.a3': ['Руководитель отдела, корпоративный клиент', 'Head of department, corporate client', 'Бөлүм жетекчиси, корпоративдик кардар'],
    'vo.note': ['Отзывы приведены как иллюстрация; имена не указываются.', 'Testimonials are illustrative; names are withheld.', 'Пикирлер мисал катары берилген; ысымдар көрсөтүлгөн эмес.'],
    'vo.prev': ['Предыдущий отзыв', 'Previous testimonial', 'Мурунку пикир'],
    'vo.next': ['Следующий отзыв', 'Next testimonial', 'Кийинки пикир'],

    // form
    'fm.kicker': ['IX — Запись', 'IX — Enrolment', 'IX — Жазылуу'],
    'fm.title': ['Начните <em>с пробного занятия</em>', 'Begin with <em>a trial lesson</em>', '<em>Сынак сабактан</em> баштаңыз'],
    'fm.lead': ['Оставьте контакты — мы перезвоним в течение дня и подберём язык, формат и удобное время.', 'Leave your details — we’ll call back within a day to match you with a language, a format and a time.', 'Байланыш маалыматыңызды калтырыңыз — бир күндүн ичинде чалып, тил, формат жана ыңгайлуу убакытты тандайбыз.'],
    'fm.name': ['Имя', 'Name', 'Атыңыз'],
    'fm.phone': ['Телефон', 'Phone', 'Телефон'],
    'fm.email': ['Email — необязательно', 'Email — optional', 'Email — милдеттүү эмес'],
    'fm.language': ['Язык', 'Language', 'Тил'],
    'fm.format': ['Формат', 'Format', 'Формат'],
    'fm.message': ['Комментарий', 'Comment', 'Комментарий'],
    'fm.select': ['Выберите', 'Select', 'Тандаңыз'],
    'fm.consent': ['Я согласен(на) на обработку персональных данных', 'I agree to the processing of my personal data', 'Жеке маалыматтарымды иштетүүгө макулмун'],
    'fm.submit': ['Отправить заявку', 'Send request', 'Өтүнмө жөнөтүү'],
    'fm.err.name': ['Пожалуйста, укажите имя', 'Please enter your name', 'Сураныч, атыңызды жазыңыз'],
    'fm.err.phone': ['Укажите номер телефона — не менее 9 цифр', 'Please enter a phone number — at least 9 digits', 'Телефон номерин жазыңыз — кеминде 9 сан'],
    'fm.err.email': ['Проверьте адрес почты', 'Please check the email address', 'Email дарегин текшериңиз'],
    'fm.err.consent': ['Необходимо ваше согласие', 'Your consent is required', 'Сиздин макулдугуңуз керек'],
    'fm.ok.title': ['Спасибо — Рахмат!', 'Thank you — Рахмат!', 'Рахмат!'],
    'fm.ok.text': ['Заявка принята. Мы свяжемся с вами в течение рабочего дня.', 'Your request has been received. We’ll be in touch within one business day.', 'Өтүнмөңүз кабыл алынды. Бир иш күнүнүн ичинде сиз менен байланышабыз.'],
    'fm.ok.again': ['Отправить ещё одну', 'Send another', 'Дагы бирөөнү жөнөтүү'],
    'fm.demo': ['Демо-форма: данные никуда не отправляются.', 'Demo form: no data is sent anywhere.', 'Демо-форма: маалыматтар эч жакка жөнөтүлбөйт.'],

    // contacts / footer
    'ct.kicker': ['Контакты', 'Contact', 'Байланыш'],
    'ct.title': ['Приходите <em>на чай и разговор</em>', 'Come by <em>for tea and conversation</em>', '<em>Чай ичип, маектешүүгө</em> келиңиз'],
    'ct.address.l': ['Адрес', 'Address', 'Дарек'],
    'ct.address': ['Бишкек, бульвар Эркиндик, 35', '35 Erkindik Boulevard, Bishkek', 'Бишкек, Эркиндик бульвары, 35'],
    'ct.hours.l': ['Часы работы', 'Hours', 'Иш убактысы'],
    'ct.hours': ['Пн–Сб · 9:00–21:00', 'Mon–Sat · 9:00–21:00', 'Дүйшөмбү–Ишемби · 9:00–21:00'],
    'ct.phone.l': ['Телефон', 'Phone', 'Телефон'],
    'ct.mail.l': ['Почта', 'Email', 'Почта'],
    'ct.social.l': ['Мы в сети', 'Follow us', 'Биз тармакта'],
    'ft.tag': ['Говорите с миром на его языке.', 'Speak to the world in its own language.', 'Дүйнө менен анын тилинде сүйлөшүңүз.'],
    'ft.rights': ['© 2026 Maison Babel. Вымышленная школа — демонстрационный сайт.', '© 2026 Maison Babel. A fictional school — demo website.', '© 2026 Maison Babel. Ойдон чыгарылган мектеп — демо сайт.'],
    'ft.top': ['Наверх', 'Back to top', 'Жогору']
  };

  var listeners = [];
  var current = 'ru';

  function readStored() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return LANGS.indexOf(v) > -1 ? v : null;
    } catch (e) { return null; }
  }
  function store(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
  }

  function t(key, lang) {
    var row = D[key];
    if (!row) return key;
    var i = LANGS.indexOf(lang || current);
    return row[i] != null ? row[i] : row[0];
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'ru';
    current = lang;
    var root = document.documentElement;
    root.setAttribute('lang', lang);

    var i, els;
    els = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute('data-i18n'));
    els = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) els[i].innerHTML = t(els[i].getAttribute('data-i18n-html'));
    els = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < els.length; i++) {
      var pairs = els[i].getAttribute('data-i18n-attr').split(';');
      for (var j = 0; j < pairs.length; j++) {
        var p = pairs[j].split(':');
        if (p.length === 2) els[i].setAttribute(p[0].trim(), t(p[1].trim()));
      }
    }

    document.title = t('meta.title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('meta.desc'));

    var btns = document.querySelectorAll('[data-set-lang]');
    for (i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-set-lang') === lang;
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function set(lang, opts) {
    apply(lang);
    if (!opts || opts.persist !== false) store(lang);
    var ev;
    try { ev = new CustomEvent('i18n:change', { detail: { lang: current } }); }
    catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('i18n:change', false, false, { lang: current }); }
    document.dispatchEvent(ev);
    for (var i = 0; i < listeners.length; i++) listeners[i](current);
  }

  function init() {
    var initial = readStored() || 'ru';
    apply(initial);
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-set-lang]') : null;
      if (!b) return;
      e.preventDefault();
      var l = b.getAttribute('data-set-lang');
      if (l !== current) set(l);
    });
  }

  window.I18N = {
    t: t,
    set: set,
    langs: LANGS,
    get lang() { return current; },
    onChange: function (fn) { listeners.push(fn); },
    format: function (key, vars) {
      var s = t(key);
      for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) s = s.split('{' + k + '}').join(vars[k]);
      return s;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
