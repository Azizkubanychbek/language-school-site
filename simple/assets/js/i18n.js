/* Maison Babel (simple) — i18n. Dictionary: key: [ru, en, ky].
   data-i18n -> textContent, data-i18n-html -> innerHTML, data-i18n-attr="attr:key;..." */
(function () {
  'use strict';
  var LANGS = ['ru', 'en', 'ky'];
  var KEY = 'mb-simple-lang';

  var D = {
    'meta.title': ['Maison Babel — курсы иностранных языков в Бишкеке', 'Maison Babel — language courses in Bishkek', 'Maison Babel — Бишкектеги чет тил курстары'],
    'meta.desc': ['Английский, немецкий, корейский, китайский и ещё 6 языков. Группы до 6 человек, индивидуально, для детей, IELTS. Бесплатный пробный урок.', 'English, German, Korean, Chinese and 6 more languages. Groups of up to 6, private lessons, kids, IELTS. Free trial lesson.', 'Англис, немис, корей, кытай жана дагы 6 тил. 6 кишиге чейинки топтор, жекече, балдар үчүн, IELTS. Акысыз сынак сабак.'],

    'a11y.skip': ['Перейти к содержанию', 'Skip to content', 'Мазмунга өтүү'],
    'a11y.lang': ['Язык сайта', 'Site language', 'Сайттын тили'],
    'a11y.menu': ['Открыть меню', 'Open menu', 'Менюну ачуу'],
    'a11y.close': ['Закрыть меню', 'Close menu', 'Менюну жабуу'],
    'a11y.home': ['Maison Babel — на главную', 'Maison Babel — home', 'Maison Babel — башкы бет'],

    'top.hours': ['Пн–Сб · 9:00–21:00', 'Mon–Sat · 9:00–21:00', 'Дүйшөмбү–Ишемби · 9:00–21:00'],
    'top.addr': ['Бишкек, бульвар Эркиндик, 35', '35 Erkindik Blvd, Bishkek', 'Бишкек, Эркиндик бульвары, 35'],

    'nav.languages': ['Языки', 'Languages', 'Тилдер'],
    'nav.formats': ['Расписание', 'Schedule', 'Жадыбал'],
    'nav.prices': ['Цены', 'Prices', 'Баалар'],
    'nav.teachers': ['Преподаватели', 'Teachers', 'Мугалимдер'],
    'nav.reviews': ['Отзывы', 'Reviews', 'Пикирлер'],
    'nav.faq': ['Вопросы', 'FAQ', 'Суроолор'],
    'nav.contact': ['Контакты', 'Contact', 'Байланыш'],

    'cta.signup': ['Записаться', 'Sign up', 'Жазылуу'],
    'cta.trial': ['Записаться на бесплатный урок', 'Book a free trial lesson', 'Акысыз сабакка жазылуу'],
    'cta.test': ['Узнать свой уровень', 'Check your level', 'Деңгээлиңизди билүү'],

    // hero
    'hero.badge': ['Открыт набор в группы на ноябрь', 'Enrolment for November groups is open', 'Ноябрдагы топторго кабыл алуу ачык'],
    'hero.title': ['Скажите <span class="hw-wrap">«<span class="hw" id="heroWord">Hello</span>»</span> — и&nbsp;вас поймут', 'Say <span class="hw-wrap">“<span class="hw" id="heroWord">Hello</span>”</span> and be understood', '<span class="hw-wrap">«<span class="hw" id="heroWord">Hello</span>»</span> деңиз — сизди түшүнүшөт'],
    'hero.lead': ['Курсы 10 языков в центре Бишкека. Группы до 6 человек, опытные преподаватели и понятный результат: заговорите уже через 3 месяца.', 'Courses in 10 languages in central Bishkek. Groups of up to 6, experienced teachers and clear results: you’ll be speaking within 3 months.', 'Бишкектин борборунда 10 тил боюнча курстар. 6 кишиге чейинки топтор, тажрыйбалуу мугалимдер жана так жыйынтык: 3 айдан кийин эле сүйлөй баштайсыз.'],
    'hero.note': ['Первый урок — бесплатно и без обязательств', 'Your first lesson is free, no commitment', 'Биринчи сабак — акысыз жана эч милдеттенмесиз'],
    'hero.wordlabel': ['Слово «привет» на языке:', 'The word “hello” in', '«Салам» деген сөз:'],
    'hero.card': ['Ближайшие группы', 'Upcoming groups', 'Жакынкы топтор'],
    'hero.cardmore': ['Всё расписание', 'Full schedule', 'Толук жадыбал'],
    'g.start': ['старт', 'starts', 'башталышы'],
    'g.seats': ['мест: {n}', 'seats left: {n}', 'орун: {n}'],

    'd.mw': ['Пн, Ср', 'Mon, Wed', 'Дүй, Шар'],
    'd.tt': ['Вт, Чт', 'Tue, Thu', 'Шей, Бей'],
    'd.sat': ['Сб', 'Sat', 'Ише'],
    'day.mon': ['Пн', 'Mon', 'Дүй'], 'day.tue': ['Вт', 'Tue', 'Шей'], 'day.wed': ['Ср', 'Wed', 'Шар'],
    'day.thu': ['Чт', 'Thu', 'Бей'], 'day.fri': ['Пт', 'Fri', 'Жум'], 'day.sat': ['Сб', 'Sat', 'Ише'],

    // stats
    'st.s1': ['лет в Бишкеке', 'years in Bishkek', 'жыл Бишкекте'],
    'st.s2': ['выпускников', 'graduates', 'бүтүрүүчү'],
    'st.s3': ['сдают международные экзамены с первой попытки', 'pass international exams on the first attempt', 'эл аралык экзамендерди биринчи аракетте тапшырышат'],
    'st.s4': ['средний балл IELTS наших студентов', 'average IELTS band of our students', 'студенттерибиздин IELTS боюнча орточо баллы'],
    'st.group': ['человек — максимум в группе', 'people max per group', 'киши — топто эң көп'],

    // why
    'why.kicker': ['Почему мы', 'Why us', 'Эмне үчүн биз'],
    'why.title': ['Учиться понятно, удобно и с результатом', 'Learning that is clear, convenient and effective', 'Түшүнүктүү, ыңгайлуу жана натыйжалуу окуу'],
    'w1.t': ['Маленькие группы', 'Small groups', 'Чакан топтор'],
    'w1.d': ['До 6 человек — преподаватель слышит каждого, а вы говорите большую часть урока.', 'Up to 6 people — the teacher hears everyone, and you do most of the talking.', '6 кишиге чейин — мугалим ар бирин угат, сабактын көбүндө өзүңүз сүйлөйсүз.'],
    'w2.t': ['Опытные преподаватели', 'Experienced teachers', 'Тажрыйбалуу мугалимдер'],
    'w2.d': ['Сертификаты CELTA, DALF, TOPIK, JLPT и носители языка. В среднем 11 лет практики.', 'CELTA, DALF, TOPIK and JLPT certificates, plus native speakers. 11 years of practice on average.', 'CELTA, DALF, TOPIK, JLPT сертификаттары жана тилдин ээлери. Орточо 11 жылдык тажрыйба.'],
    'w3.t': ['Прогресс, который видно', 'Progress you can see', 'Көрүнгөн прогресс'],
    'w3.d': ['Тест уровня каждые 8 недель и понятный отчёт для вас или родителей.', 'A level test every 8 weeks and a clear report for you or your parents.', 'Ар бир 8 жумада деңгээл тести жана сизге же ата-энеңизге түшүнүктүү отчёт.'],
    'w4.t': ['Удобное расписание', 'Convenient schedule', 'Ыңгайлуу жадыбал'],
    'w4.d': ['Утро, вечер и выходные. Пропустили урок — отработаете онлайн.', 'Mornings, evenings and weekends. Missed a lesson? Catch up online.', 'Эртең менен, кечинде жана дем алышта. Сабак калып калса — онлайн толуктайсыз.'],

    // languages
    'lg.kicker': ['Языки', 'Languages', 'Тилдер'],
    'lg.title': ['10 языков для учёбы, работы и путешествий', '10 languages for study, work and travel', 'Окуу, иш жана саякат үчүн 10 тил'],
    'lg.p1': ['от 6 900 сом / мес', 'from 6,900 som / month', '6 900 сомдон / ай'],
    'lg.p2': ['от 7 900 сом / мес', 'from 7,900 som / month', '7 900 сомдон / ай'],
    'lg.popular': ['Популярный', 'Popular', 'Популярдуу'],
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
    'l.ky': ['Кыргызский', 'Kyrgyz', 'Кыргыз тили'],

    // formats
    'fm.kicker': ['Форматы и расписание', 'Formats & schedule', 'Форматтар жана жадыбал'],
    'fm.title': ['Выберите, как вам удобнее учиться', 'Choose the way you prefer to learn', 'Кантип окуу ыңгайлуу экенин тандаңыз'],
    'tab.group': ['В группе', 'In a group', 'Топто'],
    'tab.private': ['Индивидуально', 'Private', 'Жекече'],
    'tab.kids': ['Детям 6–16', 'Kids 6–16', 'Балдарга 6–16'],
    'tab.corp': ['Компаниям', 'Companies', 'Компанияларга'],
    'tab.exam': ['IELTS / TOEFL', 'IELTS / TOEFL', 'IELTS / TOEFL'],
    'f.dur': ['Длительность', 'Duration', 'Узактыгы'],
    'f.when': ['Когда', 'When', 'Качан'],
    'f.price': ['Стоимость', 'Price', 'Баасы'],
    'pg.d': ['Мини-группа до 6 человек одного уровня. Материалы включены, по пятницам — бесплатный разговорный клуб.', 'A small group of up to 6 people at the same level. Materials included, plus a free conversation club on Fridays.', 'Бир деңгээлдеги 6 кишиге чейинки чакан топ. Материалдар кирет, жума күнү — акысыз сүйлөшүү клубу.'],
    'pg.dur': ['2 × 90 мин в неделю', '2 × 90 min a week', 'Жумасына 2 × 90 мүн'],
    'pg.when': ['Утро, вечер или суббота', 'Morning, evening or Saturday', 'Эртең менен, кечинде же ишемби'],
    'pg.price': ['от 6 900 сом / мес', 'from 6,900 som / month', '6 900 сомдон / ай'],
    'pp.d': ['Программа под ваши цели: работа, переезд, экзамен или путешествия. Темп и расписание — полностью ваши.', 'A programme built around your goals: work, relocation, an exam or travel. The pace and schedule are entirely yours.', 'Сиздин максатыңызга ылайык программа: иш, көчүү, экзамен же саякат. Темп жана жадыбал — толугу менен сиздики.'],
    'pp.dur': ['60 или 90 минут', '60 or 90 minutes', '60 же 90 мүнөт'],
    'pp.when': ['Любое время, офлайн или онлайн', 'Any time, in person or online', 'Каалаган убакта, офлайн же онлайн'],
    'pp.price': ['от 1 500 сом / урок', 'from 1,500 som / lesson', '1 500 сомдон / сабак'],
    'pk.d': ['Группы по возрасту, игровая методика, проекты и театр. Родители получают отчёт о прогрессе каждый месяц.', 'Age-based groups, a playful method, projects and drama. Parents receive a progress report every month.', 'Жашы боюнча топтор, оюн ыкмасы, долбоорлор жана театр. Ата-энелер ай сайын прогресс отчётун алышат.'],
    'pk.dur': ['2 × 60 мин в неделю', '2 × 60 min a week', 'Жумасына 2 × 60 мүн'],
    'pk.when': ['После школы и по субботам', 'After school and on Saturdays', 'Мектептен кийин жана ишемби күндөрү'],
    'pk.price': ['от 5 900 сом / мес', 'from 5,900 som / month', '5 900 сомдон / ай'],
    'pc.d': ['Обучение сотрудников в офисе или онлайн: деловая переписка, переговоры, презентации. Отчётность для HR.', 'Staff training on-site or online: business correspondence, negotiations, presentations. Reporting for HR.', 'Кызматкерлерди кеңседе же онлайн окутуу: иштиктүү кат алышуу, сүйлөшүүлөр, презентациялар. HR үчүн отчёт.'],
    'pc.dur': ['Программа под задачи команды', 'A programme tailored to your team', 'Команданын милдеттерине ылайык программа'],
    'pc.when': ['В вашем офисе или онлайн', 'At your office or online', 'Сиздин кеңседе же онлайн'],
    'pc.price': ['По запросу', 'On request', 'Сурам боюнча'],
    'pe.d': ['Интенсив с пробными экзаменами в реальном формате и разбором каждого эссе. Средний результат — 7.5.', 'An intensive course with full-format mock exams and feedback on every essay. Average result: 7.5.', 'Чыныгы форматтагы сынак экзамендер жана ар бир эссени талдоо менен интенсив. Орточо жыйынтык — 7.5.'],
    'pe.dur': ['8 или 12 недель', '8 or 12 weeks', '8 же 12 жума'],
    'pe.when': ['Вечером, 3 раза в неделю', 'Evenings, 3 times a week', 'Кечинде, жумасына 3 жолу'],
    'pe.price': ['от 12 900 сом / мес', 'from 12,900 som / month', '12 900 сомдон / ай'],
    'sc.title': ['Расписание групп', 'Group timetable', 'Топтордун жадыбалы'],
    'sc.time': ['Время', 'Time', 'Убакыт'],
    'sc.r1': ['Утренние группы', 'Morning groups', 'Эртең мененки топтор'],
    'sc.r2': ['Детские группы', 'Kids’ groups', 'Балдар топтору'],
    'sc.r3': ['Вечерние группы', 'Evening groups', 'Кечки топтор'],
    'sc.r4': ['Вечерние группы', 'Evening groups', 'Кечки топтор'],
    'sc.r5': ['Группы выходного дня', 'Weekend groups', 'Дем алыш топтору'],
    'sc.note': ['Точное расписание по каждому языку подскажет администратор.', 'Our administrator will confirm the exact timetable for each language.', 'Ар бир тил боюнча так жадыбалды администратор айтып берет.'],

    // steps
    'hw.kicker': ['Как начать', 'How to start', 'Кантип баштоо'],
    'hw.title': ['Три шага до первого урока', 'Three steps to your first lesson', 'Биринчи сабакка чейин үч кадам'],
    's1.t': ['Оставьте заявку', 'Leave a request', 'Өтүнмө калтырыңыз'],
    's1.d': ['На сайте, в WhatsApp или по телефону — это займёт минуту.', 'On the website, via WhatsApp or by phone — it takes a minute.', 'Сайтта, WhatsAppта же телефон аркылуу — бир мүнөт гана.'],
    's2.t': ['Пробный урок и тест', 'Trial lesson and test', 'Сынак сабак жана тест'],
    's2.d': ['Бесплатно определим уровень и познакомим с преподавателем.', 'We’ll assess your level for free and introduce you to your teacher.', 'Деңгээлиңизди акысыз аныктап, мугалим менен тааныштырабыз.'],
    's3.t': ['Начните учиться', 'Start learning', 'Окууну баштаңыз'],
    's3.d': ['Подберём группу и время. Оплата помесячно, без долгих договоров.', 'We’ll match you with a group and a time. Monthly payments, no long contracts.', 'Топту жана убакытты тандайбыз. Төлөм ай сайын, узак келишимсиз.'],

    // prices
    'pr.kicker': ['Цены', 'Prices', 'Баалар'],
    'pr.title': ['Честные цены без скрытых платежей', 'Honest prices, no hidden fees', 'Жашыруун төлөмсүз калыс баалар'],
    'pr.from': ['от', 'from', 'баасы'],
    'pr.badge': ['Чаще всего выбирают', 'Most chosen', 'Көбүнчө тандашат'],
    'pr.month': ['сом / месяц', 'som / month', 'сомдон / ай'],
    'pr.lesson': ['сом / урок', 'som / lesson', 'сомдон / сабак'],
    'pr.t1': ['Группа', 'Group', 'Топ'],
    'pr.t1.f1': ['8 занятий по 90 минут', '8 lessons × 90 minutes', '90 мүнөттөн 8 сабак'],
    'pr.t1.f2': ['Учебники и материалы', 'Textbooks and materials', 'Окуу китептери жана материалдар'],
    'pr.t1.f3': ['Разговорный клуб бесплатно', 'Free conversation club', 'Акысыз сүйлөшүү клубу'],
    'pr.t2': ['Индивидуально', 'Private', 'Жекече'],
    'pr.t2.f1': ['Программа под ваши цели', 'A plan built around your goals', 'Максатыңызга ылайык программа'],
    'pr.t2.f2': ['Гибкое время, офлайн или онлайн', 'Flexible time, in person or online', 'Ийкемдүү убакыт, офлайн же онлайн'],
    'pr.t2.f3': ['Отчёт о прогрессе каждый месяц', 'Monthly progress report', 'Ай сайын прогресс отчёту'],
    'pr.t3': ['Детская группа', 'Kids’ group', 'Балдар тобу'],
    'pr.t3.f1': ['8 занятий по 60 минут', '8 lessons × 60 minutes', '60 мүнөттөн 8 сабак'],
    'pr.t3.f2': ['Группы по возрасту', 'Age-based groups', 'Жашы боюнча топтор'],
    'pr.t3.f3': ['Отчёт для родителей', 'Reports for parents', 'Ата-энелерге отчёт'],
    'pr.t4': ['IELTS / TOEFL', 'IELTS / TOEFL', 'IELTS / TOEFL'],
    'pr.t4.f1': ['12 занятий в месяц', '12 lessons a month', 'Айына 12 сабак'],
    'pr.t4.f2': ['Три пробных экзамена', 'Three mock exams', 'Үч сынак экзамен'],
    'pr.t4.f3': ['Разбор каждого эссе', 'Feedback on every essay', 'Ар бир эссени талдоо'],
    'pr.choose': ['Записаться', 'Sign up', 'Жазылуу'],
    'pr.note': ['Скидка 10% при оплате за 3 месяца и для второго члена семьи. Корпоративные программы — по запросу.', '10% off when you pay for 3 months, and for a second family member. Corporate programmes on request.', '3 айга төлөгөндө жана үй-бүлөнүн экинчи мүчөсүнө 10% арзандатуу. Корпоративдик программалар — сурам боюнча.'],

    // teachers
    'tc.kicker': ['Преподаватели', 'Teachers', 'Мугалимдер'],
    'tc.title': ['Учат те, кто сам говорит на языке свободно', 'Taught by people who speak the language fluently', 'Тилде эркин сүйлөгөндөр окутат'],
    'tc.exp': ['опыт {n} лет', '{n} years of experience', '{n} жыл тажрыйба'],
    'tc.note': ['Имена приведены для примера.', 'Names are illustrative.', 'Ысымдар мисал катары берилген.'],
    't1.n': ['Амели Руссо', 'Amélie Rousseau', 'Амели Руссо'], 't1.r': ['Французский · DALF C2', 'French · DALF C2', 'Француз тили · DALF C2'],
    't2.n': ['Тимур Асанов', 'Timur Asanov', 'Тимур Асанов'], 't2.r': ['Английский · CELTA', 'English · CELTA', 'Англис тили · CELTA'],
    't3.n': ['Пак Со Юн', 'Park Seo-yun', 'Пак Со Юн'], 't3.r': ['Корейский · TOPIK 6', 'Korean · TOPIK 6', 'Корей тили · TOPIK 6'],
    't4.n': ['Хана Мори', 'Hana Mori', 'Хана Мори'], 't4.r': ['Японский · JLPT N1', 'Japanese · JLPT N1', 'Жапон тили · JLPT N1'],
    't5.n': ['Лукас Хофман', 'Lukas Hofmann', 'Лукас Хофман'], 't5.r': ['Немецкий · Goethe C2', 'German · Goethe C2', 'Немис тили · Goethe C2'],
    't6.n': ['Айгуль Токтосунова', 'Aigul Toktosunova', 'Айгүл Токтосунова'], 't6.r': ['Английский для детей', 'English for kids', 'Балдар үчүн англис тили'],

    // reviews
    'rv.kicker': ['Отзывы', 'Reviews', 'Пикирлер'],
    'rv.title': ['Что говорят студенты и родители', 'What students and parents say', 'Студенттер жана ата-энелер эмне дейт'],
    'rv.q1': ['Через полгода впервые посмотрела французский фильм без субтитров. Преподаватель объясняет так, что всё сразу складывается.', 'Six months in, I watched a French film without subtitles for the first time. The teacher explains things so that it all just clicks.', 'Алты айдан кийин биринчи жолу француз тасмасын субтитрсиз көрдүм. Мугалим баары дароо түшүнүктүү болгондой түшүндүрөт.'],
    'rv.a1': ['Студентка, французский B2', 'Student, French B2', 'Студент, француз тили B2'],
    'rv.q2': ['Готовился к IELTS 8 недель и получил 7.5. Пробные экзамены очень помогли: на настоящем уже не волновался.', 'I prepared for IELTS for 8 weeks and scored 7.5. The mock exams helped a lot — I wasn’t nervous on the real day.', 'IELTSке 8 жума даярданып, 7.5 алдым. Сынак экзамендер абдан жардам берди: чыныгысында толкунданган жокмун.'],
    'rv.a2': ['Студент, подготовка к IELTS', 'Student, IELTS preparation', 'Студент, IELTS даярдыгы'],
    'rv.q3': ['Сын ходит на английский второй год. Сам переписывается с друзьями из Англии и ждёт каждого занятия.', 'My son has been studying English for two years. He chats with friends in England on his own and looks forward to every lesson.', 'Уулум англис тилине экинчи жыл катышып жатат. Англиядагы достору менен өзү кат алышат жана ар бир сабакты күтөт.'],
    'rv.a3': ['Мама ученика, 11 лет', 'Mother of a student, age 11', 'Окуучунун апасы, 11 жаш'],
    'rv.note': ['Отзывы приведены как пример; имена не указываются.', 'Reviews are illustrative; names are withheld.', 'Пикирлер мисал катары берилген; ысымдар көрсөтүлгөн эмес.'],

    // faq
    'faq.kicker': ['Вопросы и ответы', 'FAQ', 'Суроо-жооп'],
    'faq.title': ['Частые вопросы', 'Frequently asked questions', 'Көп берилүүчү суроолор'],
    'faq.q1': ['Я совсем не знаю язык. Можно начать с нуля?', 'I don’t know the language at all. Can I start from scratch?', 'Тилди такыр билбейм. Нөлдөн баштаса болобу?'],
    'faq.a1': ['Да. Группы уровня A1 стартуют каждый месяц, а программа рассчитана на тех, кто начинает с алфавита.', 'Yes. A1 groups start every month, and the programme is designed for complete beginners.', 'Ооба. A1 деңгээлиндеги топтор ар ай сайын башталат, программа алиппеден баштагандар үчүн түзүлгөн.'],
    'faq.q2': ['Сколько длится курс одного уровня?', 'How long does one level take?', 'Бир деңгээлдин курсу канча убакытка созулат?'],
    'faq.a2': ['Обычно 3–4 месяца при занятиях дважды в неделю. На индивидуальных занятиях — быстрее.', 'Usually 3–4 months with two lessons a week. Private lessons are faster.', 'Адатта жумасына эки сабак менен 3–4 ай. Жеке сабактарда тезирээк.'],
    'faq.q3': ['Что, если я пропущу занятие?', 'What if I miss a lesson?', 'Сабакты өткөрүп жиберсем эмне болот?'],
    'faq.a3': ['Пришлём материалы урока, а пропущенную тему можно бесплатно отработать онлайн с преподавателем.', 'We’ll send you the lesson materials, and you can catch up on the topic online with your teacher for free.', 'Сабактын материалдарын жөнөтөбүз, ал эми калган теманы мугалим менен онлайн акысыз толуктай аласыз.'],
    'faq.q4': ['С какого возраста принимаете детей?', 'From what age do you accept children?', 'Балдарды канча жаштан кабыл аласыздар?'],
    'faq.a4': ['С 6 лет. Для детей — отдельные группы по возрасту, игровая методика и ежемесячный отчёт для родителей.', 'From age 6. Children study in separate age groups with a playful method and a monthly report for parents.', '6 жаштан. Балдар үчүн жашы боюнча өзүнчө топтор, оюн ыкмасы жана ата-энелерге ай сайын отчёт.'],
    'faq.q5': ['Выдаёте ли вы сертификат?', 'Do you issue a certificate?', 'Сертификат бересиздерби?'],
    'faq.a5': ['Да. После каждого уровня — сертификат школы с указанием уровня по шкале CEFR.', 'Yes. After each level you receive a school certificate stating your CEFR level.', 'Ооба. Ар бир деңгээлден кийин CEFR шкаласы боюнча деңгээли көрсөтүлгөн мектептин сертификаты берилет.'],
    'faq.q6': ['Можно ли учиться онлайн?', 'Can I study online?', 'Онлайн окуса болобу?'],
    'faq.a6': ['Да. Индивидуальные занятия и часть групп проходят онлайн с теми же преподавателями.', 'Yes. Private lessons and some groups run online with the same teachers.', 'Ооба. Жеке сабактар жана топтордун бир бөлүгү ошол эле мугалимдер менен онлайн өтөт.'],

    // sign-up
    'su.kicker': ['Запись', 'Sign up', 'Жазылуу'],
    'su.title': ['Запишитесь на бесплатный пробный урок', 'Book your free trial lesson', 'Акысыз сынак сабакка жазылыңыз'],
    'su.lead': ['Перезвоним в течение 15 минут в рабочее время, ответим на вопросы и подберём удобную группу.', 'We’ll call you back within 15 minutes during business hours, answer your questions and find a group that suits you.', 'Иш убагында 15 мүнөттүн ичинде кайра чалып, суроолоруңузга жооп берип, ыңгайлуу топ тандайбыз.'],
    'su.or': ['Или напишите нам напрямую', 'Or message us directly', 'Же бизге түз жазыңыз'],
    'su.call': ['Позвонить', 'Call us', 'Чалуу'],
    'su.p1': ['Бесплатный тест уровня', 'Free level test', 'Акысыз деңгээл тести'],
    'su.p2': ['Знакомство с преподавателем', 'Meet your teacher', 'Мугалим менен таанышуу'],
    'su.p3': ['Подбор группы и времени', 'Group and time matching', 'Топ жана убакыт тандоо'],
    'fm.name': ['Ваше имя', 'Your name', 'Атыңыз'],
    'fm.phone': ['Телефон или WhatsApp', 'Phone or WhatsApp', 'Телефон же WhatsApp'],
    'fm.language': ['Язык', 'Language', 'Тил'],
    'fm.format': ['Формат', 'Format', 'Формат'],
    'fm.time': ['Удобное время', 'Preferred time', 'Ыңгайлуу убакыт'],
    'fm.select': ['Выберите', 'Select', 'Тандаңыз'],
    'time.m': ['Утро', 'Morning', 'Эртең менен'],
    'time.d': ['День', 'Afternoon', 'Түштөн кийин'],
    'time.e': ['Вечер', 'Evening', 'Кечинде'],
    'time.w': ['Выходные', 'Weekend', 'Дем алыш'],
    'fm.consent': ['Согласен(на) на обработку персональных данных', 'I agree to the processing of my personal data', 'Жеке маалыматтарымды иштетүүгө макулмун'],
    'fm.submit': ['Записаться бесплатно', 'Book for free', 'Акысыз жазылуу'],
    'fm.err.name': ['Укажите имя', 'Please enter your name', 'Атыңызды жазыңыз'],
    'fm.err.phone': ['Укажите номер — не менее 9 цифр', 'Enter a number — at least 9 digits', 'Номерди жазыңыз — кеминде 9 сан'],
    'fm.err.consent': ['Нужно ваше согласие', 'Your consent is required', 'Макулдугуңуз керек'],
    'fm.ok.title': ['Спасибо! Заявка принята', 'Thank you! Request received', 'Рахмат! Өтүнмө кабыл алынды'],
    'fm.ok.text': ['Администратор свяжется с вами в течение 15 минут в рабочее время.', 'Our administrator will contact you within 15 minutes during business hours.', 'Администратор иш убагында 15 мүнөттүн ичинде сиз менен байланышат.'],
    'fm.ok.again': ['Отправить ещё одну заявку', 'Send another request', 'Дагы бир өтүнмө жөнөтүү'],
    'fm.demo': ['Демо-форма: данные никуда не отправляются.', 'Demo form: no data is sent anywhere.', 'Демо-форма: маалыматтар эч жакка жөнөтүлбөйт.'],

    // contacts
    'ct.kicker': ['Контакты', 'Contact', 'Байланыш'],
    'ct.title': ['Ждём вас в центре Бишкека', 'Visit us in central Bishkek', 'Бишкектин борборунда күтөбүз'],
    'ct.address.l': ['Адрес', 'Address', 'Дарек'],
    'ct.hours.l': ['Часы работы', 'Opening hours', 'Иш убактысы'],
    'ct.phone.l': ['Телефон', 'Phone', 'Телефон'],
    'ct.mail.l': ['Почта', 'Email', 'Почта'],
    'ct.map': ['Открыть на карте', 'Open in maps', 'Картадан ачуу'],
    'ct.pin': ['Мы здесь', 'We are here', 'Биз бул жердебиз'],
    'ft.rights': ['© 2026 Maison Babel. Вымышленная школа — демонстрационный сайт.', '© 2026 Maison Babel. A fictional school — demo website.', '© 2026 Maison Babel. Ойдон чыгарылган мектеп — демо сайт.'],
    'ft.top': ['Наверх', 'Back to top', 'Жогору'],
    'mb.signup': ['Бесплатный урок', 'Free lesson', 'Акысыз сабак']
  };

  var current = 'ru', listeners = [];
  function stored() { try { var v = localStorage.getItem(KEY); return LANGS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) { /* storage unavailable */ } }
  function t(k) { var r = D[k]; if (!r) return k; var v = r[LANGS.indexOf(current)]; return v != null ? v : r[0]; }
  function fmt(k, vars) { var s = t(k); for (var x in vars) s = s.split('{' + x + '}').join(vars[x]); return s; }

  function apply(l) {
    if (LANGS.indexOf(l) < 0) l = 'ru';
    current = l;
    document.documentElement.lang = l;
    var i, e = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < e.length; i++) e[i].textContent = t(e[i].getAttribute('data-i18n'));
    e = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < e.length; i++) e[i].innerHTML = t(e[i].getAttribute('data-i18n-html'));
    e = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < e.length; i++) {
      e[i].getAttribute('data-i18n-attr').split(';').forEach(function (p) {
        var kv = p.split(':'); if (kv.length === 2) this.setAttribute(kv[0].trim(), t(kv[1].trim()));
      }, e[i]);
    }
    document.title = t('meta.title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
    e = document.querySelectorAll('[data-set-lang]');
    for (i = 0; i < e.length; i++) e[i].setAttribute('aria-pressed', e[i].getAttribute('data-set-lang') === l ? 'true' : 'false');
  }
  function set(l) { apply(l); save(l); listeners.forEach(function (f) { f(current); }); }

  window.I18N = { t: t, format: fmt, set: set, onChange: function (f) { listeners.push(f); }, get lang() { return current; } };

  apply(stored() || 'ru');
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-set-lang]');
    if (!b) return; ev.preventDefault();
    var l = b.getAttribute('data-set-lang'); if (l !== current) set(l);
  });
})();
