/* =========================================================================
   multipage · shell.js   (vanilla, no build)

   The SHARED CHROME for every page: app bar, cross-page nav, footer and the
   detail <dialog>. It also owns global state (language + theme) and exposes a
   tiny toolkit on window.LDW that each page's app.js reuses.

   Loaded on EVERY page BEFORE app.js. It:
     1. reads the language from <html lang> and the theme from localStorage,
     2. injects app bar + nav + footer + dialog around <main id="page">,
     3. wires the theme toggle and points the language link at this page's
        counterpart in the other language,
     4. highlights the current page (from <body data-page="...">).

   Language belongs to the URL, not to the visitor: the Chinese pages live at
   the root and the English ones under /en/, so switching language is a
   navigation rather than an in-place repaint. Theme still persists in
   localStorage (an origin-wide store) and survives moving between pages.
   ========================================================================= */
(function () {
  "use strict";

  var META = window.SITE_META || { title: {}, subtitle: {}, footer: {} };
  var PAGES = Array.isArray(window.SITE_PAGES) ? window.SITE_PAGES : [];

  /* ---------- GitHub repo (drives the appbar star button) ---------- */
  var REPO = "tingwei161803/ai-sandbox-system-design";
  var REPO_URL = "https://github.com/" + REPO;

  /* ---------- chrome i18n (page content strings live in the data) ---------- */
  var I18N = {
    en: { close: "Close", menu: "Pages", skip: "Skip to content",
          groups: { architecture: "Architecture", learn: "Learn" } },
    zh: { close: "關閉", menu: "頁面", skip: "跳到內容",
          groups: { architecture: "架構", learn: "學習" } }
  };

  /* ---------- sandbox-safe localStorage ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- theme: an explicit choice wins, otherwise follow the OS ----------
     The old code wrote "light" to localStorage on every page view, so almost
     every returning visitor got pinned to light without ever choosing it. The
     choice now lives under a new key and is only written when the toggle is
     pressed; until then the page follows prefers-color-scheme. */
  var THEME_KEY = "sbx-theme";
  function systemTheme() {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    catch (e) { return "light"; }
  }
  function savedTheme() {
    var v = lsGet(THEME_KEY);
    return v === "dark" || v === "light" ? v : null;
  }

  /* ---------- global state ----------
     The URL decides the language, so <html lang> is what we read. localStorage
     must not seed it: a crawler has no localStorage and would always be handed
     the fallback, which is how one half of the site ended up with no address of
     its own — and why a first-time reader of the Chinese pages was shown
     English. Writing the choice back is gone too; the address carries it now. */
  function langFromDocument() {
    var declared = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return declared.indexOf("zh") === 0 ? "zh" : "en";
  }

  /* the same page in the other language — mirror the path, never guess */
  var TWIN_DIR = "/en";
  function altLangHref() {
    var path = location.pathname || "/";
    if (path === TWIN_DIR || path.indexOf(TWIN_DIR + "/") === 0) {
      return path.slice(TWIN_DIR.length) || "/";
    }
    return TWIN_DIR + path;
  }

  var state = {
    lang:  langFromDocument(),
    theme: savedTheme() || systemTheme()
  };

  /* ---------- helpers shared with app.js ---------- */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.en || obj.zh || "";
  }
  function ui(key) { return (I18N[state.lang] || I18N.en)[key]; }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function r(n) { return Math.round(n * 100) / 100; }

  function pageHref(p) { return p.slug === "home" ? "index.html" : p.slug + ".html"; }
  function currentSlug() { return document.body.getAttribute("data-page") || "home"; }
  function currentPage() {
    var slug = currentSlug();
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].slug === slug) return PAGES[i];
    return PAGES[0] || null;
  }

  /* =======================================================================
     CHROME INJECTION — app bar, nav, footer, dialog around <main id="page">
     ===================================================================== */
  function injectChrome() {
    var main = document.getElementById("page");
    if (!main) return;

    /* skip link */
    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#page";
    skip.id = "skipLink";
    document.body.insertBefore(skip, document.body.firstChild);

    /* app bar */
    var appbar = document.createElement("header");
    appbar.className = "appbar";
    appbar.innerHTML =
      '<div class="appbar__inner">' +
        '<button class="icon-btn navtoggle" id="navToggle" type="button" aria-controls="pageNav" aria-expanded="false">' +
          '<span class="material-symbols-rounded" aria-hidden="true">menu</span>' +
          '<span class="navtoggle__txt" id="navToggleTxt"></span>' +
        '</button>' +
        '<a class="brand" href="index.html">' +
          /* the mark is the site's idea in miniature: code inside three walls */
          '<svg class="brand__logo" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">' +
            '<circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2.2"/>' +
            '<circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
            '<circle cx="16" cy="16" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
            '<rect class="brand__core" x="13.5" y="13.5" width="5" height="5" rx="1"/>' +
          '</svg>' +
          '<span class="brand__name" id="brandName"></span>' +
        '</a>' +
        '<div class="appbar__actions">' +
          '<a class="gh-star" id="ghStar" href="' + escapeHtml(REPO_URL) + '" target="_blank" rel="noopener" ' +
            'title="Star on GitHub" aria-label="Star on GitHub / 在 GitHub 給星星">' +
            '<span class="material-symbols-rounded">star</span>' +
            '<span class="gh-star__count" id="ghStarCount" hidden></span>' +
          '</a>' +
          '<a class="icon-btn" id="langToggle" href="' + escapeHtml(altLangHref()) + '" ' +
             'hreflang="' + (state.lang === "en" ? "zh-Hant" : "en") + '" rel="alternate" ' +
             'title="Language" aria-label="' +
             (state.lang === "en" ? "切換到中文版 / View in Chinese" : "View in English / 切換到英文版") + '">' +
            '<span class="material-symbols-rounded">translate</span>' +
            '<span class="icon-btn__txt" id="langLabel"></span>' +
          '</a>' +
          '<button class="icon-btn" id="themeToggle" type="button" title="Theme" aria-label="Toggle theme / 切換主題">' +
            '<span class="material-symbols-rounded" id="themeIcon">dark_mode</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(appbar, main);

    /* cross-page nav */
    var nav = document.createElement("nav");
    nav.className = "pagenav";
    nav.id = "pageNav";
    nav.innerHTML = '<div class="pagenav__inner" id="pageNavInner"></div>';
    document.body.insertBefore(nav, main);

    /* scrim behind the nav when it opens as a sheet on small screens */
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    scrim.id = "navScrim";
    scrim.hidden = true;
    document.body.insertBefore(scrim, main);
    document.body.classList.add("has-shell");

    /* footer */
    var footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = '<p class="footer__text" id="footerText"></p>' +
      '<div class="profile-links">' +
        '<a class="icon-btn" href="https://www.peteraim.com" target="_blank" rel="noopener" title="Home" aria-label="Back to peteraim.com / 返回首頁">' +
          '<span class="material-symbols-rounded">home</span>' +
        '</a>' +
        '<a class="icon-btn" href="https://www.linkedin.com/in/ai-med/" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn (opens in new tab)">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>' +
        '</a>' +
      '</div>';
    main.parentNode.insertBefore(footer, main.nextSibling);

    /* The static "English version / 中文版" link sits after the scripts so it
       exists without JS; with JS it moves into the footer instead of floating
       below it. */
    var alt = document.querySelector(".lang-alt-link");
    if (alt) { alt.removeAttribute("style"); footer.appendChild(alt); }

    /* shared detail dialog (used by card layouts) */
    var dialog = document.createElement("dialog");
    dialog.className = "dialog";
    dialog.id = "dialog";
    dialog.setAttribute("aria-labelledby", "dialogTitle");
    dialog.innerHTML =
      '<div class="dialog__bar">' +
        '<span class="dialog__spacer"></span>' +
        '<button class="icon-btn" id="dialogClose" type="button" aria-label="Close / 關閉">' +
          '<span class="material-symbols-rounded">close</span>' +
        '</button>' +
      '</div>' +
      '<div class="dialog__body" id="dialogBody"></div>';
    document.body.appendChild(dialog);

    /* dialog wiring (shared close behaviour; deep links handled by app.js) */
    document.getElementById("dialogClose").addEventListener("click", function () {
      if (dialog.open) dialog.close();
    });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  function paintNav() {
    var inner = document.getElementById("pageNavInner");
    if (!inner) return;
    inner.innerHTML = "";
    var here = currentSlug();
    var groups = [];
    PAGES.forEach(function (p) {
      var key = p.group || "architecture";
      var g = groups.filter(function (x) { return x.key === key; })[0];
      if (!g) { g = { key: key, pages: [] }; groups.push(g); }
      g.pages.push(p);
    });
    var labels = ui("groups") || {};
    groups.forEach(function (g) {
      var sec = document.createElement("div");
      sec.className = "navgroup";
      var html = '<p class="navgroup__label" id="navgroup-' + escapeHtml(g.key) + '">' +
        escapeHtml(labels[g.key] || g.key) + "</p>" +
        '<ul class="navgroup__list" aria-labelledby="navgroup-' + escapeHtml(g.key) + '">';
      g.pages.forEach(function (p) {
        var on = p.slug === here;
        html += '<li><a class="navlink' + (on ? " navlink--active" : "") + '" href="' + escapeHtml(pageHref(p)) + '"' +
          (on ? ' aria-current="page"' : "") + ">" +
          '<span class="material-symbols-rounded" aria-hidden="true">' + escapeHtml(p.icon || "label") + "</span>" +
          "<span>" + escapeHtml(t(p.title)) + "</span></a></li>";
      });
      sec.innerHTML = html + "</ul>";
      inner.appendChild(sec);
    });
  }

  /* ---------- small screens: the nav opens as a bottom sheet ---------- */
  function setNavOpen(open) {
    var btn = document.getElementById("navToggle");
    var scrim = document.getElementById("navScrim");
    document.body.classList.toggle("nav-open", open);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (scrim) scrim.hidden = !open;
    if (open) {
      var first = document.querySelector("#pageNav .navlink--active") || document.querySelector("#pageNav .navlink");
      if (first) first.focus();
    }
  }
  function wireNav() {
    var btn = document.getElementById("navToggle");
    var scrim = document.getElementById("navScrim");
    if (btn) btn.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });
    if (scrim) scrim.addEventListener("click", function () { setNavOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNavOpen(false);
        if (btn) btn.focus();
      }
    });
    var mq = window.matchMedia ? window.matchMedia("(min-width: 1024px)") : null;
    if (mq && mq.addEventListener) mq.addEventListener("change", function () { setNavOpen(false); });
  }

  /* ---------- chrome text in the active language ---------- */
  function refreshChrome() {
    var page = currentPage();
    var siteTitle = t(META.title);
    var pageTitle = page ? t(page.title) : "";
    document.title = (pageTitle && currentSlug() !== "home") ? pageTitle + " · " + siteTitle : siteTitle;

    var brand = document.getElementById("brandName");
    if (brand) {
      /* "AI Sandbox" always shows; the rest of the name drops on narrow screens */
      var head = siteTitle.indexOf("AI Sandbox") === 0 ? "AI Sandbox" : siteTitle;
      brand.innerHTML = "<b>" + escapeHtml(head) + "</b>" +
        (siteTitle.length > head.length ? '<span class="brand__rest">' + escapeHtml(siteTitle.slice(head.length)) + "</span>" : "");
    }
    var navTxt = document.getElementById("navToggleTxt");
    if (navTxt) navTxt.textContent = ui("menu");
    var navBtn = document.getElementById("navToggle");
    if (navBtn) navBtn.setAttribute("aria-label", ui("menu"));
    var foot = document.getElementById("footerText");
    if (foot) foot.textContent = t(META.footer);
    var skip = document.getElementById("skipLink");
    if (skip) skip.textContent = ui("skip");
    var nav = document.getElementById("pageNav");
    if (nav) nav.setAttribute("aria-label", ui("menu"));
    var dc = document.getElementById("dialogClose");
    if (dc) dc.setAttribute("aria-label", ui("close"));
    paintNav();
  }

  /* =======================================================================
     THEME + LANGUAGE
     ===================================================================== */
  function applyTheme(persist) {
    document.documentElement.setAttribute("data-theme", state.theme);
    var icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = state.theme === "dark" ? "light_mode" : "dark_mode";
    if (persist) lsSet(THEME_KEY, state.theme);
  }
  /* The toggle is a link now, so it is labelled with the language it leads TO,
     not the one already on screen. */
  function applyLangChrome() {
    var label = document.getElementById("langLabel");
    if (label) label.textContent = state.lang === "en" ? "中" : "EN";
  }

  function wire() {
    document.getElementById("themeToggle").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(true);
    });
    /* no explicit choice yet: keep following the OS if it flips */
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (savedTheme()) return;
        state.theme = e.matches ? "dark" : "light";
        applyTheme(false);
      });
    } catch (e) { /* old browsers: no live follow */ }
  }

  /* ---------- live GitHub star count (no auth; degrades silently) ----------
     api.github.com allows 60 unauthenticated calls an hour per IP and answers
     403 after that, which showed up as "0" and as a console error. shields.io
     serves the same count as JSON with CORS and its own caching, so visitors
     never hit that limit. The answer (or a failure, stored as "") is kept for
     the session, and a number appears only when there is a real one. */
  var STAR_KEY = "gh-stars:" + REPO;
  function showStars(txt) {
    var el = document.getElementById("ghStarCount");
    if (!el) return;
    var ok = /^[0-9]+(\.[0-9]+)?[kKmM]?$/.test(txt || "") && !/^0+$/.test(txt);
    el.textContent = ok ? txt : "";
    el.hidden = !ok;
  }
  function fetchStars() {
    var cached = ssGet(STAR_KEY);
    if (cached !== null) { showStars(cached); return; }
    if (typeof fetch !== "function") return;
    fetch("https://img.shields.io/github/stars/" + REPO + ".json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var txt = j && j.message != null ? String(j.message).trim() : "";
        ssSet(STAR_KEY, txt);
        showStars(txt);
      })
      .catch(function () { ssSet(STAR_KEY, ""); showStars(""); });
  }

  /* =======================================================================
     PUBLIC TOOLKIT (app.js uses this)
     ===================================================================== */
  window.LDW = {
    ready: false,          // flipped true once the chrome (incl. #dialog) is injected
    state: state,
    t: t, ui: ui, escapeHtml: escapeHtml, r: r,
    lsGet: lsGet, lsSet: lsSet,
    pages: PAGES, meta: META,
    currentPage: currentPage, currentSlug: currentSlug, pageHref: pageHref,
    refreshChrome: refreshChrome,
    dialog: function () { return document.getElementById("dialog"); }
  };

  /* =======================================================================
     INIT
     ===================================================================== */
  function init() {
    injectChrome();
    applyTheme(false);
    applyLangChrome();
    refreshChrome();
    wire();
    wireNav();
    fetchStars();
    window.LDW.ready = true;
    document.dispatchEvent(new CustomEvent("ldw:shell-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
