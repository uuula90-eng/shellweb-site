(() => {
  "use strict";

  const USER_NAME = "user";
  const HOST_NAME = "desktop";
  const DLL_PATH = "C:\\shell\\x64\\Release\\shell.dll";
  const GAME_PID = "14820";
  const GAME_EXE = "javaw.exe";

  // =========================================================================
  // Auth / Topbar Header Sync
  // =========================================================================
  const navLoginLink = document.getElementById("nav-login-link");
  const navAccountBtn = document.getElementById("nav-account-btn");
  const studioUserName = document.getElementById("studio-user-name");
  const studioUserAvatar = document.getElementById("studio-user-avatar");

  function applyAuthUi(login) {
    if (login) {
      if (navLoginLink) navLoginLink.classList.add("is-hidden");
      if (navAccountBtn) {
        navAccountBtn.textContent = login;
        navAccountBtn.href = "account.html";
      }
      if (studioUserName) studioUserName.textContent = login;
      if (studioUserAvatar) studioUserAvatar.textContent = login.slice(0, 1).toUpperCase();
    } else {
      if (navLoginLink) navLoginLink.classList.remove("is-hidden");
      if (navAccountBtn) {
        navAccountBtn.textContent = "Регистрация →";
        navAccountBtn.href = "account.html?mode=register";
      }
      if (studioUserName) studioUserName.textContent = "ShellPlayer";
      if (studioUserAvatar) studioUserAvatar.textContent = "S";
    }
  }

  async function syncNavAccount() {
    const token = localStorage.getItem("enhance_token");
    const cachedLogin = localStorage.getItem("enhance_login");
    if (token && cachedLogin) applyAuthUi(cachedLogin);
    if (!token) return;
    try {
      const res = await fetch("/api/web/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.login) {
          localStorage.setItem("enhance_login", data.user.login);
          applyAuthUi(data.user.login);
        }
      } else if (res.status === 401) {
        localStorage.removeItem("enhance_token");
        localStorage.removeItem("enhance_login");
        applyAuthUi("");
      }
    } catch {
      // ignore offline
    }
  }

  syncNavAccount();

  // =========================================================================
  // Interactive ClickGUI Studio (#gs-shell)
  // =========================================================================
  const gsShell = document.getElementById("gs-shell");
  if (gsShell) {
    const GUI_STORE_KEY = "shell_gui_state_v1";
    const ACCENT_HEX = {
      mono: "#E4E4E7",
      red: "#D65E5E",
      orange: "#D97E42",
      amber: "#D4A64A",
      green: "#5FAE78",
      blue: "#3D6BE6",
      violet: "#7357DB"
    };

    const MODULE_DEFS = [
      {
        id: "notifications",
        name: "Notifications",
        category: "Client",
        icon: "⚡",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "None",
        controls: [
          {
            key: "sounds",
            type: "multi",
            label: "Звуки",
            hint: "Настройте звуковые отклики интерфейса",
            options: ["Открытие GUI", "Включение модуля", "Выключение модуля", "Сохранение конфига", "Друзья", "Таргет", "Ошибки"],
            defaultValue: ["Открытие GUI", "Включение модуля", "Сохранение конфига"]
          },
          { key: "volume", type: "slider", label: "Громкость", hint: "Общая громкость звуков интерфейса", min: 0, max: 100, step: 1, unit: "%", defaultValue: 25 },
          { key: "position", type: "segmented", label: "Положение", hint: "Где в окне появляются уведомления", options: ["Сверху", "Снизу"], defaultValue: "Снизу" },
          { key: "duration", type: "slider", label: "Длительность", hint: "Сколько уведомление держится на экране", min: 1, max: 8, step: 1, unit: " с", defaultValue: 3 },
          { key: "accent", type: "swatches", label: "Цвет обводки", hint: "Выберите акцентный цвет элементов", defaultValue: "mono" }
        ]
      },
      {
        id: "preview",
        name: "Preview",
        category: "Client",
        icon: "⊞",
        defaultEnabled: true,
        defaultFav: true,
        defaultBind: "None",
        controls: [
          { key: "density", type: "select", label: "Раскладка", hint: "Плотность карточек в предпросмотре", options: ["Компактная", "Просторная"], defaultValue: "Просторная" },
          { key: "glassMode", type: "segmented", label: "Режим отображения", hint: "Стиль рендера панелей GUI", options: ["Обычный", "Прозрачный"], defaultValue: "Обычный" },
          { key: "themeTone", type: "select", label: "Тон подложки", hint: "Оттенок основного окна клиента", options: ["Графит", "Обсидиан"], defaultValue: "Графит" },
          {
            key: "applyTargets",
            type: "multi",
            label: "Где применять акцент",
            hint: "Элементы, использующие акцентный цвет",
            options: ["Переключатели", "Слайдеры", "Иконки", "Уведомления"],
            defaultValue: ["Переключатели", "Слайдеры", "Иконки", "Уведомления"]
          },
          { key: "intensity", type: "slider", label: "Интенсивность", hint: "Степень выраженности эффектов", min: 1, max: 12, step: 0.1, decimals: 1, unit: "", defaultValue: 8.8 },
          { key: "refraction", type: "slider", label: "Рефракция", hint: "Сила преломления под панелью", min: 0, max: 1, step: 0.05, decimals: 2, unit: "", defaultValue: 0.4 }
        ]
      },
      {
        id: "interface",
        name: "Interface",
        category: "Client",
        icon: "◈",
        defaultEnabled: true,
        defaultFav: true,
        defaultBind: "RSHIFT",
        controls: [
          { key: "animations", type: "select", label: "Анимации", hint: "Как двигаются панели и элементы", options: ["Плавные", "Быстрые", "Отключены"], defaultValue: "Плавные" },
          { key: "blurBg", type: "checkbox", label: "Размытие фона", hint: "Размывать фон за активными карточками", defaultValue: false },
          { key: "openKey", type: "keybind", label: "Открытие GUI", hint: "Клавиша для открытия этого меню", defaultValue: "RSHIFT" },
          { key: "resetLayout", type: "action", label: "Окна", hint: "Вернуть стандартное состояние панелей", actionLabel: "Сбросить раскладку" },
          { key: "accent", type: "swatches", label: "Акцентный цвет", hint: "Цвет выделений во всём интерфейсе", defaultValue: "mono" }
        ]
      },
      {
        id: "elements",
        name: "Elements",
        category: "Client",
        icon: "☰",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "None",
        controls: [
          { key: "hudStyle", type: "select", label: "Стиль", hint: "Визуальный стиль виджетов HUD", options: ["Плоский", "Контурный", "Минимал"], defaultValue: "Плоский" },
          {
            key: "hudList",
            type: "multi",
            label: "Отображение элементов",
            hint: "Активные виджеты поверх игры",
            options: ["Keybinds", "Potions", "Watermark", "Waypoints", "ArmorHUD", "TargetHUD", "Coords", "CPS", "Ping", "BPS"],
            defaultValue: ["Keybinds", "Potions", "Watermark", "Waypoints", "TargetHUD", "Coords", "Ping"]
          },
          { key: "fpsInterval", type: "slider", label: "Интервал FPS HUD", hint: "Частота обновления счётчика кадров", min: 0.5, max: 5, step: 0.5, decimals: 1, unit: " с", defaultValue: 2.0 }
        ]
      },
      {
        id: "aimassist",
        name: "AimAssist",
        category: "Combat",
        icon: "◎",
        defaultEnabled: true,
        defaultFav: true,
        defaultBind: "C",
        controls: [
          { key: "curve", type: "select", label: "Кривая наводки", hint: "Профиль сглаживания ротации", options: ["Bezier Smooth", "Adaptive Polar", "HolyAC Curve", "Linear"], defaultValue: "Bezier Smooth" },
          { key: "speed", type: "slider", label: "Скорость", hint: "Сила доводки по прицелу", min: 1, max: 12, step: 0.5, decimals: 1, unit: "", defaultValue: 6.5 },
          { key: "fov", type: "slider", label: "Сектор FOV", hint: "Угол захвата цели", min: 15, max: 180, step: 1, unit: "°", defaultValue: 78 },
          { key: "weaponOnly", type: "checkbox", label: "Только с оружием", hint: "Не срабатывать без меча или топора", defaultValue: true },
          { key: "ignoreFriends", type: "checkbox", label: "Игнорировать друзей", hint: "Не наводиться на список Friends", defaultValue: true }
        ]
      },
      {
        id: "triggerbot",
        name: "TriggerBot",
        category: "Combat",
        icon: "⚡",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "R",
        controls: [
          { key: "range", type: "slider", label: "Дистанция", hint: "Максимальная дальность атаки", min: 2.5, max: 3.2, step: 0.05, decimals: 2, unit: " м", defaultValue: 3.0 },
          { key: "crits", type: "segmented", label: "Режим критов", hint: "Условие удара по цели", options: ["Только криты", "Всегда"], defaultValue: "Только криты" },
          { key: "shieldBreak", type: "checkbox", label: "Ломать щит", hint: "Авто-смена на топор при блоке", defaultValue: true },
          { key: "jitter", type: "slider", label: "Рандомизация", hint: "Разброс паузы между кликами", min: 0, max: 60, step: 2, unit: " мс", defaultValue: 18 }
        ]
      },
      {
        id: "velocity",
        name: "Velocity",
        category: "Combat",
        icon: "⇄",
        defaultEnabled: false,
        defaultFav: false,
        defaultBind: "None",
        controls: [
          { key: "mode", type: "select", label: "Режим обхода", hint: "Механика снижения откидывания", options: ["Jump Reset", "Packet Cancel", "Simple"], defaultValue: "Jump Reset" },
          { key: "chance", type: "slider", label: "Шанс", hint: "Вероятность срабатывания", min: 0, max: 100, step: 5, unit: "%", defaultValue: 85 },
          { key: "horiz", type: "slider", label: "Горизонталь", hint: "Остаточный импульс по X/Z", min: 0, max: 100, step: 5, unit: "%", defaultValue: 90 }
        ]
      },
      {
        id: "sprint",
        name: "Sprint",
        category: "Movement",
        icon: "»",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "TAB",
        controls: [
          { key: "mode", type: "segmented", label: "Режим бега", hint: "Направление активации спринта", options: ["Легитный", "Omni"], defaultValue: "Легитный" },
          { key: "water", type: "checkbox", label: "Сохранять в воде", hint: "Не сбрасывать спринт на мелководье", defaultValue: true }
        ]
      },
      {
        id: "autototem",
        name: "AutoTotem",
        category: "Player",
        icon: "⛨",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "None",
        controls: [
          { key: "hp", type: "slider", label: "Порог HP", hint: "Здоровье для перекладывания в левую руку", min: 2, max: 20, step: 0.5, decimals: 1, unit: " HP", defaultValue: 8.0 },
          { key: "fallCheck", type: "checkbox", label: "Проверять падение", hint: "Брать тотем до столкновения с землёй", defaultValue: true }
        ]
      },
      {
        id: "playeresp",
        name: "PlayerESP",
        category: "Render",
        icon: "▣",
        defaultEnabled: true,
        defaultFav: true,
        defaultBind: "None",
        controls: [
          { key: "box", type: "select", label: "Тип бокса", hint: "Контур выделения игроков", options: ["2D Углы", "Полный 2D", "Тонкий контур"], defaultValue: "2D Углы" },
          { key: "hpBar", type: "checkbox", label: "Полоса здоровья", hint: "Индикатор HP рядом с боксом", defaultValue: true },
          { key: "armor", type: "checkbox", label: "Броня и чары", hint: "Отображать экипировку над головой", defaultValue: true },
          { key: "dist", type: "slider", label: "Дальность", hint: "Максимальная дистанция прорисовки", min: 16, max: 128, step: 4, unit: " м", defaultValue: 64 }
        ]
      },
      {
        id: "waypoints",
        name: "Waypoints",
        category: "Visual",
        icon: "⌖",
        defaultEnabled: true,
        defaultFav: false,
        defaultBind: "None",
        controls: [
          { key: "markerStyle", type: "select", label: "Вид метки", hint: "Как метки рисуются в мире", options: ["Компактная", "Полная", "Только иконка"], defaultValue: "Компактная" },
          { key: "showDist", type: "checkbox", label: "Дистанция в метрах", hint: "Показывать расстояние до точки", defaultValue: true },
          { key: "throughWalls", type: "checkbox", label: "Видимость сквозь блоки", hint: "Отрисовывать метки поверх геометрии", defaultValue: true }
        ]
      }
    ];

    const PRESET_CONFIGS = [
      { id: "default", name: "Default", note: "Базовая сборка Shell", builtIn: true },
      { id: "funtime_polar", name: "FunTime_Polar", note: "Профиль под Polar (FunTime)", builtIn: true },
      { id: "holyworld_holyac", name: "HolyWorld_HolyAC", note: "Профиль под HolyAC (HolyWorld)", builtIn: true },
      { id: "grim_legit", name: "Grim_Legit", note: "Безопасные ротации для GrimAC 2.3", builtIn: true }
    ];

    function buildInitialState() {
      const modules = {};
      for (const m of MODULE_DEFS) {
        const values = {};
        for (const c of m.controls) {
          if (c.type === "action") continue;
          values[c.key] = Array.isArray(c.defaultValue) ? [...c.defaultValue] : c.defaultValue;
        }
        modules[m.id] = {
          enabled: m.defaultEnabled,
          fav: m.defaultFav,
          bind: m.defaultBind,
          values
        };
      }
      return {
        view: "all",
        search: "",
        favOnly: false,
        sortAlpha: false,
        sidebarCollapsed: false,
        accent: "mono",
        modules,
        friends: ["ShellFriend", "Alex_PvP"],
        waypoints: [
          { name: "Spawn", x: 0, y: 64, z: 0, visible: true },
          { name: "Arena", x: -146, y: 80, z: 812, visible: true }
        ],
        customConfigs: []
      };
    }

    function loadGuiState() {
      const base = buildInitialState();
      try {
        const raw = localStorage.getItem(GUI_STORE_KEY);
        if (!raw) return base;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return base;
        base.view = parsed.view || base.view;
        base.favOnly = Boolean(parsed.favOnly);
        base.sortAlpha = Boolean(parsed.sortAlpha);
        base.accent = ACCENT_HEX[parsed.accent] ? parsed.accent : "mono";
        if (Array.isArray(parsed.friends)) base.friends = parsed.friends;
        if (Array.isArray(parsed.waypoints)) base.waypoints = parsed.waypoints;
        if (Array.isArray(parsed.customConfigs)) base.customConfigs = parsed.customConfigs;
        if (parsed.modules && typeof parsed.modules === "object") {
          for (const m of MODULE_DEFS) {
            const savedMod = parsed.modules[m.id];
            if (!savedMod) continue;
            if (typeof savedMod.enabled === "boolean") base.modules[m.id].enabled = savedMod.enabled;
            if (typeof savedMod.fav === "boolean") base.modules[m.id].fav = savedMod.fav;
            if (typeof savedMod.bind === "string") base.modules[m.id].bind = savedMod.bind;
            if (savedMod.values && typeof savedMod.values === "object") {
              Object.assign(base.modules[m.id].values, savedMod.values);
            }
          }
        }
      } catch {
        return buildInitialState();
      }
      return base;
    }

    let guiState = loadGuiState();
    let openDropdownKey = null;
    let openMultiKey = null;
    let listeningTarget = null; // { modId, ctrlKey? }
    let highlightedModId = null;
    let highlightTimer = null;

    const activeTitleEl = document.getElementById("gs-active-title");
    const allCountEl = document.getElementById("gs-all-count");
    const searchInput = document.getElementById("gs-search-input");
    const toastStack = document.getElementById("gs-toast-stack");
    const navBtns = Array.from(document.querySelectorAll(".gs-nav-btn[data-gs-view]"));
    const btnFav = document.getElementById("gs-btn-fav");
    const btnSort = document.getElementById("gs-btn-sort");
    const btnGlass = document.getElementById("gs-btn-glass");
    const btnCompact = document.getElementById("gs-btn-compact");
    const btnReset = document.getElementById("gs-btn-reset");
    const sidebarToggle = document.getElementById("gs-sidebar-toggle");
    const focusSearchBtn = document.getElementById("gs-focus-search");

    function saveGuiState() {
      try {
        localStorage.setItem(GUI_STORE_KEY, JSON.stringify(guiState));
      } catch {
        // ignore quota
      }
    }

    function pushToast(text) {
      if (!toastStack) return;
      const notifMod = guiState.modules.notifications;
      if (notifMod && !notifMod.enabled) return;

      const durationSec = Number(notifMod?.values?.duration || 3);
      const toast = document.createElement("div");
      toast.className = "gs-toast";

      const dot = document.createElement("span");
      dot.className = "gs-toast-dot";
      const label = document.createElement("span");
      label.textContent = text;

      toast.appendChild(dot);
      toast.appendChild(label);
      toastStack.appendChild(toast);

      while (toastStack.children.length > 3) {
        toastStack.removeChild(toastStack.firstChild);
      }

      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, durationSec * 1000);
    }

    function syncShellAttributes() {
      const notifVals = guiState.modules.notifications.values;
      const previewVals = guiState.modules.preview.values;
      const ifaceVals = guiState.modules.interface.values;

      const isGlass = previewVals.glassMode === "Прозрачный" || Boolean(ifaceVals.blurBg);
      const isCompact = previewVals.density === "Компактная";
      const isTop = notifVals.position === "Сверху";
      const isObsidian = previewVals.themeTone === "Обсидиан";

      gsShell.setAttribute("data-gui-accent", guiState.accent);
      gsShell.setAttribute("data-gui-pos", isTop ? "top" : "bottom");
      gsShell.setAttribute("data-gui-glass", isGlass ? "1" : "0");
      gsShell.setAttribute("data-gui-compact", isCompact ? "1" : "0");
      gsShell.setAttribute("data-gui-surface", isObsidian ? "obsidian" : "default");
      gsShell.classList.toggle("sidebar-collapsed", Boolean(guiState.sidebarCollapsed));

      if (btnFav) {
        btnFav.classList.toggle("active", guiState.favOnly);
      }
      if (btnSort) btnSort.classList.toggle("active", guiState.sortAlpha);
      if (btnGlass) btnGlass.classList.toggle("active", isGlass);
      if (btnCompact) btnCompact.classList.toggle("active", isCompact);
    }

    function svgIcon(kind, size = 13) {
      const ns = "http://www.w3.org/2000/svg";
      const make = (tag, attrs = {}) => {
        const el = typeof document.createElementNS === "function"
          ? document.createElementNS(ns, tag)
          : document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
          el.setAttribute(k, String(v));
        }
        return el;
      };
      const svg = make("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none" });
      if (kind === "star") {
        svg.appendChild(make("path", {
          d: "M8 2L9.8 5.7L13.8 6.3L10.9 9.1L11.6 13.1L8 11.2L4.4 13.1L5.1 9.1L2.2 6.3L6.2 5.7L8 2Z",
          stroke: "currentColor",
          "stroke-width": "1.3",
          "stroke-linejoin": "round"
        }));
      } else if (kind === "chevron") {
        svg.appendChild(make("path", {
          d: "M5 6.2L8 3.2L11 6.2M5 9.8L8 12.8L11 9.8",
          stroke: "currentColor",
          "stroke-width": "1.3",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }));
      } else if (kind === "check") {
        svg.appendChild(make("path", {
          d: "M3.5 8.2L6.6 11.2L12.5 4.8",
          stroke: "currentColor",
          "stroke-width": "1.7",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }));
      } else if (kind === "keyboard") {
        svg.appendChild(make("rect", { x: "1.8", y: "3.5", width: "12.4", height: "9", rx: "1.8", stroke: "currentColor", "stroke-width": "1.25" }));
        svg.appendChild(make("path", { d: "M4.5 6.5H5.5M7.5 6.5H8.5M10.5 6.5H11.5M5 9.8H11", stroke: "currentColor", "stroke-width": "1.25", "stroke-linecap": "round" }));
      } else if (kind === "reset") {
        svg.appendChild(make("path", {
          d: "M3.2 7A5 5 0 1 1 4.5 11.5M3 3.5V7H6.5",
          stroke: "currentColor",
          "stroke-width": "1.35",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }));
      }
      return svg;
    }

    function formatSliderVal(ctrl, rawVal) {
      const num = Number(rawVal);
      const text = ctrl.decimals ? num.toFixed(ctrl.decimals) : String(num);
      return `${text}${ctrl.unit || ""}`;
    }

    function renderControl(mod, ctrl) {
      const mState = guiState.modules[mod.id];
      const val = mState.values[ctrl.key];
      const wrap = document.createElement("div");
      wrap.className = "gs-setting";

      if (ctrl.type === "slider") {
        const head = document.createElement("div");
        head.className = "gs-setting-head";
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        const badge = document.createElement("span");
        badge.className = "gs-val-badge";
        badge.textContent = formatSliderVal(ctrl, val);
        head.appendChild(lbl);
        head.appendChild(badge);
        wrap.appendChild(head);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const rWrap = document.createElement("div");
        rWrap.className = "gs-range-wrap";
        const track = document.createElement("div");
        track.className = "gs-range-track";
        const fill = document.createElement("div");
        fill.className = "gs-range-fill";
        const pct = ((Number(val) - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
        fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
        track.appendChild(fill);

        const input = document.createElement("input");
        input.type = "range";
        input.className = "gs-range";
        input.min = String(ctrl.min);
        input.max = String(ctrl.max);
        input.step = String(ctrl.step);
        input.value = String(val);
        input.setAttribute("aria-label", ctrl.label);

        input.addEventListener("input", () => {
          const next = Number(input.value);
          mState.values[ctrl.key] = next;
          badge.textContent = formatSliderVal(ctrl, next);
          const nextPct = ((next - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
          fill.style.width = `${Math.max(0, Math.min(100, nextPct))}%`;
          saveGuiState();
        });

        rWrap.appendChild(track);
        rWrap.appendChild(input);
        wrap.appendChild(rWrap);
        return wrap;
      }

      if (ctrl.type === "segmented") {
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        wrap.appendChild(lbl);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const seg = document.createElement("div");
        seg.className = "gs-seg";
        for (const opt of ctrl.options) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = val === opt ? "gs-seg-btn active" : "gs-seg-btn";
          btn.textContent = opt;
          btn.addEventListener("click", () => {
            mState.values[ctrl.key] = opt;
            saveGuiState();
            syncShellAttributes();
            renderGuiWorkspace();
            pushToast(`${mod.name}: ${ctrl.label} — ${opt}`);
          });
          seg.appendChild(btn);
        }
        wrap.appendChild(seg);
        return wrap;
      }

      if (ctrl.type === "select") {
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        wrap.appendChild(lbl);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const dropId = `${mod.id}.${ctrl.key}`;
        const selWrap = document.createElement("div");
        selWrap.className = "gs-select-wrap";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "gs-select-btn";
        const valSpan = document.createElement("span");
        valSpan.className = "gs-select-val";
        valSpan.textContent = String(val);
        const caret = document.createElement("span");
        caret.className = "gs-select-caret";
        caret.appendChild(svgIcon("chevron", 12));
        trigger.appendChild(valSpan);
        trigger.appendChild(caret);

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          openMultiKey = null;
          openDropdownKey = openDropdownKey === dropId ? null : dropId;
          renderGuiWorkspace();
        });

        selWrap.appendChild(trigger);

        if (openDropdownKey === dropId) {
          const menu = document.createElement("div");
          menu.className = "gs-select-menu";
          for (const opt of ctrl.options) {
            const optBtn = document.createElement("button");
            optBtn.type = "button";
            optBtn.className = val === opt ? "gs-select-opt active" : "gs-select-opt";
            optBtn.textContent = opt;
            optBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              mState.values[ctrl.key] = opt;
              openDropdownKey = null;
              saveGuiState();
              syncShellAttributes();
              renderGuiWorkspace();
              pushToast(`${mod.name}: ${ctrl.label} → ${opt}`);
            });
            menu.appendChild(optBtn);
          }
          selWrap.appendChild(menu);
        }

        wrap.appendChild(selWrap);
        return wrap;
      }

      if (ctrl.type === "checkbox") {
        const row = document.createElement("div");
        row.className = "gs-check-row";

        const left = document.createElement("div");
        const lbl = document.createElement("div");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        left.appendChild(lbl);
        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          left.appendChild(hint);
        }

        const box = document.createElement("button");
        box.type = "button";
        box.className = val ? "gs-check-box checked" : "gs-check-box";
        if (val) box.appendChild(svgIcon("check", 10));
        box.setAttribute("aria-label", ctrl.label);

        const toggleCheck = () => {
          mState.values[ctrl.key] = !mState.values[ctrl.key];
          saveGuiState();
          syncShellAttributes();
          renderGuiWorkspace();
          pushToast(`${mod.name}: ${ctrl.label} ${mState.values[ctrl.key] ? "вкл." : "выкл."}`);
        };

        row.addEventListener("click", toggleCheck);
        row.appendChild(left);
        row.appendChild(box);
        wrap.appendChild(row);
        return wrap;
      }

      if (ctrl.type === "multi") {
        const selected = Array.isArray(val) ? val : [];
        const multiId = `${mod.id}.${ctrl.key}`;

        const head = document.createElement("div");
        head.className = "gs-setting-head";
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        const badge = document.createElement("span");
        badge.className = "gs-val-badge";
        badge.textContent = `${selected.length}/${ctrl.options.length}`;
        head.appendChild(lbl);
        head.appendChild(badge);
        wrap.appendChild(head);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "gs-select-btn";
        const summary = document.createElement("span");
        summary.className = "gs-select-val";
        summary.textContent = selected.length ? selected.join(", ") : "Ничего не выбрано";
        const caret = document.createElement("span");
        caret.className = "gs-select-caret";
        caret.appendChild(svgIcon("chevron", 12));
        trigger.appendChild(summary);
        trigger.appendChild(caret);
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          openDropdownKey = null;
          openMultiKey = openMultiKey === multiId ? null : multiId;
          renderGuiWorkspace();
        });
        wrap.appendChild(trigger);

        if (openMultiKey === multiId) {
          const chipsWrap = document.createElement("div");
          chipsWrap.className = "gs-multi-list";
          for (const opt of ctrl.options) {
            const isSel = selected.includes(opt);
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = isSel ? "gs-multi-chip active" : "gs-multi-chip";
            chip.textContent = opt;
            chip.addEventListener("click", (e) => {
              e.stopPropagation();
              const next = isSel ? selected.filter((x) => x !== opt) : [...selected, opt];
              mState.values[ctrl.key] = next;
              saveGuiState();
              renderGuiWorkspace();
            });
            chipsWrap.appendChild(chip);
          }
          wrap.appendChild(chipsWrap);
        }

        return wrap;
      }

      if (ctrl.type === "keybind") {
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        wrap.appendChild(lbl);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const isListening = listeningTarget && listeningTarget.modId === mod.id && listeningTarget.ctrlKey === ctrl.key;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gs-wide-btn mono";
        btn.appendChild(svgIcon("keyboard", 13));
        const keyTxt = document.createElement("span");
        keyTxt.textContent = isListening ? "Нажмите клавишу..." : String(val);
        btn.appendChild(keyTxt);
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          listeningTarget = { modId: mod.id, ctrlKey: ctrl.key };
          renderGuiWorkspace();
        });
        wrap.appendChild(btn);
        return wrap;
      }

      if (ctrl.type === "action") {
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        wrap.appendChild(lbl);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const row = document.createElement("div");
        row.className = "gs-action-row";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gs-wide-btn";
        btn.textContent = ctrl.actionLabel;
        btn.addEventListener("click", () => {
          guiState.modules.preview.values.density = "Просторная";
          guiState.modules.preview.values.glassMode = "Обычный";
          guiState.sidebarCollapsed = false;
          saveGuiState();
          syncShellAttributes();
          renderGuiWorkspace();
          pushToast("Раскладка панелей сброшена");
        });

        const iconReset = document.createElement("button");
        iconReset.type = "button";
        iconReset.className = "gs-icon-btn";
        iconReset.appendChild(svgIcon("reset", 13));
        iconReset.title = "Сбросить интерфейс";
        iconReset.addEventListener("click", () => {
          guiState.accent = "mono";
          guiState.modules.interface.values.accent = "mono";
          guiState.modules.notifications.values.accent = "mono";
          saveGuiState();
          syncShellAttributes();
          renderGuiWorkspace();
          pushToast("Акцент сброшен на базовый");
        });

        row.appendChild(btn);
        row.appendChild(iconReset);
        wrap.appendChild(row);
        return wrap;
      }

      if (ctrl.type === "swatches") {
        const currentAccent = guiState.accent;
        const head = document.createElement("div");
        head.className = "gs-setting-head";
        const lbl = document.createElement("span");
        lbl.className = "gs-setting-label";
        lbl.textContent = ctrl.label;
        const hexBadge = document.createElement("span");
        hexBadge.className = "gs-val-badge";
        hexBadge.textContent = ACCENT_HEX[currentAccent] || "#E4E4E7";
        head.appendChild(lbl);
        head.appendChild(hexBadge);
        wrap.appendChild(head);

        if (ctrl.hint) {
          const hint = document.createElement("div");
          hint.className = "gs-setting-hint";
          hint.textContent = ctrl.hint;
          wrap.appendChild(hint);
        }

        const swatchBar = document.createElement("div");
        swatchBar.className = "gs-swatches";
        for (const colorKey of Object.keys(ACCENT_HEX)) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = currentAccent === colorKey
            ? `gs-swatch gs-swatch-${colorKey} active`
            : `gs-swatch gs-swatch-${colorKey}`;
          dot.setAttribute("aria-label", `Цвет ${ACCENT_HEX[colorKey]}`);
          dot.addEventListener("click", () => {
            guiState.accent = colorKey;
            guiState.modules.interface.values.accent = colorKey;
            guiState.modules.notifications.values.accent = colorKey;
            saveGuiState();
            syncShellAttributes();
            renderGuiWorkspace();
            pushToast(`Акцент изменён: ${ACCENT_HEX[colorKey]}`);
          });
          swatchBar.appendChild(dot);
        }
        wrap.appendChild(swatchBar);
        return wrap;
      }

      return wrap;
    }

    function renderModuleCard(mod) {
      const mState = guiState.modules[mod.id];
      const card = document.createElement("article");
      const baseCls = mState.enabled ? "gs-card is-enabled" : "gs-card";
      card.className = highlightedModId === mod.id ? `${baseCls} is-highlighted` : baseCls;
      card.setAttribute("data-mod-id", mod.id);

      const head = document.createElement("div");
      head.className = "gs-card-head";

      const titleWrap = document.createElement("div");
      titleWrap.className = "gs-card-title-wrap";
      const name = document.createElement("span");
      name.className = "gs-card-name";
      name.textContent = mod.name;
      titleWrap.appendChild(name);

      const controls = document.createElement("div");
      controls.className = "gs-card-controls";

      const isBindListening = listeningTarget && listeningTarget.modId === mod.id && !listeningTarget.ctrlKey;
      const bindBtn = document.createElement("button");
      bindBtn.type = "button";
      bindBtn.className = isBindListening ? "gs-bind-pill is-listening" : "gs-bind-pill";
      bindBtn.textContent = isBindListening ? "..." : mState.bind;
      bindBtn.title = "Нажмите для смены бинда";
      bindBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        listeningTarget = { modId: mod.id, ctrlKey: null };
        renderGuiWorkspace();
      });

      const starBtn = document.createElement("button");
      starBtn.type = "button";
      starBtn.className = mState.fav ? "gs-star-btn is-fav" : "gs-star-btn";
      starBtn.appendChild(svgIcon("star", 13));
      starBtn.setAttribute("aria-label", `Избранное ${mod.name}`);
      starBtn.addEventListener("click", () => {
        mState.fav = !mState.fav;
        saveGuiState();
        renderGuiWorkspace();
      });

      const sw = document.createElement("button");
      sw.type = "button";
      sw.className = mState.enabled ? "gs-switch is-on" : "gs-switch";
      sw.setAttribute("aria-label", `Переключить ${mod.name}`);
      sw.addEventListener("click", () => {
        mState.enabled = !mState.enabled;
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`${mod.name} ${mState.enabled ? "включён" : "выключен"}`);
      });

      controls.appendChild(bindBtn);
      controls.appendChild(starBtn);
      controls.appendChild(sw);
      head.appendChild(titleWrap);
      head.appendChild(controls);
      card.appendChild(head);

      const settings = document.createElement("div");
      settings.className = "gs-settings";
      for (const ctrl of mod.controls) {
        settings.appendChild(renderControl(mod, ctrl));
      }
      card.appendChild(settings);

      return card;
    }

    function applyConfigPreset(presetId) {
      if (presetId === "default") {
        const fresh = buildInitialState();
        guiState.modules = fresh.modules;
        guiState.accent = "mono";
      } else if (presetId === "grim_legit") {
        guiState.modules.aimassist.enabled = true;
        guiState.modules.aimassist.values.curve = "Bezier Smooth";
        guiState.modules.aimassist.values.speed = 5.0;
        guiState.modules.aimassist.values.fov = 60;
        guiState.modules.triggerbot.enabled = true;
        guiState.modules.triggerbot.values.range = 2.95;
        guiState.modules.triggerbot.values.crits = "Только криты";
        guiState.modules.velocity.enabled = true;
        guiState.modules.velocity.values.mode = "Jump Reset";
        guiState.modules.velocity.values.chance = 75;
      } else if (presetId === "funtime_polar") {
        guiState.modules.aimassist.enabled = true;
        guiState.modules.aimassist.values.curve = "Adaptive Polar";
        guiState.modules.aimassist.values.speed = 5.5;
        guiState.modules.triggerbot.values.range = 2.95;
        guiState.modules.triggerbot.values.jitter = 26;
        guiState.modules.sprint.values.mode = "Легитный";
        guiState.modules.velocity.enabled = false;
      } else if (presetId === "holyworld_holyac") {
        guiState.modules.aimassist.enabled = true;
        guiState.modules.aimassist.values.curve = "HolyAC Curve";
        guiState.modules.aimassist.values.speed = 6.0;
        guiState.modules.triggerbot.values.range = 3.0;
        guiState.modules.triggerbot.values.crits = "Только криты";
        guiState.modules.velocity.enabled = true;
        guiState.modules.velocity.values.chance = 85;
      }
      saveGuiState();
      syncShellAttributes();
      pushToast(`Загружен конфиг: ${presetId}`);
    }

    function renderConfigsSubview() {
      const sub = document.createElement("div");
      sub.className = "gs-subview";

      const bar = document.createElement("form");
      bar.className = "gs-sub-bar";
      const inp = document.createElement("input");
      inp.className = "gs-sub-input";
      inp.placeholder = "Название нового профиля...";
      const saveBtn = document.createElement("button");
      saveBtn.type = "submit";
      saveBtn.className = "btn btn-sm btn-white btn-rect";
      saveBtn.textContent = "Сохранить текущий";

      bar.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = inp.value.trim();
        if (!title) return;
        guiState.customConfigs.unshift({
          id: `custom_${Date.now()}`,
          name: title,
          note: "Пользовательский профиль",
          snapshot: JSON.parse(JSON.stringify(guiState.modules))
        });
        inp.value = "";
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`Конфиг «${title}» сохранён`);
      });

      bar.appendChild(inp);
      bar.appendChild(saveBtn);
      sub.appendChild(bar);

      const grid = document.createElement("div");
      grid.className = "gs-sub-grid";
      const allConfigs = [...guiState.customConfigs, ...PRESET_CONFIGS];

      for (const cfg of allConfigs) {
        const card = document.createElement("div");
        card.className = "gs-sub-card";
        const info = document.createElement("div");
        const title = document.createElement("div");
        title.className = "gs-card-name";
        title.textContent = cfg.name;
        const meta = document.createElement("div");
        meta.className = "gs-sub-meta";
        meta.textContent = cfg.note;
        info.appendChild(title);
        info.appendChild(meta);

        const acts = document.createElement("div");
        acts.className = "gs-card-controls";
        const loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.className = "btn btn-sm btn-rect";
        loadBtn.textContent = "Загрузить";
        loadBtn.addEventListener("click", () => {
          if (cfg.snapshot) {
            guiState.modules = JSON.parse(JSON.stringify(cfg.snapshot));
            saveGuiState();
            syncShellAttributes();
            pushToast(`Загружен профиль «${cfg.name}»`);
          } else {
            applyConfigPreset(cfg.id);
          }
          renderGuiWorkspace();
        });
        acts.appendChild(loadBtn);

        if (!cfg.builtIn) {
          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "gs-icon-btn";
          delBtn.textContent = "×";
          delBtn.title = "Удалить";
          delBtn.addEventListener("click", () => {
            guiState.customConfigs = guiState.customConfigs.filter((c) => c.id !== cfg.id);
            saveGuiState();
            renderGuiWorkspace();
          });
          acts.appendChild(delBtn);
        }

        card.appendChild(info);
        card.appendChild(acts);
        grid.appendChild(card);
      }

      sub.appendChild(grid);
      return sub;
    }

    function renderFriendsSubview() {
      const sub = document.createElement("div");
      sub.className = "gs-subview";

      const bar = document.createElement("form");
      bar.className = "gs-sub-bar";
      const inp = document.createElement("input");
      inp.className = "gs-sub-input";
      inp.placeholder = "Ник игрока для списка Friends...";
      const addBtn = document.createElement("button");
      addBtn.type = "submit";
      addBtn.className = "btn btn-sm btn-white btn-rect";
      addBtn.textContent = "Добавить";

      bar.addEventListener("submit", (e) => {
        e.preventDefault();
        const nick = inp.value.trim();
        if (!nick || guiState.friends.includes(nick)) return;
        guiState.friends.push(nick);
        inp.value = "";
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`Игрок ${nick} добавлен в Friends`);
      });

      bar.appendChild(inp);
      bar.appendChild(addBtn);
      sub.appendChild(bar);

      const grid = document.createElement("div");
      grid.className = "gs-sub-grid";
      for (const nick of guiState.friends) {
        const card = document.createElement("div");
        card.className = "gs-sub-card";
        const left = document.createElement("div");
        const name = document.createElement("div");
        name.className = "gs-card-name";
        name.textContent = nick;
        const meta = document.createElement("div");
        meta.className = "gs-sub-meta";
        meta.textContent = "Защищён от AimAssist / TriggerBot";
        left.appendChild(name);
        left.appendChild(meta);

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn btn-sm btn-ghost btn-rect";
        delBtn.textContent = "Удалить";
        delBtn.addEventListener("click", () => {
          guiState.friends = guiState.friends.filter((f) => f !== nick);
          saveGuiState();
          renderGuiWorkspace();
          pushToast(`${nick} удалён из Friends`);
        });

        card.appendChild(left);
        card.appendChild(delBtn);
        grid.appendChild(card);
      }

      sub.appendChild(grid);
      return sub;
    }

    function renderWaypointsSubview() {
      const sub = document.createElement("div");
      sub.className = "gs-subview";

      const bar = document.createElement("form");
      bar.className = "gs-sub-bar";
      const inpName = document.createElement("input");
      inpName.className = "gs-sub-input";
      inpName.placeholder = "Метка (напр. Base)";
      const inpX = document.createElement("input");
      inpX.className = "gs-sub-input mono";
      inpX.placeholder = "X";
      inpX.type = "number";
      const inpZ = document.createElement("input");
      inpZ.className = "gs-sub-input mono";
      inpZ.placeholder = "Z";
      inpZ.type = "number";
      const addBtn = document.createElement("button");
      addBtn.type = "submit";
      addBtn.className = "btn btn-sm btn-white btn-rect";
      addBtn.textContent = "Создать метку";

      bar.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = inpName.value.trim();
        if (!title) return;
        guiState.waypoints.push({
          name: title,
          x: Number(inpX.value || 0),
          y: 64,
          z: Number(inpZ.value || 0),
          visible: true
        });
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`Waypoint «${title}» добавлен`);
      });

      bar.appendChild(inpName);
      bar.appendChild(inpX);
      bar.appendChild(inpZ);
      bar.appendChild(addBtn);
      sub.appendChild(bar);

      const grid = document.createElement("div");
      grid.className = "gs-sub-grid";
      guiState.waypoints.forEach((wp, idx) => {
        const card = document.createElement("div");
        card.className = "gs-sub-card";
        const left = document.createElement("div");
        const name = document.createElement("div");
        name.className = "gs-card-name";
        name.textContent = wp.name;
        const meta = document.createElement("div");
        meta.className = "gs-sub-meta";
        meta.textContent = `X ${wp.x}  Y ${wp.y}  Z ${wp.z}`;
        left.appendChild(name);
        left.appendChild(meta);

        const acts = document.createElement("div");
        acts.className = "gs-card-controls";
        const sw = document.createElement("button");
        sw.type = "button";
        sw.className = wp.visible ? "gs-switch is-on" : "gs-switch";
        sw.addEventListener("click", () => {
          wp.visible = !wp.visible;
          saveGuiState();
          renderGuiWorkspace();
        });
        const del = document.createElement("button");
        del.type = "button";
        del.className = "gs-icon-btn";
        del.textContent = "×";
        del.addEventListener("click", () => {
          guiState.waypoints.splice(idx, 1);
          saveGuiState();
          renderGuiWorkspace();
        });
        acts.appendChild(sw);
        acts.appendChild(del);
        card.appendChild(left);
        card.appendChild(acts);
        grid.appendChild(card);
      });

      sub.appendChild(grid);
      return sub;
    }

    function renderGuiWorkspace() {
      const container = document.getElementById("gs-viewport");
      if (!container) return;

      navBtns.forEach((b) => {
        const isAct = b.getAttribute("data-gs-view") === guiState.view;
        b.classList.toggle("active", isAct);
      });

      if (activeTitleEl) {
        activeTitleEl.textContent = guiState.view === "all" ? "All" : guiState.view;
      }

      if (allCountEl) {
        allCountEl.textContent = String(MODULE_DEFS.length);
      }

      container.textContent = "";

      if (guiState.view === "Configs") {
        const sub = renderConfigsSubview();
        container.appendChild(sub);
        return;
      }
      if (guiState.view === "Friends") {
        container.appendChild(renderFriendsSubview());
        return;
      }
      if (guiState.view === "Waypoints") {
        container.appendChild(renderWaypointsSubview());
        return;
      }

      const q = guiState.search.trim().toLowerCase();
      let list = MODULE_DEFS.filter((m) => {
        if (guiState.view !== "all" && m.category !== guiState.view) return false;
        if (guiState.favOnly && !guiState.modules[m.id].fav) return false;
        if (!q) return true;
        if (m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) return true;
        return m.controls.some((c) => c.label.toLowerCase().includes(q) || (c.hint && c.hint.toLowerCase().includes(q)));
      });

      if (guiState.sortAlpha) {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      }

      if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "gs-empty";
        empty.textContent = "Ничего не найдено по текущему фильтру или запросу.";
        container.appendChild(empty);
        return;
      }

      const grid = document.createElement("div");
      grid.className = "gs-masonry";
      const colCount = window.innerWidth <= 720 ? 1 : (window.innerWidth <= 1024 ? 2 : 3);
      const cols = [];
      for (let i = 0; i < colCount; i++) {
        const col = document.createElement("div");
        col.className = "gs-col";
        cols.push(col);
        grid.appendChild(col);
      }

      list.forEach((mod, idx) => {
        cols[idx % colCount].appendChild(renderModuleCard(mod));
      });

      container.appendChild(grid);
    }

    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        guiState.view = btn.getAttribute("data-gs-view") || "all";
        openDropdownKey = null;
        openMultiKey = null;
        saveGuiState();
        renderGuiWorkspace();
      });
    });

    if (searchInput) {
      searchInput.value = guiState.search;
      searchInput.addEventListener("input", () => {
        guiState.search = searchInput.value;
        renderGuiWorkspace();
      });
    }

    if (focusSearchBtn && searchInput) {
      focusSearchBtn.addEventListener("click", () => {
        if (guiState.view === "Configs" || guiState.view === "Friends" || guiState.view === "Waypoints") {
          guiState.view = "all";
          renderGuiWorkspace();
        }
        searchInput.focus();
      });
    }

    if (btnFav) {
      btnFav.addEventListener("click", () => {
        guiState.favOnly = !guiState.favOnly;
        syncShellAttributes();
        saveGuiState();
        renderGuiWorkspace();
      });
    }

    if (btnSort) {
      btnSort.addEventListener("click", () => {
        guiState.sortAlpha = !guiState.sortAlpha;
        syncShellAttributes();
        saveGuiState();
        renderGuiWorkspace();
      });
    }

    if (btnGlass) {
      btnGlass.addEventListener("click", () => {
        const next = guiState.modules.preview.values.glassMode === "Прозрачный" ? "Обычный" : "Прозрачный";
        guiState.modules.preview.values.glassMode = next;
        syncShellAttributes();
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`Режим отображения: ${next}`);
      });
    }

    if (btnCompact) {
      btnCompact.addEventListener("click", () => {
        const next = guiState.modules.preview.values.density === "Компактная" ? "Просторная" : "Компактная";
        guiState.modules.preview.values.density = next;
        syncShellAttributes();
        saveGuiState();
        renderGuiWorkspace();
        pushToast(`Раскладка: ${next}`);
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        guiState = buildInitialState();
        if (searchInput) searchInput.value = "";
        openDropdownKey = null;
        openMultiKey = null;
        listeningTarget = null;
        saveGuiState();
        syncShellAttributes();
        renderGuiWorkspace();
        pushToast("Настройки GUI сброшены по умолчанию");
      });
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        guiState.sidebarCollapsed = !guiState.sidebarCollapsed;
        syncShellAttributes();
      });
    }

    document.addEventListener("click", () => {
      if (openDropdownKey || listeningTarget) {
        openDropdownKey = null;
        listeningTarget = null;
        renderGuiWorkspace();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (listeningTarget) {
        e.preventDefault();
        if (e.key !== "Escape") {
          const formatted = e.key === "Shift" && e.location === 2
            ? "RSHIFT"
            : (e.key === "Backspace" || e.key === "Delete" ? "None" : e.key.toUpperCase());
          const targetMod = guiState.modules[listeningTarget.modId];
          if (targetMod) {
            if (listeningTarget.ctrlKey) {
              targetMod.values[listeningTarget.ctrlKey] = formatted;
            } else {
              targetMod.bind = formatted;
            }
            saveGuiState();
            pushToast(`Клавиша назначена: ${formatted}`);
          }
        }
        listeningTarget = null;
        renderGuiWorkspace();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      renderGuiWorkspace();
    });

    function jumpToGuiTarget({ mod, view, scroll } = {}) {
      if (scroll) {
        const targetEl = document.querySelector(scroll);
        if (targetEl && typeof targetEl.scrollIntoView === "function") {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      const showcaseEl = document.getElementById("showcase");
      if (showcaseEl && typeof showcaseEl.scrollIntoView === "function") {
        showcaseEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (highlightTimer) {
        clearTimeout(highlightTimer);
        highlightTimer = null;
      }

      if (view) {
        guiState.view = view;
        highlightedModId = null;
        openDropdownKey = null;
        openMultiKey = null;
        saveGuiState();
        syncShellAttributes();
        renderGuiWorkspace();
        pushToast(`Открыт раздел: ${view}`);
        return;
      }

      if (mod) {
        const def = MODULE_DEFS.find((item) => item.id === mod);
        if (!def) return;
        guiState.view = def.category;
        guiState.search = "";
        guiState.favOnly = false;
        if (searchInput) searchInput.value = "";
        highlightedModId = def.id;
        openDropdownKey = null;
        openMultiKey = null;
        saveGuiState();
        syncShellAttributes();
        renderGuiWorkspace();

        const viewportEl = document.getElementById("gs-viewport");
        if (viewportEl && typeof viewportEl.querySelector === "function") {
          const cardEl = viewportEl.querySelector(`[data-mod-id="${def.id}"]`);
          if (cardEl && typeof cardEl.scrollIntoView === "function") {
            cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }

        pushToast(`Открыт модуль: ${def.name}`);
        highlightTimer = setTimeout(() => {
          highlightedModId = null;
          renderGuiWorkspace();
        }, 1800);
      }
    }

    window.ShellJumpToGui = jumpToGuiTarget;

    syncShellAttributes();
    renderGuiWorkspace();

    const urlParams = new URLSearchParams(window.location.search);
    const paramMod = urlParams.get("mod");
    const paramView = urlParams.get("view");
    if (paramMod || paramView) {
      jumpToGuiTarget({ mod: paramMod, view: paramView });
    }
  }

  // =========================================================================
  // Pricing Edition & Payment Selection
  // =========================================================================
  let currentEdition = "stable";
  const editionBtns = document.querySelectorAll(".edition-btn[data-edition]");
  const priceCards = document.querySelectorAll(".price-card[data-plan]");

  function refreshPriceCards() {
    priceCards.forEach((card) => {
      const plan = card.getAttribute("data-plan") || "30d";
      const amountEl = card.querySelector(".price-amount");
      const buyLink = card.querySelector("[data-buy-link]");
      const verChip = card.querySelector("[data-edition-chip]");
      const activePayBtn = card.querySelector(".pay-option.active");
      const pay = activePayBtn ? activePayBtn.getAttribute("data-pay") : "sbp";

      if (verChip) verChip.textContent = currentEdition === "beta" ? "1.21.11" : "1.21.10";

      let priceText = "";
      if (amountEl) {
        priceText = currentEdition === "beta"
          ? (amountEl.getAttribute("data-price-beta") || amountEl.textContent)
          : (amountEl.getAttribute("data-price-stable") || amountEl.textContent);
        amountEl.textContent = priceText;
      }

      if (buyLink) {
        if (priceText) buyLink.textContent = `Оплатить ${priceText} →`;
        buyLink.href = `account.html?plan=${encodeURIComponent(plan)}&pay=${encodeURIComponent(pay)}&edition=${encodeURIComponent(currentEdition)}`;
      }
    });
  }

  editionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentEdition = btn.getAttribute("data-edition") === "beta" ? "beta" : "stable";
      editionBtns.forEach((b) => {
        const isAct = b === btn;
        b.classList.toggle("active", isAct);
        b.setAttribute("aria-selected", String(isAct));
      });
      refreshPriceCards();
    });
  });

  priceCards.forEach((card) => {
    const payBtns = card.querySelectorAll(".pay-option");
    payBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        payBtns.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        refreshPriceCards();
      });
    });
  });

  // =========================================================================
  // 1-to-1 terminal.exe Live Injector Animation (#injector)
  // =========================================================================
  const bodyEl = document.getElementById("inj-body");
  const stageEl = document.getElementById("inj-stage");
  const replayBtn = document.getElementById("inj-replay");
  const stepEls = {
    scan: document.querySelector('[data-inj-step="scan"]'),
    locate: document.querySelector('[data-inj-step="locate"]'),
    map: document.querySelector('[data-inj-step="map"]'),
    done: document.querySelector('[data-inj-step="done"]')
  };

  if (!bodyEl) return;

  let runId = 0;
  let userInteracted = false;
  let autoLoopTimer = null;
  let activeInput = null;
  let selectedDll = DLL_PATH;
  let injMethod = "custom";

  const INJ_METHODS = {
    custom: { label: "Shell Custom 1.3.2", cli: "shell custom 1.3.2" },
    manual: { label: "Manual Map", cli: "manual map" }
  };

  const methodKickerEl = document.getElementById("inj-method-kicker");
  const stepMethodLabelEl = document.getElementById("inj-step-method-label");
  const statusMethodEl = document.getElementById("status-method");
  const methodBtns = document.querySelectorAll("[data-inj-method]");

  function setInjectionMethod(key, replay) {
    injMethod = key === "manual" ? "manual" : "custom";
    const info = INJ_METHODS[injMethod];
    methodBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-inj-method") === injMethod);
    });
    if (methodKickerEl) methodKickerEl.textContent = `TERMINAL.EXE · ${info.label.toUpperCase()}`;
    if (stepMethodLabelEl) stepMethodLabelEl.textContent = info.label;
    if (statusMethodEl) statusMethodEl.textContent = info.label;
    if (replay) playShowcaseAnimation(true);
  }

  methodBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setInjectionMethod(btn.getAttribute("data-inj-method"), true);
    });
  });

  function setPipelineState(activeStage) {
    const order = ["scan", "locate", "map", "done"];
    const activeIdx = order.indexOf(activeStage);
    order.forEach((key, idx) => {
      const el = stepEls[key];
      if (!el) return;
      el.classList.remove("is-active", "is-done");
      if (activeStage === "all-done" || (activeIdx >= 0 && idx < activeIdx)) {
        el.classList.add("is-done");
      } else if (idx === activeIdx) {
        el.classList.add("is-active");
      }
    });
  }

  function scrollToBottom() {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function appendSegments(parent, segments) {
    for (const [cls, text] of segments) {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text;
      parent.appendChild(span);
    }
  }

  function addLine(segments) {
    const line = document.createElement("div");
    line.className = "inj-line";
    appendSegments(line, segments);
    bodyEl.appendChild(line);
    scrollToBottom();
    return line;
  }

  function addGap() {
    const gap = document.createElement("div");
    gap.className = "inj-gap";
    bodyEl.appendChild(gap);
  }

  function createPromptPrefix(parent) {
    appendSegments(parent, [
      ["inj-u", USER_NAME],
      ["inj-dim", "@"],
      ["inj-h", HOST_NAME],
      ["inj-p", "  terminal"],
      ["inj-s", "  % "]
    ]);
  }

  function setStage(text) {
    if (stageEl) stageEl.textContent = text;
  }

  function formatLoginDate() {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n) => String(n).padStart(2, "0");
    const dayStr = String(now.getDate()).padStart(2, " ");
    return `${days[now.getDay()]} ${months[now.getMonth()]} ${dayStr} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  function renderBanner() {
    addLine([
      ["inj-dim", "Last login: "],
      ["inj-text", formatLoginDate()],
      ["inj-dim", " on ttys001"]
    ]);
    addGap();
    addLine([["inj-info", "  terminal  -  injector  v2.0.0"]]);
    addLine([["inj-dim", "  type 'help' for commands."]]);
    addGap();
  }

  function sleep(ms, id) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(id === runId), ms);
    });
  }

  async function typeCommand(command, id) {
    const row = document.createElement("div");
    row.className = "inj-prompt-row";
    createPromptPrefix(row);

    const typedSpan = document.createElement("span");
    typedSpan.className = "inj-live-cmd";
    const cursorSpan = document.createElement("span");
    cursorSpan.className = "inj-cursor";

    row.appendChild(typedSpan);
    row.appendChild(cursorSpan);
    bodyEl.appendChild(row);
    scrollToBottom();

    for (let i = 0; i < command.length; i++) {
      if (!(await sleep(60 + (i % 3) * 18, id))) return false;
      typedSpan.textContent += command[i];
      scrollToBottom();
    }

    if (!(await sleep(160, id))) return false;
    cursorSpan.remove();
    return true;
  }

  function printPs() {
    addLine([["inj-dim", "  PID       process"]]);
    addLine([["inj-dim", "  --------  ----------------------"]]);
    addLine([
      ["inj-ok", `  ${GAME_PID.padEnd(10, " ")}`],
      ["inj-text", GAME_EXE]
    ]);
  }

  async function runInjectOutput(id) {
    const methodInfo = INJ_METHODS[injMethod] || INJ_METHODS.custom;
    setPipelineState("locate");
    addLine([["inj-info", `preparing injection for pid ${GAME_PID}...`]]);
    if (!(await sleep(280, id))) return false;
    addLine([["inj-info", `method: ${methodInfo.cli}`]]);
    if (!(await sleep(260, id))) return false;
    addLine([["inj-info", `auto-located: ${selectedDll}`]]);
    if (!(await sleep(340, id))) return false;
    setPipelineState("map");
    addLine([["inj-info", `injecting into pid ${GAME_PID} (${methodInfo.cli})...`]]);
    if (!(await sleep(500, id))) return false;
    setPipelineState("all-done");
    addLine([["inj-ok", "injected successfully."]]);
    return true;
  }

  function executeCommand(raw) {
    const trimmed = raw.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const cmd = (parts[0] || "").toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (!cmd) return;

    if (cmd === "clear" || cmd === "cls") {
      bodyEl.textContent = "";
      renderBanner();
      setPipelineState("");
      return;
    }

    if (cmd === "help") {
      addLine([["inj-info", "commands:"]]);
      addLine([["inj-text", "  ps                 "], ["inj-dim", "list javaw.exe processes"]]);
      addLine([["inj-text", "  method <mode>      "], ["inj-dim", "set method (custom | manual)"]]);
      addLine([["inj-text", "  dll <path>         "], ["inj-dim", "select target dll"]]);
      addLine([["inj-text", "  inject [pid]       "], ["inj-dim", "inject dll into game"]]);
      addLine([["inj-text", "  version            "], ["inj-dim", "print loader build info"]]);
      addLine([["inj-text", "  clear              "], ["inj-dim", "clear terminal buffer"]]);
      return;
    }

    if (cmd === "method") {
      const m = arg.toLowerCase();
      if (m === "manual") {
        setInjectionMethod("manual", false);
        addLine([["inj-ok", "method: manual map"]]);
      } else if (m === "custom" || m === "shell" || m === "1.3.2") {
        setInjectionMethod("custom", false);
        addLine([["inj-ok", "method: shell custom 1.3.2"]]);
      } else {
        addLine([["inj-info", `current method: ${(INJ_METHODS[injMethod] || INJ_METHODS.custom).cli} (usage: method custom | manual)`]]);
      }
      return;
    }

    if (cmd === "ps") {
      setPipelineState("scan");
      printPs();
      return;
    }

    if (cmd === "dll") {
      if (arg) {
        selectedDll = arg;
        addLine([["inj-ok", `dll: ${selectedDll}`]]);
      } else {
        addLine([["inj-info", `dll: ${selectedDll}`]]);
      }
      return;
    }

    if (cmd === "version") {
      addLine([["inj-info", `terminal injector v2.0.0 (native win64 · ${(INJ_METHODS[injMethod] || INJ_METHODS.custom).cli})`]]);
      return;
    }

    if (cmd === "inject") {
      const id = runId;
      setStage("injecting");
      runInjectOutput(id).then((ok) => {
        if (!ok) return;
        setStage("injected");
        spawnInteractivePrompt();
      });
      return "async";
    }

    addLine([["inj-err", `zsh: command not found: ${cmd}`]]);
  }

  function spawnInteractivePrompt() {
    const row = document.createElement("div");
    row.className = "inj-prompt-row";
    createPromptPrefix(row);

    const form = document.createElement("form");
    form.className = "inj-input-form";

    const input = document.createElement("input");
    input.className = "inj-input";
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "help / ps / inject";
    input.setAttribute("aria-label", "Командная строка инжектора");

    form.appendChild(input);
    row.appendChild(form);
    bodyEl.appendChild(row);
    activeInput = input;
    scrollToBottom();

    input.addEventListener("focus", () => {
      userInteracted = true;
      if (autoLoopTimer) {
        clearTimeout(autoLoopTimer);
        autoLoopTimer = null;
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      userInteracted = true;
      if (autoLoopTimer) {
        clearTimeout(autoLoopTimer);
        autoLoopTimer = null;
      }

      const value = input.value;
      row.innerHTML = "";
      createPromptPrefix(row);
      appendSegments(row, [["inj-text", value]]);
      activeInput = null;

      const result = executeCommand(value);
      if (result !== "async") {
        spawnInteractivePrompt();
      }
    });
  }

  async function playShowcaseAnimation(manualReplay) {
    runId += 1;
    const id = runId;

    if (autoLoopTimer) {
      clearTimeout(autoLoopTimer);
      autoLoopTimer = null;
    }
    if (manualReplay) userInteracted = false;

    bodyEl.textContent = "";
    activeInput = null;
    setPipelineState("");
    setStage("init");
    renderBanner();

    if (!(await sleep(380, id))) return;
    setStage("ps");
    setPipelineState("scan");
    if (!(await typeCommand("ps", id))) return;
    printPs();

    if (!(await sleep(460, id))) return;
    setStage("inject");
    if (!(await typeCommand("inject", id))) return;
    if (!(await runInjectOutput(id))) return;

    setStage("injected");
    spawnInteractivePrompt();

    if (!userInteracted) {
      autoLoopTimer = setTimeout(() => {
        if (!userInteracted && document.activeElement !== activeInput) {
          playShowcaseAnimation(false);
        }
      }, 7500);
    }
  }

  bodyEl.addEventListener("click", () => {
    if (activeInput) activeInput.focus();
  });

  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      playShowcaseAnimation(true);
    });
  }

  playShowcaseAnimation(false);
})();
