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
## Лабораторна робота 6

### Дерево маршрутів

```text
/                          → redirect на products
/products                  ProductsLayout
├── ''                     ProductCatalogView     products
└── :id                    ProductLayout
    ├── ''                 ProductOverviewView    product-overview
    └── reviews            ProductReviewsView     product-reviews
/about                     AboutView              about
/:pathMatch(.*)*           NotFoundView           not-found
```

### Відповідальність модулів

| Модуль | Відповідальність |
|---|---|
| `App.vue` | Загальна шапка, основна навігація, підвал і зовнішній `RouterView` |
| `router/index.js` | Маршрути, режим історії, redirect, catch-all і `meta.breadcrumb` |
| `ProductsLayout.vue` | `RouterView` для каталогу або оболонки товару |
| `ProductLayout.vue` | Дані товару за `id`, спільна інформація товару й `RouterView` для огляду та відгуків |
| `ProductCatalogView.vue` | Координація пошуку, запитів і дозавантаження каталогу |
| `ProductOverviewView.vue` | Опис і характеристики отриманого товару |
| `ProductReviewsView.vue` | Відгуки отриманого товару |
| `AboutView.vue` | Інформація про застосунок |
| `NotFoundView.vue` | Сторінка невідомої адреси |
| `Breadcrumbs.vue` | Відображення переданих крихт без HTTP |
| `useBreadcrumbs.js` | Обчислення крихт за `route.matched` і назвою товару |
| `ProductSearchForm`, `ProductCatalog`, `ProductCard`, `CatalogLoadMore` | Компоненти каталогу з роботи 5 |
| `useFetch`, `useDebouncedValue`, `useIntersectionObserver` | Composables із роботи 5 |

### Метадані хлібних крихт

| Запис маршруту | Компонент | `meta.breadcrumb` | Підпис у крихтах |
|---|---|---|---|
| `/products` | `ProductsLayout` | `{ label: 'Каталог', name: 'products' }` | Каталог |
| `:id` | `ProductLayout` | `{ dynamic: 'product', name: 'product-overview' }` | «Товар №id» під час завантаження, назва товару після відповіді, «Товар не знайдено» для відсутнього товару |
| `reviews` | `ProductReviewsView` | `{ label: 'Відгуки', name: 'product-reviews' }` | Відгуки |
| `/about` | `AboutView` | `{ label: 'Про застосунок', name: 'about' }` | Про застосунок |
| `/:pathMatch(.*)*` | `NotFoundView` | `{ label: 'Сторінку не знайдено', name: 'not-found' }` | Сторінку не знайдено |

Порожні дочірні шляхи каталогу (`products`) і огляду (`product-overview`) не мають `meta.breadcrumb`, тому їхній рівень не дублюється.
