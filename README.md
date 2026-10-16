# Maison Babel — школа иностранных языков (демо)

Статический многоязычный сайт вымышленной языковой школы в Бишкеке. Эстетика «тихой роскоши»: бумага, чернила, бордо; анимации построены на скролле.

**Бренд вымышленный.** Преподаватели, отзывы, цифры и контакты приведены для примера.

## Запуск

Сборка не нужна — это чистые HTML/CSS/JS.

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## Структура

```
index.html
assets/css/style.css   — дизайн-система, вёрстка, адаптив, prefers-reduced-motion
assets/js/lexicon.js   — данные: приветствия, алфавиты, «слово дня», города для глобуса
assets/js/i18n.js      — словарь RU / EN / KY и движок перевода (data-i18n)
assets/js/globe.js     — линейный глобус на canvas с дугами из Бишкека
assets/js/main.js      — анимации, квиз, форма, курсор, слайдер
```

## Языки интерфейса

RU (по умолчанию), EN, KY. Переключатель в шапке и в мобильном меню; выбор сохраняется в `localStorage` (`mb-lang`), обновляется `<html lang>`, `title` и `meta description`.
Новая строка добавляется в `assets/js/i18n.js` в формате `'ключ': [ru, en, ky]` и подключается в разметке атрибутом `data-i18n="ключ"` (`data-i18n-html` — для строк с `<em>`, `data-i18n-attr="aria-label:ключ"` — для атрибутов).

## Библиотеки (CDN, фиксированные версии)

- GSAP 3.12.5 + ScrollTrigger (cdnjs)
- Lenis 1.1.13 (unpkg)
- Google Fonts: Cormorant Garamond, Manrope, Noto Serif JP / KR / SC, Noto Naskh Arabic

Если CDN недоступен, сайт остаётся полностью читаемым: без плавного скролла и scroll-анимаций, бегущая строка — на CSS.

## Доступность

Учитывается `prefers-reduced-motion`: без интро, пинов, плавного скролла и кастомного курсора. Есть skip-link, видимый фокус, `aria-label` у разбитых на буквы заголовков, подсказки к словам доступны с клавиатуры и по тапу.
