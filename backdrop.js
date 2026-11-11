(() => {
  "use strict";

  const WIDGETS = [
    {
      cls: "hg-aimassist",
      href: "index.html?mod=aimassist#showcase",
      mod: "aimassist",
      title: "Открыть AimAssist в GUI",
      head: ["AimAssist", "C"],
      rows: [["Bezier Smooth", "ON"], ["FOV", "78°"]]
    },
    {
      cls: "hud-ghost-pill hg-autototem",
      href: "index.html?mod=autototem#showcase",
      mod: "autototem",
      title: "Открыть AutoTotem в GUI",
      rows: [["AutoTotem", "x48"]]
    },
    {
      cls: "hg-triggerbot",
      href: "index.html?mod=triggerbot#showcase",
      mod: "triggerbot",
      title: "Открыть TriggerBot в GUI",
      head: ["TriggerBot", "R"],
      rows: [["Range", "3.00 m"], ["Crit Sync", "100%"]]
    },
    {
      cls: "hud-ghost-pill hg-preview",
      href: "index.html?mod=preview#showcase",
      mod: "preview",
      title: "Открыть Preview в GUI",
      rows: [["X -146", "Y 80", "Z 812"]]
    },
    {
      cls: "hg-velocity",
      href: "index.html?mod=velocity#showcase",
      mod: "velocity",
      title: "Открыть Velocity в GUI",
      head: ["Velocity", "85%"],
      rows: [["Mode", "Jump Reset"], ["Horiz", "90%"]]
    },
    {
      cls: "hg-sprint",
      href: "index.html?mod=sprint#showcase",
      mod: "sprint",
      title: "Открыть Sprint в GUI",
      head: ["Sprint", "TAB"],
      rows: [["Mode", "Legit"], ["Water", "Keep"]]
    },
    {
      cls: "hg-friends",
      href: "index.html?view=Friends#showcase",
      view: "Friends",
      title: "Открыть Friends в GUI",
      head: ["Friends", "02"],
      rows: [["ShellFriend", "Safe"], ["Alex_PvP", "Safe"]]
    },
    {
      cls: "hud-ghost-pill hg-interface",
      href: "index.html?mod=interface#showcase",
      mod: "interface",
      title: "Открыть Interface в GUI",
      rows: [["Interface", "144 FPS", "RSHIFT"]]
    },
    {
      cls: "hg-elements",
      href: "index.html?mod=elements#showcase",
      mod: "elements",
      title: "Открыть Elements в GUI",
      head: ["Elements", "HUD"],
      rows: [["Strength II", "01:42"], ["Speed II", "02:10"]]
    },
    {
      cls: "hud-ghost-pill hg-configs",
      href: "index.html?view=Configs#showcase",
      view: "Configs",
      title: "Открыть Configs в GUI",
      rows: [["Configs", "FunTime_Polar"]]
    },
    {
      cls: "hg-notifications",
      href: "index.html?mod=notifications#showcase",
      mod: "notifications",
      title: "Открыть Notifications в GUI",
      head: ["Notifications", "Live"],
      rows: [["TriggerBot", "Enabled"], ["Volume", "25%"]]
    },
    {
      cls: "hg-playeresp",
      href: "index.html?mod=playeresp#showcase",
      mod: "playeresp",
      title: "Открыть PlayerESP в GUI",
      head: ["PlayerESP", "2D"],
      rows: [["Health Bar", "ON"], ["Range", "64 m"]]
    },
    {
      cls: "hg-waypoints",
      href: "index.html?mod=waypoints#showcase",
      mod: "waypoints",
      title: "Открыть Waypoints в GUI",
      head: ["Waypoints", "03"],
      rows: [["Spawn", "180 m"], ["Arena", "64 m"]]
    },
    {
      cls: "hud-ghost-pill hg-loader",
      href: "index.html#injector",
      scroll: "#injector",
      title: "Перейти к инжектору",
      rows: [["shell.dll", "Shell Custom 1.3.2"]]
    }
  ];

  const backdrop = document.getElementById("page-backdrop");
  const hudBase = document.getElementById("hero-hud-base");
  const hudLit = document.getElementById("hero-hud-lit");

  if (!backdrop || !hudBase || !hudLit) return;

  if (hudBase.children.length === 0) {
    for (const w of WIDGETS) {
      const a = document.createElement("a");
      a.className = `hud-ghost ${w.cls}`;
      a.href = w.href;
      a.title = w.title;
      if (w.mod) a.setAttribute("data-jump-mod", w.mod);
      if (w.view) a.setAttribute("data-jump-view", w.view);
      if (w.scroll) a.setAttribute("data-jump-scroll", w.scroll);

      if (w.head) {
        const h = document.createElement("div");
        h.className = "hud-ghost-head";
        for (const text of w.head) {
          const s = document.createElement("span");
          s.textContent = text;
          h.appendChild(s);
        }
        a.appendChild(h);
      }

      for (const row of w.rows) {
        const r = document.createElement("div");
        r.className = "hud-ghost-row";
        for (const text of row) {
          const s = document.createElement("span");
          s.textContent = text;
          r.appendChild(s);
        }
        a.appendChild(r);
      }

      hudBase.appendChild(a);
    }
  }

  if (typeof hudBase.cloneNode === "function") {
    const cloned = hudBase.cloneNode(true);
    while (cloned.firstChild) {
      hudLit.appendChild(cloned.firstChild);
    }
  }

  let rafPending = false;
  let lastX = -400;
  let lastY = -400;

  const flushCursor = () => {
    rafPending = false;
    backdrop.style.setProperty("--mx", `${lastX}px`);
    backdrop.style.setProperty("--my", `${lastY}px`);
  };

  window.addEventListener("mousemove", (e) => {
    lastX = Math.round(e.clientX);
    lastY = Math.round(e.clientY);
    backdrop.classList.add("is-hovered");
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(flushCursor);
    }
  });

  document.addEventListener("mouseleave", () => {
    backdrop.classList.remove("is-hovered");
  });

  hudBase.addEventListener("click", (e) => {
    const target = typeof e.target?.closest === "function" ? e.target.closest(".hud-ghost") : null;
    if (!target || typeof window.ShellJumpToGui !== "function") return;
    const mod = target.getAttribute("data-jump-mod");
    const view = target.getAttribute("data-jump-view");
    const scroll = target.getAttribute("data-jump-scroll");
    if (mod || view || scroll) {
      e.preventDefault();
      window.ShellJumpToGui({ mod, view, scroll });
    }
  });
})();
