## Встановлення та запуск
Усі команди виконуються з папки `lab3`. Із кореня репозиторію `mjsf-mag`:

```powershell
cd lab3
npm ci
npm run dev -- --port 5173 --strictPort
```

Застосунок: <http://localhost:5173>.
Параметр `--strictPort` забороняє автоматичний перехід на інший порт.
Зупинка сервера — `Ctrl+C` у його терміналі.

## Збірка та preview

Зупиніть dev-сервер і виконайте:

```powershell
npm run build
npm run preview -- --port 4173 --strictPort
```

Команда `build` створює готові файли в `dist/`.
Команда `preview` дозволяє локально перевірити цю збірку за адресою
<http://localhost:4173>. Після перевірки зупиніть preview через `Ctrl+C`.

## Структура компонентів

```text
lab3/
├── index.html
├── public/                     # Статичні ресурси
├── src/
│   ├── main.js                 # Створення застосунку та монтування в #app
│   ├── App.vue                 # Композиція сторінки
│   ├── style.css               # Загальні стилі та директиви Tailwind
│   ├── data/
│   │   └── materials.js        # Початкові матеріали
│   └── components/
│       ├── MaterialCatalog.vue
│       ├── MaterialFilterForm.vue
│       ├── MaterialCard.vue
│       └── ModalDialog.vue
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── package-lock.json
```

## Контракт ModalDialog

Компонент використовується в каталозі в одному екземплярі для двох режимів:
редагування та підтвердження видалення. Вміст і дії задає батьківський компонент.