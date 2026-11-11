(() => {
  "use strict";

  const TOKEN_KEY = "enhance_token";
  const LOGIN_KEY = "enhance_login";
  const GUI_STORE_KEY = "shell_gui_state_v1";

  const PLAN_LABELS = {
    "7d": "7 дней",
    "30d": "1 месяц (600 ₽)",
    "90d": "3 месяца (1 500 ₽)",
    "lifetime": "Private / Навсегда"
  };

  const PAY_LABELS = {
    sbp: "СБП",
    card_ru: "Карта RU",
    card_eu: "Карта EU",
    funpay: "FunPay",
    yoomoney: "ЮMoney",
    paypal: "PayPal",
    crypto: "Crypto",
    cryptobot: "CryptoBot",
    stars: "Stars",
    erip: "ЕРИП",
    currency: "Валюта",
    balance: "Баланс"
  };

  const CAB_TITLES = {
    overview: "Обзор",
    keys: "Ключи и тарифы",
    loader: "Лоадер и запуск",
    configs: "Веб-конфиги",
    security: "Безопасность и HWID"
  };

  const BUILTIN_CFG_LIST = [
    { name: "FunTime_Polar", meta: "Polar · FunTime", builtIn: true },
    { name: "HolyWorld_HolyAC", meta: "HolyAC · HolyWorld", builtIn: true },
    { name: "Grim_Legit", meta: "GrimAC 2.3 · Vanilla", builtIn: true }
  ];

  const els = {
    navLoginLink: document.getElementById("nav-login-link"),
    navAccountBtn: document.getElementById("nav-account-btn"),
    authView: document.getElementById("auth-view"),
    dashView: document.getElementById("dash-view"),
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    planBanner: document.getElementById("plan-banner"),
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    loginMsg: document.getElementById("login-msg"),
    registerMsg: document.getElementById("register-msg"),
    loginSubmit: document.getElementById("login-submit"),
    registerSubmit: document.getElementById("register-submit"),
    loginUser: document.getElementById("login-username"),
    loginPass: document.getElementById("login-password"),
    regUser: document.getElementById("reg-username"),
    regPass: document.getElementById("reg-password"),
    regPass2: document.getElementById("reg-password2"),
    cabAvatar: document.getElementById("cab-avatar"),
    dashTitle: document.getElementById("dash-title"),
    cabRoleLine: document.getElementById("cab-role-line"),
    cabActiveTitle: document.getElementById("cab-active-title"),
    dashBadge: document.getElementById("dash-badge"),
    dashBadgeText: document.getElementById("dash-badge-text"),
    logoutBtn: document.getElementById("logout-btn"),
    mSubState: document.getElementById("m-sub-state"),
    mHwidState: document.getElementById("m-hwid-state"),
    uSessions: document.getElementById("u-sessions"),
    uSubExpires: document.getElementById("u-sub-expires"),
    uSubDesc: document.getElementById("u-sub-desc"),
    cabSubFill: document.getElementById("cab-sub-fill"),
    cabSubLeft: document.getElementById("cab-sub-left"),
    uLogin: document.getElementById("u-login"),
    uId: document.getElementById("u-id"),
    uRoles: document.getElementById("u-roles"),
    uCreated: document.getElementById("u-created"),
    uLastSeen: document.getElementById("u-lastseen"),
    uHwidShort: document.getElementById("u-hwid-short"),
    uHwidBadge: document.getElementById("u-hwid-badge"),
    uHwid: document.getElementById("u-hwid"),
    hwidMsg: document.getElementById("hwid-msg"),
    resetHwidBtn: document.getElementById("reset-hwid-btn"),
    redeemForm: document.getElementById("redeem-form"),
    keyInput: document.getElementById("key-input"),
    redeemSubmit: document.getElementById("redeem-submit"),
    redeemMsg: document.getElementById("redeem-msg"),
    redeemHint: document.getElementById("redeem-hint"),
    redeemFormTab: document.getElementById("redeem-form-tab"),
    keyInputTab: document.getElementById("key-input-tab"),
    redeemSubmitTab: document.getElementById("redeem-submit-tab"),
    redeemMsgTab: document.getElementById("redeem-msg-tab"),
    eventsCount: document.getElementById("cab-events-count"),
    eventsList: document.getElementById("cab-events-list"),
    loaderStatusBadge: document.getElementById("loader-status-badge"),
    loaderMsg: document.getElementById("loader-msg"),
    downloadLoaderBtn: document.getElementById("download-loader-btn"),
    copyCmdBtn: document.getElementById("copy-cmd-btn"),
    cmdPreview: document.getElementById("cab-cmd-preview"),
    cfgForm: document.getElementById("cab-import-form"),
    cfgNameInput: document.getElementById("cab-cfg-name"),
    cfgMsg: document.getElementById("cab-cfg-msg"),
    exportCfgBtn: document.getElementById("export-cfg-btn"),
    cfgCount: document.getElementById("cab-cfg-count"),
    cfgList: document.getElementById("cab-cfg-list"),
    passForm: document.getElementById("password-form"),
    curPassInput: document.getElementById("cur-password"),
    newPassInput: document.getElementById("new-password"),
    passSubmit: document.getElementById("pass-submit"),
    passMsg: document.getElementById("pass-msg"),
    sessionsCount: document.getElementById("cab-sessions-count"),
    sessionsList: document.getElementById("cab-sessions-list")
  };

  let activeCabTab = "overview";
  let lastLoaderAvailable = false;

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function applyHeaderState(login) {
    if (login) {
      if (els.navLoginLink) els.navLoginLink.classList.add("is-hidden");
      if (els.navAccountBtn) {
        els.navAccountBtn.textContent = login;
        els.navAccountBtn.href = "account.html";
      }
    } else {
      if (els.navLoginLink) els.navLoginLink.classList.remove("is-hidden");
      if (els.navAccountBtn) {
        els.navAccountBtn.textContent = "Регистрация →";
        els.navAccountBtn.href = "account.html?mode=register";
      }
    }
  }

  function saveAuth(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user?.login) {
      localStorage.setItem(LOGIN_KEY, user.login);
      applyHeaderState(user.login);
    }
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_KEY);
    applyHeaderState("");
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.className = "form-msg";
    if (!text) {
      el.classList.add("is-hidden");
      el.textContent = "";
      return;
    }
    if (type === "ok") el.classList.add("form-msg-ok");
    if (type === "err") el.classList.add("form-msg-err");
    el.textContent = text;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function isLifetime(user) {
    if (!user?.subscriptionActive || !user?.subscriptionExpiresAt) return false;
    return new Date(user.subscriptionExpiresAt).getTime() - Date.now() > 86400000 * 1800;
  }

  function formatExpiry(user) {
    if (!user?.subscriptionActive || !user?.subscriptionExpiresAt) return "Нет подписки";
    if (isLifetime(user)) return "Навсегда (Lifetime)";
    return formatDate(user.subscriptionExpiresAt);
  }

  function formatRemaining(user) {
    if (!user?.subscriptionActive || !user?.subscriptionExpiresAt) return { text: "0 дн.", pct: 0 };
    if (isLifetime(user)) return { text: "Бессрочно", pct: 100 };
    const msLeft = Math.max(0, new Date(user.subscriptionExpiresAt).getTime() - Date.now());
    const days = Math.floor(msLeft / 86400000);
    const hours = Math.floor((msLeft % 86400000) / 3600000);
    const pct = Math.max(6, Math.min(100, Math.round((days / 30) * 100)));
    return { text: `${days} дн. ${hours} ч.`, pct };
  }

  function switchAuthTab(mode) {
    const isReg = mode === "register";
    els.tabLogin.classList.toggle("active", !isReg);
    els.tabRegister.classList.toggle("active", isReg);
    els.tabLogin.setAttribute("aria-selected", String(!isReg));
    els.tabRegister.setAttribute("aria-selected", String(isReg));
    els.loginForm.classList.toggle("is-hidden", isReg);
    els.registerForm.classList.toggle("is-hidden", !isReg);
    showMessage(els.loginMsg, "", "");
    showMessage(els.registerMsg, "", "");
  }

  function switchCabTab(tab) {
    activeCabTab = CAB_TITLES[tab] ? tab : "overview";
    document.querySelectorAll("[data-cab-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-cab-tab") === activeCabTab);
    });
    for (const key of Object.keys(CAB_TITLES)) {
      const panel = document.getElementById(`cab-panel-${key}`);
      if (panel) panel.classList.toggle("is-hidden", key !== activeCabTab);
    }
    if (els.cabActiveTitle) els.cabActiveTitle.textContent = CAB_TITLES[activeCabTab];
    if (activeCabTab === "configs") renderConfigsList();
  }

  function formatAuditAction(ev) {
    if (ev.action === "user.create") return "Регистрация аккаунта";
    if (ev.action === "subscription.extend") return `Продление подписки (+${ev.details?.days || "?"} дн.)`;
    if (ev.action === "user.reset_hwid") return "Сброс привязки HWID";
    if (ev.action === "user.bind_hwid") return "Привязка нового ПК (HWID)";
    if (ev.action === "user.password") return "Смена пароля аккаунта";
    if (ev.action === "subscription.revoke") return "Подписка отозвана";
    return ev.action;
  }

  function renderEvents(events) {
    if (!els.eventsList || !els.eventsCount) return;
    const list = Array.isArray(events) ? events : [];
    els.eventsCount.textContent = String(list.length);
    els.eventsList.textContent = "";

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cab-event-row";
      empty.textContent = "Операций пока нет.";
      els.eventsList.appendChild(empty);
      return;
    }

    for (const ev of list) {
      const row = document.createElement("div");
      row.className = "cab-event-row";
      const title = document.createElement("span");
      title.className = "cab-event-title";
      title.textContent = formatAuditAction(ev);
      const time = document.createElement("span");
      time.className = "cab-event-time";
      time.textContent = formatDate(ev.createdAt);
      row.appendChild(title);
      row.appendChild(time);
      els.eventsList.appendChild(row);
    }
  }

  function renderSessions(sessions) {
    if (!els.sessionsList || !els.sessionsCount) return;
    const list = Array.isArray(sessions) ? sessions : [];
    els.sessionsCount.textContent = String(list.length);
    els.sessionsList.textContent = "";

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cab-event-row";
      empty.textContent = "Активных игровых сессий сейчас нет.";
      els.sessionsList.appendChild(empty);
      return;
    }

    for (const s of list) {
      const row = document.createElement("div");
      row.className = "cab-event-row";
      const title = document.createElement("span");
      title.className = "cab-event-title mono";
      title.textContent = `${s.game || "Minecraft"} · ${s.clientVersion || "1.21.10"} · ${s.status || "online"}`;
      const time = document.createElement("span");
      time.className = "cab-event-time";
      time.textContent = formatDate(s.lastSeenAt);
      row.appendChild(title);
      row.appendChild(time);
      els.sessionsList.appendChild(row);
    }
  }

  function loadGuiStoreSafe() {
    try {
      const raw = localStorage.getItem(GUI_STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function renderConfigsList() {
    if (!els.cfgList || !els.cfgCount) return;
    const state = loadGuiStoreSafe();
    const custom = Array.isArray(state?.customConfigs) ? state.customConfigs : [];
    const total = custom.length + BUILTIN_CFG_LIST.length;
    els.cfgCount.textContent = String(total);
    els.cfgList.textContent = "";

    for (const cfg of custom) {
      const row = document.createElement("div");
      row.className = "cab-event-row";
      const left = document.createElement("span");
      left.className = "cab-event-title";
      left.textContent = `${cfg.name} (Пользовательский)`;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-sm btn-ghost btn-rect";
      del.textContent = "Удалить";
      del.addEventListener("click", () => {
        const cur = loadGuiStoreSafe();
        if (!cur || !Array.isArray(cur.customConfigs)) return;
        cur.customConfigs = cur.customConfigs.filter((c) => c.id !== cfg.id);
        localStorage.setItem(GUI_STORE_KEY, JSON.stringify(cur));
        renderConfigsList();
      });
      row.appendChild(left);
      row.appendChild(del);
      els.cfgList.appendChild(row);
    }

    for (const b of BUILTIN_CFG_LIST) {
      const row = document.createElement("div");
      row.className = "cab-event-row";
      const left = document.createElement("span");
      left.className = "cab-event-title";
      left.textContent = b.name;
      const right = document.createElement("span");
      right.className = "cab-event-time";
      right.textContent = b.meta;
      row.appendChild(left);
      row.appendChild(right);
      els.cfgList.appendChild(row);
    }
  }

  function renderPayload(data) {
    const user = data.user;
    if (!user) return;

    els.authView.classList.add("is-hidden");
    els.dashView.classList.remove("is-hidden");
    applyHeaderState(user.login);

    if (els.cabAvatar) els.cabAvatar.textContent = user.login.slice(0, 1).toUpperCase();
    els.dashTitle.textContent = user.login;
    const rolesStr = Array.isArray(user.roles) && user.roles.length ? user.roles.join(", ") : "user";
    if (els.cabRoleLine) els.cabRoleLine.textContent = rolesStr;

    els.uLogin.textContent = user.login;
    if (els.uId) els.uId.textContent = user.id;
    els.uRoles.textContent = rolesStr;
    els.uSessions.textContent = String(user.activeSessionCount ?? 0);
    els.uCreated.textContent = formatDate(user.createdAt);
    els.uLastSeen.textContent = formatDate(user.lastSeenAt);

    const hwidVal = user.hwid || "Не привязан";
    els.uHwid.textContent = hwidVal;
    if (els.uHwidShort) els.uHwidShort.textContent = user.hwid ? `${user.hwid.slice(0, 14)}...` : "Не привязан";
    if (els.uHwidBadge) els.uHwidBadge.textContent = user.hwid ? "Привязан" : "Свободен";
    if (els.mHwidState) els.mHwidState.textContent = user.hwid ? "Привязан" : "Не привязан";

    const rem = formatRemaining(user);
    const expText = formatExpiry(user);
    els.uSubExpires.textContent = expText;
    if (els.cabSubFill) els.cabSubFill.style.width = `${rem.pct}%`;
    if (els.cabSubLeft) els.cabSubLeft.textContent = rem.text;

    els.dashBadge.classList.remove("status-ok", "status-warn");
    if (user.subscriptionActive) {
      els.dashBadge.classList.add("status-ok");
      els.dashBadgeText.textContent = isLifetime(user) ? "Навсегда" : "Подписка активна";
      if (els.mSubState) els.mSubState.textContent = isLifetime(user) ? "Lifetime" : "Активна";
    } else {
      els.dashBadge.classList.add("status-warn");
      els.dashBadgeText.textContent = "Нет подписки";
      if (els.mSubState) els.mSubState.textContent = "Не активна";
    }

    if (typeof data.loaderAvailable === "boolean") {
      lastLoaderAvailable = data.loaderAvailable;
    }
    if (els.loaderStatusBadge) {
      els.loaderStatusBadge.textContent = lastLoaderAvailable ? "Готов к загрузке" : "Сборка на ПК";
    }

    renderEvents(data.events);
    renderSessions(data.sessions);
    renderConfigsList();
  }

  function renderAuthScreen() {
    els.dashView.classList.add("is-hidden");
    els.authView.classList.remove("is-hidden");
  }

  async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (options.body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const err = new Error(data.error || `Ошибка сервера (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function refreshMe() {
    const data = await apiRequest("/api/web/me");
    if (data?.user) {
      saveAuth(getToken(), data.user);
      renderPayload(data);
    }
    return data;
  }

  async function handleRedeemSubmit(inputEl, btnEl, msgEl) {
    showMessage(msgEl, "", "");
    const key = inputEl.value.trim();
    if (!key) return;
    btnEl.disabled = true;
    try {
      const data = await apiRequest("/api/web/redeem", {
        method: "POST",
        body: JSON.stringify({ key })
      });
      inputEl.value = "";
      renderPayload(data);
      const addedText = data.days >= 3650 ? "Lifetime-доступ активирован." : `Подписка продлена на ${data.days} дн.`;
      showMessage(msgEl, addedText, "ok");
    } catch (err) {
      showMessage(msgEl, err.message, "err");
    } finally {
      btnEl.disabled = false;
    }
  }

  async function bootstrap() {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const pay = params.get("pay");
    const mode = params.get("mode");
    const tab = params.get("tab");

    if (mode === "register") switchAuthTab("register");
    if (tab && CAB_TITLES[tab]) switchCabTab(tab);

    if (plan && PLAN_LABELS[plan]) {
      const payText = pay && PAY_LABELS[pay] ? ` · ${PAY_LABELS[pay]}` : "";
      showMessage(
        els.planBanner,
        `Выбран тариф Shell: ${PLAN_LABELS[plan]}${payText}. Войдите или зарегистрируйтесь для активации.`,
        ""
      );
      if (els.redeemHint) {
        els.redeemHint.textContent = `Тариф: ${PLAN_LABELS[plan]}${payText}. Введите ключ для активации подписки.`;
      }
      const prefixMap = { "7d": "SHELL-7D-", "30d": "SHELL-30D-", "90d": "SHELL-90D-", lifetime: "SHELL-LIFE-" };
      const ph = `${prefixMap[plan] || "SHELL-30D-"}XXXX`;
      if (els.keyInput) els.keyInput.placeholder = ph;
      if (els.keyInputTab) els.keyInputTab.placeholder = ph;
    }

    const token = getToken();
    if (!token) {
      renderAuthScreen();
      return;
    }

    try {
      await refreshMe();
    } catch (err) {
      if (err.status === 401) clearAuth();
      renderAuthScreen();
    }
  }

  // Password eye toggles
  document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.getAttribute("data-toggle-pass"));
      if (target) target.type = target.type === "password" ? "text" : "password";
    });
  });

  // Auth tabs & forms
  els.tabLogin.addEventListener("click", () => switchAuthTab("login"));
  els.tabRegister.addEventListener("click", () => switchAuthTab("register"));

  els.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(els.loginMsg, "", "");
    const login = els.loginUser.value.trim();
    const password = els.loginPass.value;

    els.loginSubmit.disabled = true;
    try {
      const data = await apiRequest("/api/web/login", {
        method: "POST",
        body: JSON.stringify({ login, password })
      });
      saveAuth(data.token, data.user);
      els.loginPass.value = "";
      await refreshMe();
    } catch (err) {
      showMessage(els.loginMsg, err.message, "err");
    } finally {
      els.loginSubmit.disabled = false;
    }
  });

  els.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(els.registerMsg, "", "");
    const login = els.regUser.value.trim();
    const password = els.regPass.value;
    const passwordConfirm = els.regPass2.value;

    if (password !== passwordConfirm) {
      showMessage(els.registerMsg, "Пароли не совпадают", "err");
      return;
    }

    els.registerSubmit.disabled = true;
    try {
      const data = await apiRequest("/api/web/register", {
        method: "POST",
        body: JSON.stringify({ login, password })
      });
      saveAuth(data.token, data.user);
      els.regPass.value = "";
      els.regPass2.value = "";
      await refreshMe();
    } catch (err) {
      showMessage(els.registerMsg, err.message, "err");
    } finally {
      els.registerSubmit.disabled = false;
    }
  });

  // Cabinet navigation
  document.querySelectorAll("[data-cab-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchCabTab(btn.getAttribute("data-cab-tab")));
  });

  document.querySelectorAll("[data-cab-goto]").forEach((btn) => {
    btn.addEventListener("click", () => switchCabTab(btn.getAttribute("data-cab-goto")));
  });

  els.logoutBtn.addEventListener("click", async () => {
    els.logoutBtn.disabled = true;
    try {
      await apiRequest("/api/web/logout", { method: "POST" });
    } catch {
      // ignore offline
    } finally {
      clearAuth();
      els.logoutBtn.disabled = false;
      renderAuthScreen();
    }
  });

  els.resetHwidBtn.addEventListener("click", async () => {
    showMessage(els.hwidMsg, "", "");
    els.resetHwidBtn.disabled = true;
    try {
      const data = await apiRequest("/api/web/reset-hwid", { method: "POST" });
      renderPayload(data);
      showMessage(els.hwidMsg, "Привязка HWID сброшена. Следующий запуск привяжет новый ПК.", "ok");
    } catch (err) {
      showMessage(els.hwidMsg, err.message, "err");
    } finally {
      els.resetHwidBtn.disabled = false;
    }
  });

  if (els.redeemForm) {
    els.redeemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleRedeemSubmit(els.keyInput, els.redeemSubmit, els.redeemMsg);
    });
  }

  if (els.redeemFormTab) {
    els.redeemFormTab.addEventListener("submit", (e) => {
      e.preventDefault();
      handleRedeemSubmit(els.keyInputTab, els.redeemSubmitTab, els.redeemMsgTab);
    });
  }

  if (els.passForm) {
    els.passForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMessage(els.passMsg, "", "");
      els.passSubmit.disabled = true;
      try {
        const data = await apiRequest("/api/web/change-password", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: els.curPassInput.value,
            newPassword: els.newPassInput.value
          })
        });
        els.curPassInput.value = "";
        els.newPassInput.value = "";
        renderPayload(data);
        showMessage(els.passMsg, "Пароль успешно обновлён.", "ok");
      } catch (err) {
        showMessage(els.passMsg, err.message, "err");
      } finally {
        els.passSubmit.disabled = false;
      }
    });
  }

  if (els.downloadLoaderBtn) {
    els.downloadLoaderBtn.addEventListener("click", async () => {
      showMessage(els.loaderMsg, "", "");
      els.downloadLoaderBtn.disabled = true;
      try {
        const res = await fetch("/api/web/download-loader", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) {
          let errJson = {};
          try { errJson = await res.json(); } catch { errJson = {}; }
          throw new Error(errJson.error || `Ошибка загрузки (${res.status})`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "terminal.exe";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showMessage(els.loaderMsg, "Лоадер terminal.exe загружен.", "ok");
      } catch (err) {
        showMessage(els.loaderMsg, err.message, "err");
      } finally {
        els.downloadLoaderBtn.disabled = false;
      }
    });
  }

  if (els.copyCmdBtn && els.cmdPreview) {
    els.copyCmdBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(els.cmdPreview.textContent);
        els.copyCmdBtn.textContent = "Скопировано";
        setTimeout(() => { els.copyCmdBtn.textContent = "Копировать"; }, 1400);
      } catch {
        // ignore clipboard unavailability
      }
    });
  }

  if (els.cfgForm) {
    els.cfgForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showMessage(els.cfgMsg, "", "");
      const title = els.cfgNameInput.value.trim();
      if (!title) return;
      const cur = loadGuiStoreSafe() || { modules: {}, customConfigs: [] };
      cur.customConfigs = Array.isArray(cur.customConfigs) ? cur.customConfigs : [];
      cur.customConfigs.unshift({
        id: `custom_${Date.now()}`,
        name: title,
        note: "Сохранён из кабинета",
        snapshot: cur.modules ? JSON.parse(JSON.stringify(cur.modules)) : null
      });
      localStorage.setItem(GUI_STORE_KEY, JSON.stringify(cur));
      els.cfgNameInput.value = "";
      renderConfigsList();
      showMessage(els.cfgMsg, `Профиль «${title}» сохранён для ClickGUI.`, "ok");
    });
  }

  if (els.exportCfgBtn) {
    els.exportCfgBtn.addEventListener("click", () => {
      const state = loadGuiStoreSafe() || { exportedAt: new Date().toISOString(), modules: {} };
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shell-config.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  bootstrap();
})();
