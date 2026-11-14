<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a class="storefront__brand" href="#" aria-label="Forma, на початок">
        FORMA<span class="storefront__brand-mark">®</span>
      </a>
      <p class="storefront__edition">Лабораторна / 06</p>
      <p class="storefront__note">Каталог і composables</p>

      <nav class="storefront__nav" aria-label="Основна навігація">
        <RouterLink class="storefront__nav-link" :to="{ name: 'products' }">
          Каталог
        </RouterLink>
        <RouterLink class="storefront__nav-link" :to="{ name: 'about' }">
          Про застосунок
        </RouterLink>
      </nav>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <p>Студент: Крюков Марк · 7F.F2.25-2</p>
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noreferrer">
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>
