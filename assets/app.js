/* =========================================================================
   multipage · app.js   (vanilla, no build, no chart lib)

   The PAGE-LEVEL LAYOUT ENGINE. shell.js has already injected the shared
   chrome and published window.LDW. This script:

     1. reads the current page from <body data-page="..."> (via LDW),
     2. picks a renderer from RENDERERS by that page's `layout`,
     3. paints it into <main id="page"> and wires its interactions.

   The language comes from the URL (see shell.js), so the body is painted once
   per page load — there is no in-place language switch to subscribe to.

   RENDERERS is the LAYOUT REGISTRY — one entry per supported page layout:
     hub | blueprint | gallery | article | dashboard | timeline | table |
     bento | kanban | faq | comparison | leaderboard | scrolly | map
   To add a layout, add one renderer (returns the inner HTML for #page) and,
   if it needs interaction, one matching WIRE entry. Nothing else changes.
   ========================================================================= */
(function () {
  "use strict";

  function boot() {
    // Wait until shell.js has injected the chrome (app bar, nav, footer, #dialog)
    // and published LDW. End-of-body scripts run while readyState === "loading",
    // so the shell defers its injection to DOMContentLoaded — we must wait for it.
    if (!window.LDW || !window.LDW.ready) {
      document.addEventListener("ldw:shell-ready", boot, { once: true });
      return;
    }
    var L = window.LDW;

    var t = L.t, esc = L.escapeHtml, r = L.r;
    var pageEl = document.getElementById("page");
    var teardowns = [];   // observers / listeners to disconnect before each repaint

    /* ---------- shared bits ---------- */
    function head(p) {
      var sub = t(p.subtitle)
        ? '<p class="page-head__sub">' + esc(t(p.subtitle)) + "</p>" : "";
      return '<header class="page-head"><h1>' + esc(t(p.title)) + "</h1>" + sub + "</header>";
    }

    function barChart(series, accent) {
      var W = 520, H = 240, padL = 16, padR = 16, padT = 16, padB = 44;
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var max = Math.max.apply(null, series.map(function (d) { return d.value; }).concat([1]));
      var n = series.length || 1, gap = 14, bw = (plotW - gap * (n - 1)) / n, baseY = padT + plotH;
      var bars = series.map(function (d, i) {
        var x = padL + i * (bw + gap), h = (d.value / max) * plotH, y = baseY - h;
        var label = esc(t(d.label)), val = esc(String(d.value));
        return '<rect class="bar-rect" x="' + r(x) + '" y="' + r(y) + '" width="' + r(bw) +
          '" height="' + r(h) + '" rx="5"' + (accent ? ' style="fill:' + esc(accent) + '"' : "") +
          '><title>' + label + ": " + val + "</title></rect>" +
          '<text class="bar-value" x="' + r(x + bw / 2) + '" y="' + r(y - 6) + '" text-anchor="middle">' + val + "</text>" +
          '<text class="bar-label" x="' + r(x + bw / 2) + '" y="' + r(baseY + 18) + '" text-anchor="middle">' + label + "</text>";
      }).join("");
      return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="bar chart">' +
        '<line class="axis-line" x1="' + padL + '" y1="' + r(baseY) + '" x2="' + r(W - padR) + '" y2="' + r(baseY) + '" />' +
        bars + "</svg>";
    }

    function lineChart(points) {
      var W = 520, H = 240, padL = 28, padR = 16, padT = 16, padB = 32;
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var ys = points.map(function (d) { return d.y; });
      var max = Math.max.apply(null, ys.concat([1])), min = Math.min.apply(null, ys.concat([0]));
      var span = (max - min) || 1, n = points.length || 1;
      var xy = points.map(function (d, i) {
        var x = padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
        var y = padT + plotH - ((d.y - min) / span) * plotH;
        return { x: x, y: y, d: d };
      });
      var path = xy.map(function (pt, i) { return (i ? "L" : "M") + r(pt.x) + " " + r(pt.y); }).join(" ");
      var area = path + " L" + r(xy[xy.length - 1].x) + " " + r(padT + plotH) + " L" + r(xy[0].x) + " " + r(padT + plotH) + " Z";
      var dots = xy.map(function (pt) {
        return '<circle class="line-dot" cx="' + r(pt.x) + '" cy="' + r(pt.y) + '" r="3"><title>' +
          esc(String(pt.d.x)) + ": " + esc(String(pt.d.y)) + "</title></circle>";
      }).join("");
      var labels = xy.map(function (pt) {
        return '<text class="bar-label" x="' + r(pt.x) + '" y="' + r(padT + plotH + 20) + '" text-anchor="middle">' + esc(String(pt.d.x)) + "</text>";
      }).join("");
      return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="line chart">' +
        '<path class="line-area" d="' + area + '" />' +
        '<path class="line-path" d="' + path + '" fill="none" />' + dots + labels + "</svg>";
    }

    /* =====================================================================
       LAYOUT REGISTRY
       ===================================================================== */
    var RENDERERS = {

      /* ---- hub: hero stats + a card linking to every other page ---- */
      hub: function (p) {
        var stats = (p.stats || []).map(function (s) {
          return '<div class="hero__stat" data-item>' +
            '<b class="hero__stat-value" data-count="' + esc(String(s.value)) + '">0</b>' +
            '<span class="hero__stat-label">' + esc(t(s.label)) + "</span></div>";
        }).join("");
        var cards = L.pages.filter(function (q) { return q.slug !== "home"; }).map(function (q) {
          return '<a class="card card--nav" data-item href="' + esc(L.pageHref(q)) + '" ' +
              'aria-label="' + esc(t(q.title)) + '">' +
            '<span class="material-symbols-rounded card__icon" aria-hidden="true">' + esc(q.icon || "label") + "</span>" +
            '<h3 class="card__title">' + esc(t(q.title)) + "</h3>" +
            '<p class="card__summary">' + esc(t(q.subtitle)) + "</p></a>";
        }).join("");
        return head(p) +
          (stats ? '<div class="hero__stats">' + stats + "</div>" : "") +
          '<div class="grid">' + cards + "</div>";
      },

      /* ---- blueprint: the home page. Hero diagram of the four walls around
              the untrusted code, the five layers as bands, then the learning
              tools. Every other page is reachable from here. ---- */
      blueprint: function (p) {
        var lang = L.state.lang;
        function pg(slug) { return L.pages.filter(function (q) { return q.slug === slug; })[0] || null; }
        function href(slug, hash) { var q = pg(slug); return q ? L.pageHref(q) + (hash ? "#" + hash : "") : "#"; }
        var S = p.sections || {};

        /* --- the diagram --- */
        var C = 300, RADII = [118, 168, 218, 268];
        var ANG = [35, 145, -145, -58];          /* where each wall stops its escape attempt */
        var rings = p.rings || [];
        function xy(rad, deg) { var a = deg * Math.PI / 180; return { x: r(C + rad * Math.cos(a)), y: r(C + rad * Math.sin(a)) }; }
        var svgRings = rings.map(function (rg, i) {
          var R = RADII[i] || (RADII[RADII.length - 1] + 50 * (i - 3));
          var lr = R - 13;   /* label runs just inside its own wall */
          var arc = "M " + r(C - lr) + " " + C + " A " + lr + " " + lr + " 0 0 1 " + r(C + lr) + " " + C;
          var ticks = "";
          if (i === rings.length - 1) {     /* the outermost wall is a clock: it is the timeout */
            for (var k = 0; k < 60; k++) {
              var a1 = xy(R + 4, k * 6), a2 = xy(R + (k % 5 ? 9 : 14), k * 6);
              ticks += '<line class="ring__tick" x1="' + a1.x + '" y1="' + a1.y + '" x2="' + a2.x + '" y2="' + a2.y + '"/>';
            }
          }
          return '<a class="ring ring--' + (i + 1) + '" href="' + esc(href("isolation", rg.slug)) + '" data-ring="' + i + '" ' +
              'aria-label="' + esc(rg.name + " — " + t(rg.asks)) + '">' +
            '<path id="ringpath-' + i + '" d="' + arc + '" fill="none" stroke="none"/>' +
            '<circle class="ring__hit" cx="' + C + '" cy="' + C + '" r="' + R + '"/>' +
            '<circle class="ring__line" cx="' + C + '" cy="' + C + '" r="' + R + '"/>' + ticks +
            '<text class="ring__name"><textPath href="#ringpath-' + i + '" startOffset="50%" text-anchor="middle">' +
              esc(rg.name) + "</textPath></text></a>";
        }).join("");
        var attempts = rings.map(function (rg, i) {
          var R = RADII[i] || 300, deg = ANG[i] == null ? 0 : ANG[i];
          var s0 = xy(96, deg), s1 = xy(R - 6, deg), x0 = xy(R, deg), lab = xy(R + 16, deg);
          var right = Math.cos(deg * Math.PI / 180) >= 0;
          var c = 6, cx = x0.x, cy = x0.y;
          return '<g class="attempt attempt--' + (i + 1) + '" data-ring="' + i + '">' +
            '<line class="attempt__path" x1="' + s0.x + '" y1="' + s0.y + '" x2="' + s1.x + '" y2="' + s1.y + '"/>' +
            '<path class="attempt__stop" d="M' + r(cx - c) + " " + r(cy - c) + "L" + r(cx + c) + " " + r(cy + c) +
              "M" + r(cx + c) + " " + r(cy - c) + "L" + r(cx - c) + " " + r(cy + c) + '"/>' +
            '<text class="attempt__label" x="' + lab.x + '" y="' + r(lab.y + 5) + '" text-anchor="' + (right ? "start" : "end") + '">' +
              esc(rg.blocked || "") + "</text></g>";
        }).join("");
        var core = p.core || {};
        var svg = '<svg class="rings" viewBox="-10 -10 620 620" role="img" aria-labelledby="ringsTitle">' +
          '<title id="ringsTitle">' + esc(t(core.label)) + ": " +
            esc(rings.map(function (rg) { return rg.name; }).join(" → ")) + "</title>" +
          svgRings + attempts +
          '<g class="core">' +
            '<rect class="core__box" x="212" y="265" width="176" height="70" rx="6"/>' +
            '<text class="core__code" x="300" y="298" text-anchor="middle">' + esc(core.code || "") + "</text>" +
            '<text class="core__label" x="300" y="320" text-anchor="middle">' + esc(t(core.label)) + "</text>" +
          "</g></svg>";

        /* --- the four walls, readable as text --- */
        var legend = rings.map(function (rg, i) {
          return '<li><a class="wall" href="' + esc(href("isolation", rg.slug)) + '" data-ring="' + i + '">' +
            '<span class="wall__name">' + esc(rg.name) + "</span>" +
            '<span class="wall__asks">' + esc(t(rg.asks)) + "</span>" +
            '<span class="wall__note">' + esc(t(rg.note)) + "</span>" +
            '<code class="wall__blocked">' + esc(rg.blocked || "") + "</code></a></li>";
        }).join("");

        /* --- the spec block: the old stat boxes, now a drawing's title block --- */
        var spec = (p.stats || []).map(function (s) {
          return '<div class="spec__row"><dt>' + esc(t(s.label)) + "</dt><dd>" + esc(String(s.value)) + "</dd></div>";
        }).join("");

        var log = (p.log || []).map(function (ln) {
          return '<li class="log__line log__line--' + esc(String(ln.verdict).toLowerCase()) + '">' +
            '<b class="log__verdict">' + esc(ln.verdict) + "</b> " + esc(ln.text) + "</li>";
        }).join("");

        var ctas = (p.cta || []).map(function (c, i) {
          return '<a class="btn' + (i ? " btn--ghost" : " btn--primary") + '" href="' + esc(c.href) + '">' + esc(t(c.label)) + "</a>";
        }).join("");

        /* "AI Sandbox" on its own line, the rest of the name under it */
        var full = t(p.heading) || t(L.meta.title), cut = full.indexOf("AI Sandbox") === 0 ? 10 : full.length;
        var title = '<span class="hero__title-a">' + esc(full.slice(0, cut)) + "</span>" +
          (cut < full.length ? ' <span class="hero__title-b">' + esc(full.slice(cut).trim()) + "</span>" : "");

        var hero =
          '<section class="hero" aria-labelledby="heroTitle">' +
            '<div class="hero__grid">' +
              '<div class="hero__text">' +
                '<h1 class="hero__title" id="heroTitle">' + title + "</h1>" +
                '<p class="hero__thesis">' + esc(t(p.subtitle)) + "</p>" +
                '<div class="hero__cta">' + ctas + "</div>" +
                '<h2 class="hero__walls-title">' + esc(t(S.walls)) + "</h2>" +
                '<ol class="walls">' + legend + "</ol>" +
              "</div>" +
              '<div class="hero__figure">' + svg +
                '<dl class="spec" aria-label="' + esc(t(S.spec)) + '">' + spec + "</dl>" +
              "</div>" +
            "</div>" +
            '<ol class="log" aria-label="syscall log">' + log + "</ol>" +
          "</section>";

        /* --- five layers as bands --- */
        var arch = pg("architecture");
        var bands = ((arch && arch.layers) || []).map(function (ly, i) {
          var items = (ly.items || []).map(function (it) { return "<li>" + esc(t(it)) + "</li>"; }).join("");
          return '<li><a class="band' + (ly.accent ? " band--core" : "") + '" href="' + esc(href("components", ly.slug)) + '">' +
            '<span class="band__idx">L' + (i + 1) + "</span>" +
            '<span class="band__name">' + esc(t(ly.name)) + "</span>" +
            '<span class="band__role">' + esc(t(ly.role)) + "</span>" +
            '<ul class="band__items">' + items + "</ul></a></li>";
        }).join("");
        var layers =
          '<section class="home-sec home-layers" aria-labelledby="layersTitle">' +
            '<div class="home-sec__head">' +
              '<h2 id="layersTitle">' + esc(t(S.layers)) + "</h2>" +
              '<p>' + esc(t(S.layersNote)) + "</p>" +
            "</div>" +
            '<ol class="bands">' + bands + "</ol>" +
            '<p class="home-sec__more"><a class="textlink" href="' + esc(href("architecture")) + '">' + esc(t(S.layersMore)) + "</a></p>" +
          "</section>";

        /* --- why: the line the design page is built around --- */
        var design = pg("design"), quote = "";
        ((design && design.sections) || []).forEach(function (sec) {
          (sec.blocks || []).forEach(function (b) { if (!quote && b.type === "quote") quote = t(b.text); });
        });
        var why = quote ?
          '<section class="home-sec home-why">' +
            '<blockquote class="why__quote"><p>' + esc(quote) + "</p></blockquote>" +
            '<p class="why__more"><a class="textlink" href="' + esc(href("design")) + '">' + esc(t(S.why)) + "</a></p>" +
          "</section>" : "";

        /* --- learn: four tools, each drawn as what it is --- */
        var roles = pg("roles"), gl = pg("glossary"), qz = pg("quiz"), fc = pg("flashcards");
        var learn = "";
        if (roles) {
          learn += '<a class="tool tool--roles" href="' + esc(href("roles")) + '">' +
            '<span class="tool__title">' + esc(t(roles.title)) + "</span>" +
            '<span class="tool__sub">' + esc(t(roles.subtitle)) + "</span>" +
            '<ul class="tool__roles">' + (roles.roles || []).map(function (ro) {
              return '<li><span class="material-symbols-rounded" aria-hidden="true">' + esc(ro.icon || "badge") + "</span>" + esc(t(ro.name)) + "</li>";
            }).join("") + "</ul></a>";
        }
        if (gl) {
          var term = (gl.terms || []).filter(function (x) { return t(x.term) === "Seccomp-BPF"; })[0] || (gl.terms || [])[0] || {};
          learn += '<a class="tool tool--term" href="' + esc(href("glossary")) + '">' +
            '<span class="tool__title">' + esc(t(gl.title)) + '<span class="tool__count">' + (gl.terms || []).length + "</span></span>" +
            '<span class="term" aria-hidden="true"><span class="term__prompt">$ man ' + esc(String(t(term.term)).toLowerCase()) + "</span>" +
              '<span class="term__out">' + esc(t(term.def)) + '</span><span class="term__cursor">_</span></span>' +
            '<span class="tool__sub">' + esc(t(gl.subtitle)) + "</span></a>";
        }
        if (qz) {
          var q0 = (qz.questions || [])[0] || {};
          learn += '<a class="tool tool--quiz" href="' + esc(href("quiz")) + '">' +
            '<span class="tool__title">' + esc(t(qz.title)) + '<span class="tool__count">' + (qz.questions || []).length + "</span></span>" +
            '<span class="mini-q" aria-hidden="true"><span class="mini-q__q">' + esc(t(q0.q)) + "</span>" +
              (q0.options || []).map(function (o, oi) {
                return '<span class="mini-q__o' + (oi === q0.answer ? " mini-q__o--hint" : "") + '">' + esc(t(o)) + "</span>";
              }).join("") + "</span>" +
            '<span class="tool__sub">' + esc(t(qz.subtitle)) + "</span></a>";
        }
        if (fc) {
          var c0 = (fc.cards || []).filter(function (x) { return t(x.front) === "TOCTOU"; })[0] || (fc.cards || [])[0] || {};
          learn += '<a class="tool tool--cards" href="' + esc(href("flashcards")) + '">' +
            '<span class="tool__title">' + esc(t(fc.title)) + '<span class="tool__count">' + (fc.cards || []).length + "</span></span>" +
            '<span class="stack" aria-hidden="true"><span class="stack__card stack__card--back"></span>' +
              '<span class="stack__card stack__card--mid"></span>' +
              '<span class="stack__card stack__card--front">' + esc(t(c0.front)) + "</span></span>" +
            '<span class="tool__sub">' + esc(t(fc.subtitle)) + "</span></a>";
        }
        var learnSec = learn ?
          '<section class="home-sec home-learn" aria-labelledby="learnTitle">' +
            '<div class="home-sec__head"><h2 id="learnTitle">' + esc(t(S.learn)) + "</h2></div>" +
            '<div class="tools">' + learn + "</div></section>" : "";

        return hero + layers + why + learnSec;
      },

      /* ---- gallery: search + chips + card grid + dialog ---- */
      gallery: function (p) {
        var cats = (p.categories || []).map(function (c) {
          return '<button class="chip" type="button" data-cat="' + esc(c.key) + '">' +
            esc(c[L.state.lang] || c.en) + "</button>";
        }).join("");
        var allLabel = L.state.lang === "en" ? "All" : "全部";
        return head(p) +
          '<div class="toolbar">' +
            '<input id="search" class="search" type="search" autocomplete="off" ' +
              'placeholder="' + (L.state.lang === "en" ? "Search…" : "搜尋…") + '" ' +
              'aria-label="' + (L.state.lang === "en" ? "Search" : "搜尋") + '" />' +
            (cats ? '<div class="chips"><button class="chip chip--active" type="button" data-cat="">' + esc(allLabel) + "</button>" + cats + "</div>" : "") +
          "</div>" +
          '<p class="result-count" id="resultCount" aria-live="polite"></p>' +
          '<div class="grid" id="grid"></div>';
      },

      /* ---- article: sticky TOC + prose + reading progress ---- */
      article: function (p) {
        var toc = (p.sections || []).map(function (s) {
          return '<a class="toc-link" href="#' + esc(s.id) + '" data-toc="' + esc(s.id) + '">' + esc(t(s.heading)) + "</a>";
        }).join("");
        var body = (p.sections || []).map(function (s) {
          var blocks = (s.blocks || []).map(function (b) {
            if (b.type === "h3") return "<h3>" + esc(t(b.text)) + "</h3>";
            if (b.type === "quote") return "<blockquote>" + esc(t(b.text)) + "</blockquote>";
            if (b.type === "code") return "<pre><code>" + esc(t(b.text)) + "</code></pre>";
            if (b.type === "ul") {
              var arr = (b.items && (b.items[L.state.lang] || b.items.en || b.items.zh)) || [];
              return "<ul>" + arr.map(function (li) { return "<li>" + esc(li) + "</li>"; }).join("") + "</ul>";
            }
            return "<p>" + esc(t(b.text)) + "</p>";
          }).join("");
          return '<section class="article-section" id="' + esc(s.id) + '" data-item ' +
            'aria-labelledby="' + esc(s.id) + '-h"><h2 id="' + esc(s.id) + '-h">' + esc(t(s.heading)) + "</h2>" + blocks + "</section>";
        }).join("");
        return '<div class="reading-progress" id="readingProgress" aria-hidden="true"></div>' +
          head(p) +
          '<div class="article-layout">' +
            '<nav class="toc" aria-label="Contents"><div class="toc__inner">' + toc + "</div></nav>" +
            '<div class="article-body prose">' + body + "</div>" +
          "</div>";
      },

      /* ---- dashboard: stat cards + bar + line + table ---- */
      dashboard: function (p) {
        var stats = (p.stats || []).map(function (s) {
          var d = s.delta;
          var deltaHtml = (d === 0 || d) ?
            '<span class="stat-delta stat-delta--' + (d >= 0 ? "up" : "down") + '">' +
              (d >= 0 ? "▲ " : "▼ ") + esc(String(Math.abs(d))) + "%</span>" : "";
          return '<div class="stat-card" data-item>' +
            '<span class="stat-label">' + esc(t(s.label)) + "</span>" +
            '<b class="stat-value">' + esc(String(s.value)) +
              (t(s.unit) ? ' <span class="stat-unit">' + esc(t(s.unit)) + "</span>" : "") + "</b>" +
            deltaHtml + "</div>";
        }).join("");
        var bars = p.bars ? '<figure class="panel" data-item><figcaption>' + esc(t(p.bars.title)) + "</figcaption>" +
          '<div class="chart-wrap">' + barChart(p.bars.series || []) + "</div></figure>" : "";
        var line = p.line ? '<figure class="panel" data-item><figcaption>' + esc(t(p.line.title)) + "</figcaption>" +
          '<div class="chart-wrap">' + lineChart(p.line.points || []) + "</div></figure>" : "";
        var table = "";
        if (p.table) {
          var thead = (p.table.columns || []).map(function (c) { return "<th>" + esc(t(c.label)) + "</th>"; }).join("");
          var tbody = (p.table.rows || []).map(function (row) {
            return "<tr data-item>" + (p.table.columns || []).map(function (c) {
              var v = row[c.key];
              return "<td>" + esc(typeof v === "object" ? t(v) : String(v == null ? "" : v)) + "</td>";
            }).join("") + "</tr>";
          }).join("");
          table = '<div class="panel panel--wide" data-item><div class="table-wrap"><table class="data-table">' +
            "<thead><tr>" + thead + "</tr></thead><tbody>" + tbody + "</tbody></table></div></div>";
        }
        return head(p) +
          '<div class="stat-grid">' + stats + "</div>" +
          '<div class="panel-grid">' + bars + line + "</div>" + table;
      },

      /* ---- timeline: dated event cards down a rail ---- */
      timeline: function (p) {
        var items = (p.events || []).map(function (ev, i) {
          return '<li class="tl-item' + (ev.accent ? " tl-item--core" : "") + '" data-item>' +
            '<div class="tl-dot" aria-hidden="true">' + (i + 1) + "</div>" +
            '<div class="tl-card"><span class="tl-date">' + esc(t(ev.date)) + "</span>" +
            '<h3 class="tl-title">' + esc(t(ev.title)) + "</h3>" +
            '<p class="tl-body">' + esc(t(ev.body)) + "</p></div></li>";
        }).join("");
        return head(p) + '<ol class="timeline">' + items + "</ol>";
      },

      /* ---- table: searchable + sortable ---- */
      table: function (p) {
        return head(p) +
          '<div class="toolbar">' +
            '<input id="search" class="search" type="search" autocomplete="off" ' +
              'placeholder="' + (L.state.lang === "en" ? "Search…" : "搜尋…") + '" ' +
              'aria-label="' + (L.state.lang === "en" ? "Search" : "搜尋") + '" />' +
            '<div class="chips" id="tableChips"></div>' +
          "</div>" +
          '<div class="table-wrap"><table class="data-table" id="dataTable"><thead></thead><tbody></tbody></table></div>';
      },

      /* ---- bento: asymmetric tile grid ---- */
      bento: function (p) {
        var tiles = (p.tiles || []).map(function (tile) {
          return '<article class="tile tile--' + esc(tile.size || "sm") + (tile.accent ? " tile--accent" : "") + '" data-item>' +
            (tile.icon ? '<span class="material-symbols-rounded tile__icon" aria-hidden="true">' + esc(tile.icon) + "</span>" : "") +
            (tile.value ? '<b class="tile__value">' + esc(tile.value) + "</b>" : "") +
            '<h3 class="tile__title">' + esc(t(tile.title)) + "</h3>" +
            (t(tile.body) ? '<p class="tile__body">' + esc(t(tile.body)) + "</p>" : "") + "</article>";
        }).join("");
        return head(p) + '<div class="bento">' + tiles + "</div>";
      },

      /* ---- kanban: cards grouped by status column ---- */
      kanban: function (p) {
        var cols = (p.columns || []).map(function (col) {
          var cards = (p.cards || []).filter(function (c) { return c.column === col.key; }).map(function (c) {
            var tags = (c.tags || []).map(function (g) { return '<span class="tag">' + esc(g) + "</span>"; }).join("");
            return '<article class="kb-card" data-item><h3 class="kb-card__title">' + esc(t(c.title)) + "</h3>" +
              (t(c.body) ? '<p class="kb-card__body">' + esc(t(c.body)) + "</p>" : "") +
              (tags ? '<div class="card__tags">' + tags + "</div>" : "") + "</article>";
          }).join("");
          var count = (p.cards || []).filter(function (c) { return c.column === col.key; }).length;
          return '<div class="kb-col"><div class="kb-col__head">' + esc(t(col.label)) +
            ' <span class="kb-col__count">' + count + "</span></div>" +
            '<div class="kb-col__body">' + cards + "</div></div>";
        }).join("");
        return head(p) + '<div class="kanban">' + cols + "</div>";
      },

      /* ---- faq: searchable accordion ---- */
      faq: function (p) {
        var items = (p.qa || []).map(function (row) {
          return '<details class="acc-item" data-item data-q="' + esc((t(row.q) + " " + t(row.a)).toLowerCase()) + '">' +
            '<summary class="acc-q"><span>' + esc(t(row.q)) + "</span>" +
            '<span class="material-symbols-rounded acc-chevron" aria-hidden="true">expand_more</span></summary>' +
            '<div class="acc-a">' + esc(t(row.a)) + "</div></details>";
        }).join("");
        return head(p) +
          '<div class="toolbar"><input id="search" class="search" type="search" autocomplete="off" ' +
            'placeholder="' + (L.state.lang === "en" ? "Search…" : "搜尋…") + '" ' +
            'aria-label="' + (L.state.lang === "en" ? "Search" : "搜尋") + '" /></div>' +
          '<div class="accordion" id="accordion">' + items + "</div>";
      },

      /* ---- comparison: plans (cols) x features (rows) ---- */
      comparison: function (p) {
        var plans = p.plans || [], feats = p.features || [];
        var thead = '<th scope="col"></th>' + plans.map(function (pl) {
          return '<th scope="col" class="' + (pl.highlight ? "cmp-col--hl" : "") + '">' +
            '<div class="cmp-plan">' + esc(t(pl.name)) + "</div>" +
            '<div class="cmp-price">' + esc(t(pl.price)) + "</div>" +
            (t(pl.note) ? '<div class="cmp-note">' + esc(t(pl.note)) + "</div>" : "") + "</th>";
        }).join("");
        var rows = feats.map(function (f) {
          var cells = plans.map(function (pl) {
            var v = f.values ? f.values[pl.key] : undefined;
            var cell;
            if (v === true) cell = '<span class="cmp-yes material-symbols-rounded" aria-label="yes">check</span>';
            else if (v === false || v == null) cell = '<span class="cmp-no" aria-label="no">—</span>';
            else cell = esc(t(v));
            return '<td class="' + (pl.highlight ? "cmp-col--hl" : "") + '">' + cell + "</td>";
          }).join("");
          return '<tr data-item><th scope="row" class="cmp-feat">' + esc(t(f.label)) + "</th>" + cells + "</tr>";
        }).join("");
        return head(p) + '<div class="table-wrap"><table class="cmp-table">' +
          "<thead><tr>" + thead + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
      },

      /* ---- leaderboard: ranked list + tier grouping toggle ---- */
      leaderboard: function (p) {
        var listLabel = L.state.lang === "en" ? "List" : "排名";
        var tierLabel = L.state.lang === "en" ? "Tiers" : "階級";
        return head(p) +
          '<div class="seg" role="tablist">' +
            '<button class="seg__btn seg__btn--active" type="button" data-view="list">' + esc(listLabel) + "</button>" +
            '<button class="seg__btn" type="button" data-view="tier">' + esc(tierLabel) + "</button>" +
          "</div>" +
          '<div id="lbView"></div>';
      },

      /* ---- scrolly: sticky visual + stepped narrative ---- */
      scrolly: function (p) {
        var steps = (p.steps || []).map(function (s, i) {
          return '<div class="scrolly-step" data-item data-step="' + i + '"><p>' + esc(t(s.text)) + "</p></div>";
        }).join("");
        return head(p) +
          '<div class="scrolly">' +
            '<div class="scrolly-sticky"><div class="scrolly-visual" id="scrollyVisual"></div></div>' +
            '<div class="scrolly-steps">' + steps + "</div>" +
          "</div>";
      },

      /* ---- map: Leaflet map + list (needs Leaflet on the page) ---- */
      map: function (p) {
        return head(p) +
          '<div class="map-layout">' +
            '<div class="map-box" id="map" role="application" aria-label="Map"></div>' +
            '<ul class="map-list" id="mapList"></ul>' +
          "</div>";
      },

      /* ---- glossary: searchable term list (details) ---- */
      glossary: function (p) {
        return head(p) +
          '<div class="toolbar"><input id="search" class="search" type="search" autocomplete="off" ' +
            'placeholder="' + (L.state.lang === "en" ? "Search terms…" : "搜尋術語…") + '" ' +
            'aria-label="' + (L.state.lang === "en" ? "Search terms" : "搜尋術語") + '" /></div>' +
          '<p class="result-count" id="resultCount" aria-live="polite"></p>' +
          '<div class="glossary" id="glossary"></div>';
      },

      /* ---- quiz: multiple-choice + instant feedback + score (session-only) ---- */
      quiz: function (p) {
        var qs = p.questions || [];
        var cards = qs.map(function (q, qi) {
          var opts = (q.options || []).map(function (o, oi) {
            return '<button class="quiz-opt" type="button" data-o="' + oi + '">' + esc(t(o)) + "</button>";
          }).join("");
          return '<div class="quiz-card" data-item data-qi="' + qi + '">' +
            '<div class="quiz-q"><span class="quiz-num">' + (qi + 1) + "</span><span>" + esc(t(q.q)) + "</span></div>" +
            '<div class="quiz-opts">' + opts + "</div>" +
            '<div class="quiz-explain" hidden></div></div>';
        }).join("");
        var scoreLabel = L.state.lang === "en" ? "Score" : "得分";
        return head(p) +
          '<div class="quiz-score" aria-live="polite"><span class="quiz-score__label">' + esc(scoreLabel) +
            '</span> <b id="quizScoreVal">0 / ' + qs.length + "</b></div>" +
          '<div class="quiz" id="quiz">' + cards + "</div>";
      },

      /* ---- flashcards: click to flip (pure ephemeral) ---- */
      flashcards: function (p) {
        var cards = (p.cards || []).map(function (c) {
          return '<button class="flip" type="button" data-item aria-pressed="false">' +
            '<div class="flip__inner">' +
              '<div class="flip__face flip__front"><span>' + esc(t(c.front)) + "</span></div>" +
              '<div class="flip__face flip__back"><span>' + esc(t(c.back)) + "</span></div>" +
            "</div></button>";
        }).join("");
        return head(p) + '<div class="flip-grid" id="flips">' + cards + "</div>";
      },

      /* ---- archstack: layered architecture diagram (top-to-bottom flow) ---- */
      archstack: function (p) {
        var layers = p.layers || [];
        var blocks = layers.map(function (ly, i) {
          var items = (ly.items || []).map(function (it) {
            return '<span class="arch-chip">' + esc(t(it)) + "</span>";
          }).join("");
          var connector = i < layers.length - 1
            ? '<div class="arch-connector" aria-hidden="true"><span class="material-symbols-rounded">arrow_downward</span></div>'
            : "";
          var comp = L.pages.filter(function (q) { return q.slug === "components"; })[0];
          var name = esc(t(ly.name));
          if (comp && ly.slug) name = '<a href="' + esc(L.pageHref(comp) + "#" + ly.slug) + '">' + name + "</a>";
          return '<div class="arch-layer' + (ly.accent ? " arch-layer--accent" : "") + '" data-item>' +
              '<span class="arch-layer__idx" aria-hidden="true">L' + (i + 1) + "</span>" +
              '<div class="arch-layer__head">' +
                '<span class="material-symbols-rounded arch-layer__icon" aria-hidden="true">' + esc(ly.icon || "layers") + "</span>" +
                '<div class="arch-layer__titles">' +
                  '<div class="arch-layer__name">' + name + "</div>" +
                  (t(ly.role) ? '<div class="arch-layer__role">' + esc(t(ly.role)) + "</div>" : "") +
                "</div>" +
                (t(ly.tag) ? '<span class="arch-layer__tag">' + esc(t(ly.tag)) + "</span>" : "") +
              "</div>" +
              (items ? '<div class="arch-layer__items">' + items + "</div>" : "") +
            "</div>" + connector;
        }).join("");
        var intro = t(p.intro) ? '<p class="arch-intro">' + esc(t(p.intro)) + "</p>" : "";
        return head(p) + intro + '<div class="archstack">' + blocks + "</div>";
      },

      /* ---- roadmap: role -> skills, each skill tagged with a target level ---- */
      roadmap: function (p) {
        var levels = p.levels || [];
        var levelMap = {};
        levels.forEach(function (lv) { levelMap[lv.key] = lv.label; });
        function lvlText(k) { return levelMap[k] ? t(levelMap[k]) : k; }
        function depth(k) {
          for (var i = 0; i < levels.length; i++) if (levels[i].key === k) return i + 1;
          return 0;
        }
        function meter(k) {
          var d = depth(k), html = "";
          for (var i = 1; i <= levels.length; i++) html += "<i" + (i <= d ? ' class="on"' : "") + "></i>";
          return '<span class="meter" aria-hidden="true">' + html + "</span>";
        }

        var legendLabel = L.state.lang === "en" ? "Depth:" : "學到什麼程度？";
        var legend = '<span class="roadmap-legend__label">' + esc(legendLabel) + "</span>" +
          levels.map(function (lv) {
            return '<span class="legend-item">' + meter(lv.key) + '<span class="lvl lvl--' + esc(lv.key) + '">' + esc(t(lv.label)) + "</span>" +
              (t(lv.note) ? '<span class="legend-note">' + esc(t(lv.note)) + "</span>" : "") + "</span>";
          }).join("");

        var roles = (p.roles || []).map(function (role) {
          var skills = (role.skills || []).map(function (s) {
            return '<li class="skill">' +
              '<span class="skill__name">' + esc(t(s.name)) + "</span>" +
              '<span class="skill__lvl">' + meter(s.level) + '<span class="lvl lvl--' + esc(s.level) + '">' + esc(lvlText(s.level)) + "</span></span>" +
              (t(s.note) ? '<span class="skill__note">' + esc(t(s.note)) + "</span>" : "") +
              "</li>";
          }).join("");
          return '<section class="role-card" data-item>' +
              '<div class="role-card__head">' +
                '<span class="material-symbols-rounded role-card__icon" aria-hidden="true">' + esc(role.icon || "badge") + "</span>" +
                "<div>" +
                  '<h2 class="role-card__name">' + esc(t(role.name)) + "</h2>" +
                  (t(role.goal) ? '<p class="role-card__goal">' + esc(t(role.goal)) + "</p>" : "") +
                "</div>" +
              "</div>" +
              '<ul class="skill-list">' + skills + "</ul>" +
            "</section>";
        }).join("");

        var intro = t(p.intro) ? '<p class="arch-intro">' + esc(t(p.intro)) + "</p>" : "";
        return head(p) + intro +
          '<div class="roadmap-legend">' + legend + "</div>" +
          '<div class="role-grid">' + roles + "</div>";
      }
    };

    /* =====================================================================
       WIRING (interactions) — keyed by layout, run after innerHTML is set
       ===================================================================== */
    var WIRE = {
      hub: function () { animateCounters(); },

      /* hovering or focusing a wall in the list lights the same ring, and back */
      blueprint: function () {
        var hero = pageEl.querySelector(".hero");
        if (!hero) return;
        var parts = [].slice.call(hero.querySelectorAll("[data-ring]"));
        function set(i) {
          parts.forEach(function (el) { el.classList.toggle("is-hot", el.getAttribute("data-ring") === i); });
          hero.classList.toggle("has-hot", i !== null);
        }
        parts.forEach(function (el) {
          if (el.tagName.toLowerCase() !== "a") return;
          var i = el.getAttribute("data-ring");
          el.addEventListener("mouseenter", function () { set(i); });
          el.addEventListener("mouseleave", function () { set(null); });
          el.addEventListener("focus", function () { set(i); });
          el.addEventListener("blur", function () { set(null); });
        });
      },

      gallery: function (p) {
        var grid = document.getElementById("grid");
        var search = document.getElementById("search");
        var count = document.getElementById("resultCount");
        var chips = [].slice.call(pageEl.querySelectorAll(".chip"));
        var st = { q: "", cat: "" };

        function matches(item) {
          if (st.cat && item.category !== st.cat) return false;
          if (!st.q) return true;
          var hay = (t(item.title) + " " + t(item.summary) + " " + (item.tags || []).join(" ")).toLowerCase();
          return hay.indexOf(st.q) !== -1;
        }
        function paint() {
          var rows = (p.items || []).filter(matches);
          grid.innerHTML = rows.map(function (item) {
            var tags = (item.tags || []).map(function (g) { return '<span class="tag">' + esc(g) + "</span>"; }).join("");
            var cat = (p.categories || []).filter(function (c) { return c.key === item.category; })[0];
            return '<article class="card" tabindex="0" role="button" data-item data-slug="' + esc(item.slug) + '" ' +
              'aria-label="' + esc(t(item.title)) + '">' +
              (cat ? '<span class="card__cat">' + esc(cat[L.state.lang] || cat.en) + "</span>" : "") +
              '<h3 class="card__title">' + esc(t(item.title)) + "</h3>" +
              '<p class="card__summary">' + esc(t(item.summary)) + "</p>" +
              (tags ? '<div class="card__tags">' + tags + "</div>" : "") + "</article>";
          }).join("");
          if (count) count.textContent = rows.length + (L.state.lang === "en" ? " result(s)" : " 筆結果");
          wireCards();
        }
        function wireCards() {
          [].forEach.call(grid.querySelectorAll(".card[data-slug]"), function (card) {
            var slug = card.dataset.slug;
            card.addEventListener("click", function () { openItem(slug); });
            card.addEventListener("keydown", function (e) {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openItem(slug); }
            });
          });
        }
        function findItem(slug) {
          return (p.items || []).filter(function (it) { return it.slug === slug; })[0] || null;
        }
        function openItem(slug) {
          var item = findItem(slug); if (!item) return;
          var dlg = L.dialog(), body = document.getElementById("dialogBody");
          var tags = (item.tags || []).map(function (g) { return '<span class="tag">' + esc(g) + "</span>"; }).join("");
          body.innerHTML = '<h2 id="dialogTitle">' + esc(t(item.title)) + "</h2>" +
            (tags ? '<div class="card__tags">' + tags + "</div>" : "") +
            "<p>" + esc(t(item.overview) || t(item.summary)) + "</p>";
          if (!dlg.open) dlg.showModal();
          if (location.hash.slice(1) !== slug) history.replaceState(null, "", "#" + slug);
        }
        function syncHash() {
          var slug = location.hash.slice(1);
          if (slug && findItem(slug)) openItem(slug);
        }
        if (search) search.addEventListener("input", function () { st.q = this.value.trim().toLowerCase(); paint(); });
        chips.forEach(function (chip) {
          chip.addEventListener("click", function () {
            chips.forEach(function (c) { c.classList.remove("chip--active"); });
            chip.classList.add("chip--active");
            st.cat = chip.dataset.cat || "";
            paint();
          });
        });
        /* closing the dialog clears the #slug so the URL returns to clean state
           and a later deep link to the SAME slug fires hashchange again */
        var dlg = L.dialog();
        function onClose() {
          var slug = location.hash.slice(1);
          if (slug && findItem(slug)) history.replaceState(null, "", location.pathname + location.search);
        }
        dlg.addEventListener("close", onClose);
        var onHash = function () { syncHash(); };
        window.addEventListener("hashchange", onHash);
        teardowns.push(function () {
          window.removeEventListener("hashchange", onHash);
          dlg.removeEventListener("close", onClose);
        });
        paint();
        syncHash();
      },

      article: function () {
        var prog = document.getElementById("readingProgress");
        var links = [].slice.call(pageEl.querySelectorAll(".toc-link"));
        var secs = [].slice.call(pageEl.querySelectorAll(".article-section"));
        function onScroll() {
          var h = document.documentElement;
          var max = h.scrollHeight - h.clientHeight;
          if (prog) prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        teardowns.push(function () { window.removeEventListener("scroll", onScroll); });
        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (!en.isIntersecting) return;
              links.forEach(function (a) {
                var on = a.dataset.toc === en.target.id;
                a.classList.toggle("toc-link--active", on);
              });
            });
          }, { rootMargin: "-30% 0px -60% 0px" });
          secs.forEach(function (s) { io.observe(s); });
          teardowns.push(function () { io.disconnect(); });
        }
      },

      dashboard: function () { /* static charts; nothing to wire */ },

      table: function (p) {
        var table = document.getElementById("dataTable");
        var thead = table.querySelector("thead"), tbody = table.querySelector("tbody");
        var search = document.getElementById("search");
        var chipsBox = document.getElementById("tableChips");
        var cols = p.columns || [];
        var st = { q: "", filter: "", sortKey: null, dir: 1 };
        var filterCol = cols.filter(function (c) { return c.filter; })[0];

        function cellText(row, c) { var v = row[c.key]; return typeof v === "object" ? t(v) : String(v == null ? "" : v); }
        function rowMatches(row) {
          if (filterCol && st.filter && cellText(row, filterCol) !== st.filter) return false;
          if (!st.q) return true;
          return cols.some(function (c) { return cellText(row, c).toLowerCase().indexOf(st.q) !== -1; });
        }
        function paintHead() {
          thead.innerHTML = "<tr>" + cols.map(function (c) {
            var arrow = st.sortKey === c.key ? (st.dir > 0 ? " ▲" : " ▼") : "";
            return '<th class="th-sort" data-key="' + esc(c.key) + '" role="button" tabindex="0" aria-label="Sort by ' +
              esc(t(c.label)) + '">' + esc(t(c.label)) + esc(arrow) + "</th>";
          }).join("") + "</tr>";
          [].forEach.call(thead.querySelectorAll(".th-sort"), function (th) {
            th.addEventListener("click", function () { sortBy(th.dataset.key); });
            th.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortBy(th.dataset.key); } });
          });
        }
        function sortBy(key) {
          if (st.sortKey === key) st.dir = -st.dir; else { st.sortKey = key; st.dir = 1; }
          paint();
        }
        function paint() {
          paintHead();
          var col = cols.filter(function (c) { return c.key === st.sortKey; })[0];
          var rows = (p.rows || []).filter(rowMatches).slice();
          if (col) {
            rows.sort(function (a, b) {
              var va = a[col.key], vb = b[col.key];
              if (col.type === "num") return (Number(va) - Number(vb)) * st.dir;
              return String(typeof va === "object" ? t(va) : va).localeCompare(String(typeof vb === "object" ? t(vb) : vb)) * st.dir;
            });
          }
          tbody.innerHTML = rows.map(function (row) {
            return "<tr data-item>" + cols.map(function (c) {
              if (c.type === "link") {
                var u = row[c.key];
                return '<td><a class="row-link" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + "</a></td>";
              }
              return "<td>" + esc(cellText(row, c)) + "</td>";
            }).join("") + "</tr>";
          }).join("");
        }
        if (filterCol) {
          var vals = [];
          (p.rows || []).forEach(function (row) { var v = cellText(row, filterCol); if (vals.indexOf(v) === -1) vals.push(v); });
          var allLabel = L.state.lang === "en" ? "All" : "全部";
          chipsBox.innerHTML = '<button class="chip chip--active" type="button" data-v="">' + esc(allLabel) + "</button>" +
            vals.map(function (v) { return '<button class="chip" type="button" data-v="' + esc(v) + '">' + esc(v) + "</button>"; }).join("");
          [].forEach.call(chipsBox.querySelectorAll(".chip"), function (chip) {
            chip.addEventListener("click", function () {
              [].forEach.call(chipsBox.querySelectorAll(".chip"), function (c) { c.classList.remove("chip--active"); });
              chip.classList.add("chip--active");
              st.filter = chip.dataset.v || "";
              paint();
            });
          });
        }
        if (search) search.addEventListener("input", function () { st.q = this.value.trim().toLowerCase(); paint(); });
        paint();
      },

      bento: function () { /* static */ },
      kanban: function () { /* static */ },

      faq: function () {
        var search = document.getElementById("search");
        var items = [].slice.call(pageEl.querySelectorAll(".acc-item"));
        if (search) search.addEventListener("input", function () {
          var q = this.value.trim().toLowerCase();
          items.forEach(function (it) {
            var hit = !q || (it.dataset.q || "").indexOf(q) !== -1;
            it.style.display = hit ? "" : "none";
          });
        });
      },

      comparison: function () { /* static */ },

      leaderboard: function (p) {
        var view = document.getElementById("lbView");
        var btns = [].slice.call(pageEl.querySelectorAll(".seg__btn"));
        var entries = (p.entries || []).slice().sort(function (a, b) { return b.score - a.score; });
        function row(e, rank) {
          return '<li class="lb-row" data-item>' +
            (rank ? '<span class="lb-rank">' + rank + "</span>" : "") +
            '<span class="lb-tier lb-tier--' + esc(e.tier || "") + '">' + esc(e.tier || "") + "</span>" +
            '<span class="lb-name">' + esc(t(e.name)) + "</span>" +
            '<span class="lb-meta">' + esc(t(e.meta)) + "</span>" +
            '<span class="lb-score">' + esc(String(e.score)) + "</span></li>";
        }
        function listView() {
          view.innerHTML = '<ol class="lb-list">' + entries.map(function (e, i) { return row(e, i + 1); }).join("") + "</ol>";
        }
        function tierView() {
          var tiers = [];
          entries.forEach(function (e) { if (tiers.indexOf(e.tier) === -1) tiers.push(e.tier); });
          view.innerHTML = tiers.map(function (tier) {
            var rows = entries.filter(function (e) { return e.tier === tier; }).map(function (e) { return row(e); }).join("");
            return '<div class="lb-tier-group"><div class="lb-tier-head lb-tier--' + esc(tier) + '">' + esc(tier) + "</div>" +
              '<ol class="lb-list">' + rows + "</ol></div>";
          }).join("");
        }
        btns.forEach(function (b) {
          b.addEventListener("click", function () {
            btns.forEach(function (x) { x.classList.remove("seg__btn--active"); });
            b.classList.add("seg__btn--active");
            if (b.dataset.view === "tier") tierView(); else listView();
          });
        });
        listView();
      },

      scrolly: function (p) {
        var visual = document.getElementById("scrollyVisual");
        var steps = [].slice.call(pageEl.querySelectorAll(".scrolly-step"));
        function paintVisual(i) {
          var s = (p.steps || [])[i]; if (!s) return;
          var v = s.visual || {};
          if (v.type === "bars") {
            visual.innerHTML = '<div class="chart-wrap">' + barChart(v.bars || [], v.color) + "</div>";
          } else {
            visual.innerHTML = '<div class="scrolly-stat" style="color:' + esc(v.color || "var(--primary)") + '">' +
              esc(t(v.value)) + "</div>";
          }
        }
        paintVisual(0);
        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                steps.forEach(function (s) { s.classList.remove("scrolly-step--active"); });
                en.target.classList.add("scrolly-step--active");
                paintVisual(parseInt(en.target.dataset.step, 10) || 0);
              }
            });
          }, { rootMargin: "-45% 0px -45% 0px" });
          steps.forEach(function (s) { io.observe(s); });
          teardowns.push(function () { io.disconnect(); });
        }
      },

      map: function (p) {
        var listEl = document.getElementById("mapList");
        var places = p.places || [];
        listEl.innerHTML = places.map(function (pl) {
          return '<li class="place" data-item data-slug="' + esc(pl.slug) + '" tabindex="0" role="button" ' +
            'aria-label="' + esc(t(pl.name)) + '"><b>' + esc(t(pl.name)) + "</b>" +
            '<span>' + esc(t(pl.body)) + "</span></li>";
        }).join("");

        if (typeof window.L === "undefined" || !window.L.map) {
          // Leaflet not loaded (offline / blocked): list-only graceful fallback.
          document.getElementById("map").innerHTML =
            '<div class="map-fallback">' + esc(L.state.lang === "en" ? "Map unavailable offline — see the list." : "離線時地圖無法載入 — 請看清單。") + "</div>";
          return;
        }
        var map = window.L.map("map", { scrollWheelZoom: false });
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap", maxZoom: 19
        }).addTo(map);
        var markers = {}, group = [];
        places.forEach(function (pl) {
          /* alt + title give Leaflet's marker <img role="button"> an accessible name */
          var m = window.L.marker([pl.lat, pl.lng], { alt: t(pl.name), title: t(pl.name), keyboard: true })
            .addTo(map).bindPopup("<b>" + esc(t(pl.name)) + "</b><br>" + esc(t(pl.body)));
          markers[pl.slug] = m; group.push([pl.lat, pl.lng]);
        });
        if (group.length) map.fitBounds(group, { padding: [30, 30] });
        [].forEach.call(listEl.querySelectorAll(".place"), function (li) {
          function go() { var m = markers[li.dataset.slug]; if (m) { map.panTo(m.getLatLng()); m.openPopup(); } }
          li.addEventListener("click", go);
          li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
        });
        teardowns.push(function () { try { map.remove(); } catch (e) {} });
      },

      glossary: function (p) {
        var box = document.getElementById("glossary");
        var search = document.getElementById("search");
        var count = document.getElementById("resultCount");
        var terms = p.terms || [];
        function paint(q) {
          var rows = terms.filter(function (it) {
            if (!q) return true;
            return (t(it.term) + " " + t(it.def)).toLowerCase().indexOf(q) !== -1;
          });
          box.innerHTML = rows.map(function (it) {
            return '<details class="gloss-item" data-item>' +
              '<summary class="gloss-term"><span>' + esc(t(it.term)) + "</span>" +
              '<span class="material-symbols-rounded gloss-chevron" aria-hidden="true">expand_more</span></summary>' +
              '<div class="gloss-def">' + esc(t(it.def)) + "</div></details>";
          }).join("");
          if (count) count.textContent = rows.length + (L.state.lang === "en" ? " term(s)" : " 個術語");
        }
        if (search) search.addEventListener("input", function () { paint(this.value.trim().toLowerCase()); });
        paint("");
      },

      quiz: function (p) {
        var qs = p.questions || [];
        var answered = {};   // qi -> chosen idx; in-memory only (resets on refresh / lang switch)
        var scoreVal = document.getElementById("quizScoreVal");
        function updateScore() {
          var correct = 0;
          Object.keys(answered).forEach(function (k) { if (answered[k] === qs[k].answer) correct++; });
          if (scoreVal) scoreVal.textContent = correct + " / " + qs.length;
        }
        [].forEach.call(pageEl.querySelectorAll(".quiz-card"), function (card) {
          var qi = parseInt(card.dataset.qi, 10);
          var q = qs[qi];
          var opts = [].slice.call(card.querySelectorAll(".quiz-opt"));
          var explainEl = card.querySelector(".quiz-explain");
          opts.forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (Object.prototype.hasOwnProperty.call(answered, qi)) return;   // lock after first answer
              var oi = parseInt(btn.dataset.o, 10);
              answered[qi] = oi;
              opts.forEach(function (b) {
                var bi = parseInt(b.dataset.o, 10);
                b.disabled = true;
                if (bi === q.answer) b.classList.add("quiz-opt--correct");
                else if (bi === oi) b.classList.add("quiz-opt--wrong");
              });
              var ok = oi === q.answer;
              explainEl.classList.toggle("quiz-explain--ok", ok);
              explainEl.innerHTML = '<span class="material-symbols-rounded quiz-mark" aria-hidden="true">' + (ok ? "check_circle" : "cancel") + "</span>" +
                '<span class="visually-hidden">' + (ok ? (L.state.lang === "en" ? "Correct. " : "答對了。") : (L.state.lang === "en" ? "Not quite. " : "答錯了。")) + "</span>" +
                "<span>" + esc(t(q.explain)) + "</span>";
              explainEl.hidden = false;
              updateScore();
            });
          });
        });
        updateScore();
      },

      flashcards: function () {
        [].forEach.call(pageEl.querySelectorAll(".flip"), function (card) {
          card.addEventListener("click", function () {
            var flipped = card.classList.toggle("flipped");
            card.setAttribute("aria-pressed", flipped ? "true" : "false");
          });
        });
      }
    };

    /* ---- hero count-up (shared by hub) ---- */
    function animateCounters() {
      var els = [].slice.call(pageEl.querySelectorAll(".hero__stat-value[data-count]"));
      if (!els.length) return;
      function run(el) {
        var target = parseFloat(el.dataset.count) || 0, dur = 1000, start = null;
        function step(ts) {
          if (start === null) start = ts;
          var pr = Math.min(1, (ts - start) / dur), eased = 1 - Math.pow(1 - pr, 3);
          el.textContent = String(Math.round(target * eased));
          if (pr < 1) requestAnimationFrame(step); else el.textContent = String(target);
        }
        requestAnimationFrame(step);
      }
      if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.4 });
      els.forEach(function (el) { io.observe(el); });
      teardowns.push(function () { io.disconnect(); });
    }

    /* =====================================================================
       RENDER the current page
       ===================================================================== */
    function render() {
      teardowns.forEach(function (fn) { try { fn(); } catch (e) {} });
      teardowns = [];
      var p = L.currentPage();
      if (!p) { pageEl.innerHTML = '<p class="empty">No page data.</p>'; return; }
      var fn = RENDERERS[p.layout] || RENDERERS.gallery;
      pageEl.className = "page page--" + p.layout;
      pageEl.innerHTML = fn(p);
      var w = WIRE[p.layout];
      if (w) w(p);
    }

    render();
  }

  boot();
})();
