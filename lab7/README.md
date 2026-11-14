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

## Лабораторна робота 7

### Власники стану

| Стан | Власник | Хто використовує |
|---|---|---|
| Логін і пароль форми входу | `LoginView` (локально) | Лише форма; пароль передається в `login` як аргумент і не зберігається у store |
| Чернетка товару: `title`, `price`, `stock`, `description` | `ProductEditView` (локально) | Лише редактор |
| Сеанс: `accessToken`, `user`, `status`, `error` | store `auth` | Шапка, глобальний гард, `ManageLayout`, приватні запити |
| Підтверджені зміни товарів за `id` | store `products` | Приватний список, редактор, публічна сторінка товару, крихта, картки каталогу |
| Дані приватного запиту: `data`, `isLoading`, `error` | `usePrivateResource` у компоненті | Компонент, що його викликав |
| Пошук `q`, `id` товару | Маршрут (`route.query`, `route.params`) | Каталог, сторінки товару, редактор — як у роботі 6 |

### Маршрути

| Шлях | Назва | Компонент | `meta` | Доступ |
|---|---|---|---|---|
| `/` | — | — | — | redirect на `products` |
| `/products` | — | `ProductsLayout` | `breadcrumb: Каталог` | Публічний |
| `/products` → `''` | `products` | `ProductCatalogView` | — | Публічний |
| `/products/:id` | — | `ProductLayout` | `breadcrumb: dynamic product` | Публічний |
| `/products/:id` → `''` | `product-overview` | `ProductOverviewView` | — | Публічний |
| `/products/:id/reviews` | `product-reviews` | `ProductReviewsView` | `breadcrumb: Відгуки` | Публічний |
| `/about` | `about` | `AboutView` | `breadcrumb: Про застосунок` | Публічний |
| `/login` | `login` | `LoginView` | — | Публічний; після входу переходить до перевіреної цілі `redirect` |
| `/manage/products` | — | `ManageLayout` | `requiresAuth: true`, `breadcrumb: Керування` | Приватний |
| `/manage/products` → `''` | `manage-products` | `ManageProductsView` | успадковує `requiresAuth` | Приватний |
| `/manage/products/:id/edit` | `manage-edit` | `ProductEditView` | `breadcrumb: dynamic product`, успадковує `requiresAuth` | Приватний |
| `/:pathMatch(.*)*` | `not-found` | `NotFoundView` | `breadcrumb: Сторінку не знайдено` | Публічний |

Гард перевіряє `to.meta.requiresAuth`, який Vue Router об'єднує з батьківських записів. Гостя з приватної адреси переспрямовано на `/login?redirect=<адреса>`. Ціль повернення приймається лише як внутрішній шлях до `manage-products` або `manage-edit`, інакше використовується `manage-products`.

### Життєвий цикл сеансу

| `status` | Значення |
|---|---|
| `idle` | Сеанс ще не перевірявся |
| `restoring` | Триває `GET /auth/me` зі збереженим токеном |
| `signing-in` | Триває `POST /auth/login` |
| `authenticated` | Токен і профіль підтверджені |
| `guest` | Токена немає або його вилучено |
| `unavailable` | Перевірку не завершено через мережу; токен збережено для повтору |

1. **Запуск і reload.** Перший перехід чекає `auth.restore()` у `beforeEach`. Без токена в `sessionStorage` статус стає `guest` без запиту. Зі збереженим токеном виконується `GET /auth/me`: 200 дає `authenticated`, 401 вилучає токен і дає `guest` з повідомленням «Сеанс завершився. Увійдіть знову», мережева помилка дає `unavailable`. Кнопка «Повторити перевірку» в шапці запускає перевірку знову.
2. **Вхід.** `POST /auth/login` з `expiresInMins: 30`. Пароль передається лише аргументом і після виклику очищується у формі. Успіх записує `accessToken` у `sessionStorage`, профіль — у `user`, `refreshToken` відкидається. Відповідь 400 показує помилку й повертає попередній статус.
3. **Приватні запити.** `auth.request` додає `Authorization: Bearer`. Відповідь 401 для того самого токена й сеансу завершує сеанс, а `ManageLayout` переспрямовує на вхід із поверненням до поточної адреси.
4. **Вихід.** Токен вилучається з пам'яті та `sessionStorage`, активні запити скасовуються, статус стає `guest`, `ManageLayout` переходить до каталогу.
5. **Пізні відповіді.** Кожне завершення сеансу збільшує лічильник сеансу. Відповіді операцій, розпочатих у попередньому сеансі, ігноруються.
6. **Підтверджені зміни.** Зміна `accessToken` викликає `products.reset()`: словник змін очищується, незавершені PATCH скасовуються. Після reload словник порожній, бо зберігається лише в пам'яті.

### Відповідальність нових модулів

| Модуль | Відповідальність |
|---|---|
| `stores/index.js` | Єдиний екземпляр Pinia, який підключається перед маршрутизатором |
| `stores/auth.js` | Setup Store сеансу: токен, перевірений профіль, стан, помилка; вхід, відновлення, вихід, приватні запити |
| `stores/products.js` | Setup Store підтверджених змін товарів за `id`; збереження та очищення |
| `api/http.js` | JSON-запит до API: перевірка `response.ok`, HTTP-статус помилки, `AbortSignal`, заголовок `Authorization: Bearer`, `credentials: 'omit'` |
| `api/productDraft.js` | Нормалізація й перевірка чернетки товару |
| `auth/session.js` | Збереження, читання й вилучення лише `accessToken` у `sessionStorage` |
| `composables/usePrivateResource.js` | Реактивне приватне читання зі станом `data`, `isLoading`, `error` і скасуванням застарілого запиту |
| `router/guards.js` | Глобальний `beforeEach`: очікування перевірки сеансу, перенаправлення на вхід, перевірка цілі повернення |
| `layouts/ManageLayout.vue` | Приватна оболонка: показує `RouterView` лише для підтвердженого сеансу |
| `views/LoginView.vue` | Форма входу з локальним паролем, помилкою та станом операції |
| `views/ManageProductsView.vue` | Приватний список товарів із перегортанням сторінок |
| `views/ProductEditView.vue` | Редактор товару з локальною чернеткою, збереженням і захистом незбережених змін |
| `App.vue` | Загальна шапка, основна навігація, підвал і зовнішній `RouterView`; створює сховища `auth` і `products` |
