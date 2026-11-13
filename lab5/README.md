# Заготовка каталогу до лабораторної роботи № 5

Заготовка містить готовий адаптивний інтерфейс на Vue 3 і завантажує перші
12 товарів із DummyJSON. Початковий API-виклик, стани завантаження та помилки,
BEM-класи й оформлення вже працюють.

Дві можливості навмисно не реалізовано. Текстове поле не змінює запит до API,
а нижній блок не завантажує наступну сторінку. Уся розмітка поки розташована
в `App.vue`; межі майбутніх компонентів позначено коментарями `TODO`.

![Початковий вигляд каталогу](screenshot.png)

## Отримання та запуск

Скопіюйте стартер до каталогу `lab5` свого репозиторію:

```bash
git clone --depth 1 https://github.com/lisnayk/znu-lab-starters.git ../znu-lab-starters
cp -R ../znu-lab-starters/modern-frameworks/labs/05-composables/starter ./lab5
cd lab5
npm ci
npm run dev
```

Vite покаже локальну адресу застосунку. Для перевірки виробничої збірки
використовуйте `npm run build`.

## Початковий стан

- після затримки 1500 мс показано 12 товарів;
- введення `phone` не змінює каталог і не створює нового мережевого запиту;
- прокручування до нижнього блока не завантажує наступні товари;
- повторний запит доступний після помилки початкового завантаження;
- вихідна розмітка зосереджена в `App.vue` й потребує розподілу за
  відповідальністю.

Повний хід роботи, контракти компонентів і критерії перевірки наведено в Moodle.

## Розподіл відповідальності

| Модуль | Входи | Виходи | Власний стан | Відповідальність |
|---|---|---|---|---|
| `App.vue` | — | — | `query`, `skip`, `products`, `total` | Поєднання пошуку, сторінок, composables і компонентів |
| `ProductSearchForm.vue` | `modelValue`, `isLoading`, `error`, `loaded`, `total` | `update:modelValue` | — | Поле пошуку та стан запиту, без HTTP |
| `ProductCatalog.vue` | `products`, `isLoading`, `error` | `retry` | — | Сітка товарів або порожній стан |
| `ProductCard.vue` | `product` | — | — | Представлення одного товару |
| `CatalogLoadMore.vue` | `loaded`, `total`, `isLoading`, `error`, `hasMore` | `load-more`, `retry` | посилання на маркер | Нижній маркер і стан наступної сторінки |
| `useFetch.js` | `url` | `data`, `error`, `isLoading`, `abort`, `refetch` | `AbortController` | Запит, асинхронний стан і скасування |
| `useDebouncedValue.js` | `source`, `delay` | readonly `ref` | таймер | Відкладене значення й очищення таймера |
| `useIntersectionObserver.js` | `target`, `callback`, `options` | — | `IntersectionObserver` | Підписка на перетин і очищення observer |

## Потік стану

```text
query → abort активного запиту
   └── debounce 400 мс → requestUrl → useFetch → page
                                                 └── merge → products
нижній маркер → load-more → skip + 12 ───────────┘
```

Кожна зміна сирого `query` одразу скасовує активний запит. Через 400 мс без
введення `debouncedQuery` скидає `skip`, `products` і `total`, а новий
`requestUrl` запускає `useFetch`. Отримана сторінка з `skip=0` замінює список,
наступні сторінки додаються без повторення `id`. Нижній маркер через подію
`load-more` збільшує `skip` на 12, що знову змінює `requestUrl`.