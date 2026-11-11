"use strict";

(() => {
  const STORAGE_KEY = "shell_forum_v1";

  const CATEGORY_META = {
    all: { title: "Все темы", tag: "Все" },
    news: { title: "Обновления", tag: "Обновления" },
    configs: { title: "Конфиги", tag: "Конфиги" },
    guides: { title: "Гайды", tag: "Гайды" },
    private: { title: "Private / Навсегда", tag: "Private" }
  };

  const DEFAULT_THREADS = [
    {
      id: "t-private-access",
      category: "private",
      title: "Доступ Private / Навсегда — оформление и статус раздела",
      author: "shell_team",
      createdAt: "10.11.2026",
      pinned: true,
      body: "Тариф Private / Навсегда оформляется через закрытый раздел форума после подключения серверного бэкенда форума.\n\nЧто входит в доступ:\n• Бессрочная лицензия без продления\n• Приоритетные сборки и ранние байпасы под 1.21.10 Fabric\n• Закрытый набор конфигов (FunTime Polar, HolyWorld HolyAC, GrimAC)\n• Ускоренный сброс HWID через кабинет",
      posts: [
        {
          author: "shell_team",
          createdAt: "10.11.2026",
          body: "После подключения серверной базы форума здесь откроется форма подачи заявки и выдачи Private-ключа."
        }
      ]
    },
    {
      id: "t-release-200",
      category: "news",
      title: "Shell v2.0.0 — метод Shell Custom 1.3.2 и профили Polar / HolyAC",
      author: "shell_team",
      createdAt: "09.11.2026",
      pinned: true,
      body: "Выпущено обновление лоадера terminal.exe v2.0.0 и встроенного ClickGUI.\n\nОсновные изменения:\n• Добавлен метод инъекции Shell Custom 1.3.2 (наряду с Manual Map)\n• Обновлены профили для FunTime (Polar) и HolyWorld (HolyAC)\n• Переработан веб-редактор конфигов и личный кабинет",
      posts: []
    },
    {
      id: "t-cfg-funtime",
      category: "configs",
      title: "FunTime (Polar) — чистый PvP конфиг без лишних флагов",
      author: "user",
      createdAt: "08.11.2026",
      pinned: false,
      body: "Профиль под актуальный FunTime (Polar) на 1.21.10 Fabric.\n\nПараметры:\n• Killaura: Range 3.05, Rotation Smooth 0.72, Raycast On\n• AimAssist: Speed 52%, FOV 75°\n• HitboxTweaks: Off для основы, Minimal под дуэли",
      posts: [
        {
          author: "m1ke",
          createdAt: "09.11.2026",
          body: "Протестировал на 1.21.10 — с Smooth 0.72 и выключенным KeepSprint под Polar идёт стабильно."
        }
      ]
    },
    {
      id: "t-cfg-holyworld",
      category: "configs",
      title: "HolyWorld (HolyAC) — конфиг под дуэли, трапки и тотемы",
      author: "kuro",
      createdAt: "07.11.2026",
      pinned: false,
      body: "Сборка модулей под HolyWorld (HolyAC):\n• TriggerBot + AutoPotion\n• AutoTotem (порог 4.5 HP, Crystal Check On)\n• CrystalAura с задержкой 40 мс и Swap Back",
      posts: []
    },
    {
      id: "t-guide-inject",
      category: "guides",
      title: "Гайд: первый запуск terminal.exe и выбор метода инъекции",
      author: "shell_team",
      createdAt: "06.11.2026",
      pinned: false,
      body: "Порядок запуска:\n1. Запустите Minecraft 1.21.10 Fabric и дождитесь главного меню.\n2. Скачайте terminal.exe в личном кабинете и откройте его от имени администратора.\n3. Выберите метод Shell Custom 1.3.2 (рекомендуемый) или Manual Map.\n4. Дождитесь строки injected successfully. и откройте ClickGUI клавишей RSHIFT.",
      posts: []
    }
  ];

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_THREADS));
  }

  function loadThreads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return cloneDefaults();
      return parsed;
    } catch {
      return cloneDefaults();
    }
  }

  function saveThreads(threads) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // ignore storage quota errors
    }
  }

  function formatToday() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  function currentUserName() {
    try {
      const login = (localStorage.getItem("enhance_login") || "").trim();
      const token = (localStorage.getItem("enhance_token") || "").trim();
      return token && login ? login : "Гость";
    } catch {
      return "Гость";
    }
  }

  const state = {
    threads: loadThreads(),
    category: "all",
    search: "",
    activeThreadId: null
  };

  const els = {
    catButtons: Array.from(document.querySelectorAll("[data-forum-cat]")),
    title: document.getElementById("forum-active-title"),
    search: document.getElementById("forum-search"),
    newBtn: document.getElementById("forum-new-btn"),
    composer: document.getElementById("forum-composer"),
    composerClose: document.getElementById("forum-composer-close"),
    topicForm: document.getElementById("forum-topic-form"),
    topicCat: document.getElementById("topic-cat"),
    topicTitle: document.getElementById("topic-title"),
    topicBody: document.getElementById("topic-body"),
    topicMsg: document.getElementById("topic-msg"),
    listView: document.getElementById("forum-list-view"),
    list: document.getElementById("forum-list"),
    detailView: document.getElementById("forum-detail-view"),
    backBtn: document.getElementById("forum-back-btn"),
    detailPosts: document.getElementById("forum-detail-posts"),
    replyForm: document.getElementById("forum-reply-form"),
    replyBody: document.getElementById("reply-body"),
    replyMsg: document.getElementById("reply-msg"),
    userAvatar: document.getElementById("forum-user-avatar"),
    userName: document.getElementById("forum-user-name"),
    userSub: document.getElementById("forum-user-sub"),
    counts: {
      all: document.getElementById("fc-all"),
      news: document.getElementById("fc-news"),
      configs: document.getElementById("fc-configs"),
      guides: document.getElementById("fc-guides"),
      private: document.getElementById("fc-private")
    }
  };

  if (!els.list) return;

  function syncSidebarUser() {
    let login = "";
    let hasSession = false;
    try {
      login = (localStorage.getItem("enhance_login") || "").trim();
      hasSession = Boolean((localStorage.getItem("enhance_token") || "").trim() && login);
    } catch {
      login = "";
    }

    const displayName = hasSession ? login : "Гость";
    if (els.userName) els.userName.textContent = displayName;
    if (els.userAvatar) els.userAvatar.textContent = displayName.slice(0, 1).toUpperCase() || "Г";
    if (els.userSub) {
      els.userSub.textContent = hasSession ? "авторизован · предпросмотр" : "гость · локальный черновик";
    }
  }

  function showFormMsg(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg " + (isError ? "form-msg-err" : "form-msg-ok");
    el.classList.remove("is-hidden");
  }

  function hideFormMsg(el) {
    if (!el) return;
    el.textContent = "";
    el.classList.add("is-hidden");
  }

  function updateCounts() {
    const byCat = { all: state.threads.length, news: 0, configs: 0, guides: 0, private: 0 };
    for (const thread of state.threads) {
      if (Object.prototype.hasOwnProperty.call(byCat, thread.category)) {
        byCat[thread.category] += 1;
      }
    }
    for (const [key, node] of Object.entries(els.counts)) {
      if (node) node.textContent = String(byCat[key] || 0);
    }
  }

  function createTagNode(category) {
    const meta = CATEGORY_META[category] || CATEGORY_META.all;
    const span = document.createElement("span");
    span.className = "forum-tag" + (category === "private" ? " forum-tag-private" : "");
    span.textContent = meta.tag;
    return span;
  }

  function renderThreadList() {
    updateCounts();

    const query = state.search.trim().toLowerCase();
    const filtered = state.threads
      .filter((t) => state.category === "all" || t.category === state.category)
      .filter((t) => {
        if (!query) return true;
        return (
          t.title.toLowerCase().includes(query) ||
          t.body.toLowerCase().includes(query) ||
          t.author.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

    els.list.textContent = "";

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "forum-post";
      const p = document.createElement("p");
      p.className = "forum-post-body";
      p.textContent = "В этом разделе пока нет тем по вашему запросу.";
      empty.appendChild(p);
      els.list.appendChild(empty);
      return;
    }

    for (const thread of filtered) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "forum-row";
      row.addEventListener("click", () => openThread(thread.id));

      const main = document.createElement("div");
      main.className = "forum-row-main";

      const title = document.createElement("span");
      title.className = "forum-row-title";
      title.textContent = thread.title;

      const meta = document.createElement("div");
      meta.className = "forum-row-meta";
      meta.appendChild(createTagNode(thread.category));

      if (thread.pinned) {
        const pin = document.createElement("span");
        pin.className = "forum-tag";
        pin.textContent = "Закреплено";
        meta.appendChild(pin);
      }

      const info = document.createElement("span");
      info.textContent = `${thread.author} · ${thread.createdAt}`;
      meta.appendChild(info);

      main.appendChild(title);
      main.appendChild(meta);

      const stats = document.createElement("div");
      stats.className = "forum-row-stats";
      const repliesCount = Array.isArray(thread.posts) ? thread.posts.length : 0;
      stats.textContent = `Ответов: ${repliesCount}`;

      row.appendChild(main);
      row.appendChild(stats);
      els.list.appendChild(row);
    }
  }

  function renderPostCard(author, createdAt, body, tagCategory, titleText) {
    const card = document.createElement("article");
    card.className = "forum-post";

    const head = document.createElement("div");
    head.className = "forum-post-head";

    const left = document.createElement("div");
    left.className = "forum-row-meta";
    if (tagCategory) {
      left.appendChild(createTagNode(tagCategory));
    }
    const authorSpan = document.createElement("span");
    authorSpan.textContent = author;
    left.appendChild(authorSpan);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = createdAt;

    head.appendChild(left);
    head.appendChild(dateSpan);
    card.appendChild(head);

    if (titleText) {
      const h = document.createElement("div");
      h.className = "forum-row-title";
      h.textContent = titleText;
      card.appendChild(h);
    }

    const p = document.createElement("p");
    p.className = "forum-post-body";
    p.textContent = body;
    card.appendChild(p);

    return card;
  }

  function openThread(threadId) {
    const thread = state.threads.find((t) => t.id === threadId);
    if (!thread) return;

    state.activeThreadId = threadId;
    if (els.composer) els.composer.classList.add("is-hidden");
    if (els.listView) els.listView.classList.add("is-hidden");
    if (els.detailView) els.detailView.classList.remove("is-hidden");
    if (els.title) els.title.textContent = thread.title;

    els.detailPosts.textContent = "";
    els.detailPosts.appendChild(
      renderPostCard(thread.author, thread.createdAt, thread.body, thread.category, thread.title)
    );

    const replies = Array.isArray(thread.posts) ? thread.posts : [];
    for (const reply of replies) {
      els.detailPosts.appendChild(renderPostCard(reply.author, reply.createdAt, reply.body, null, null));
    }

    hideFormMsg(els.replyMsg);
  }

  function showListView() {
    state.activeThreadId = null;
    if (els.detailView) els.detailView.classList.add("is-hidden");
    if (els.listView) els.listView.classList.remove("is-hidden");
    const meta = CATEGORY_META[state.category] || CATEGORY_META.all;
    if (els.title) els.title.textContent = meta.title;
    renderThreadList();
  }

  function selectCategory(cat) {
    state.category = Object.prototype.hasOwnProperty.call(CATEGORY_META, cat) ? cat : "all";
    for (const btn of els.catButtons) {
      btn.classList.toggle("active", btn.getAttribute("data-forum-cat") === state.category);
    }
    if (els.topicCat && state.category !== "all") {
      els.topicCat.value = state.category;
    }
    showListView();
  }

  for (const btn of els.catButtons) {
    btn.addEventListener("click", () => {
      selectCategory(btn.getAttribute("data-forum-cat") || "all");
    });
  }

  if (els.search) {
    els.search.addEventListener("input", () => {
      state.search = els.search.value || "";
      if (state.activeThreadId) {
        showListView();
      } else {
        renderThreadList();
      }
    });
  }

  if (els.newBtn) {
    els.newBtn.addEventListener("click", () => {
      if (state.activeThreadId) {
        showListView();
      }
      if (els.composer) {
        const willOpen = els.composer.classList.contains("is-hidden");
        els.composer.classList.toggle("is-hidden", !willOpen);
        hideFormMsg(els.topicMsg);
        if (willOpen && els.topicCat && state.category !== "all") {
          els.topicCat.value = state.category;
        }
        if (willOpen && els.topicTitle) {
          els.topicTitle.focus();
        }
      }
    });
  }

  if (els.composerClose) {
    els.composerClose.addEventListener("click", () => {
      if (els.composer) els.composer.classList.add("is-hidden");
      hideFormMsg(els.topicMsg);
    });
  }

  if (els.topicForm) {
    els.topicForm.addEventListener("submit", (e) => {
      e.preventDefault();
      hideFormMsg(els.topicMsg);

      const category = (els.topicCat ? els.topicCat.value : "configs") || "configs";
      const title = (els.topicTitle ? els.topicTitle.value : "").trim();
      const body = (els.topicBody ? els.topicBody.value : "").trim();

      if (title.length < 3) {
        showFormMsg(els.topicMsg, "Введите заголовок (от 3 символов).", true);
        return;
      }
      if (body.length < 5) {
        showFormMsg(els.topicMsg, "Введите текст сообщения (от 5 символов).", true);
        return;
      }

      const newThread = {
        id: "t-" + Date.now(),
        category: Object.prototype.hasOwnProperty.call(CATEGORY_META, category) ? category : "configs",
        title,
        author: currentUserName(),
        createdAt: formatToday(),
        pinned: false,
        body,
        posts: []
      };

      state.threads.unshift(newThread);
      saveThreads(state.threads);
      els.topicForm.reset();
      if (els.composer) els.composer.classList.add("is-hidden");
      selectCategory(newThread.category);
      openThread(newThread.id);
    });
  }

  if (els.backBtn) {
    els.backBtn.addEventListener("click", showListView);
  }

  if (els.replyForm) {
    els.replyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      hideFormMsg(els.replyMsg);

      const thread = state.threads.find((t) => t.id === state.activeThreadId);
      if (!thread) return;

      const body = (els.replyBody ? els.replyBody.value : "").trim();
      if (body.length < 2) {
        showFormMsg(els.replyMsg, "Введите текст ответа.", true);
        return;
      }

      if (!Array.isArray(thread.posts)) thread.posts = [];
      thread.posts.push({
        author: currentUserName(),
        createdAt: formatToday(),
        body
      });
      saveThreads(state.threads);
      if (els.replyBody) els.replyBody.value = "";
      openThread(thread.id);
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialCategory = (params.get("category") || "all").toLowerCase();

  syncSidebarUser();
  selectCategory(initialCategory);
})();
