/* Cold case GiFi : outils communs à toutes les pages
 * Stockage (localStorage protégé, repli en mémoire), sons Web Audio (coupés par défaut, touche M),
 * logos avec repli texte, codes (SHA-256 + déchiffrement AES-GCM), barre haute et pied de page.
 */
(function () {
  "use strict";
  var D = window.CCG_DATA || {};
  var CC = (window.CC = { data: D });

  /* ---------------- Stockage ---------------- */
  var PFX = D.prefixe || "ccg:"; // la version 3 h a son propre préfixe : ses progressions ne se mélangent pas avec la journée
  var memoire = {};
  CC.get = function (k, def) {
    var v;
    try { v = localStorage.getItem(PFX + k); } catch (e) { v = null; }
    if (v == null) v = Object.prototype.hasOwnProperty.call(memoire, k) ? memoire[k] : null;
    if (v == null) return def;
    try { return JSON.parse(v); } catch (e) { return def; }
  };
  CC.set = function (k, val) {
    var s = JSON.stringify(val);
    memoire[k] = s;
    try { localStorage.setItem(PFX + k, s); } catch (e) { /* on continue en mémoire */ }
  };
  CC.suppr = function (k) {
    delete memoire[k];
    try { localStorage.removeItem(PFX + k); } catch (e) {}
  };
  CC.ecouter = function (k, fn) {
    window.addEventListener("storage", function (e) { if (e.key === PFX + k) fn(CC.get(k)); });
  };

  /* ---------------- Divers ---------------- */
  CC.$ = function (s, r) { return (r || document).querySelector(s); };
  CC.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  CC.el = function (tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var a in attrs) { if (a === "class") e.className = attrs[a]; else if (a === "text") e.textContent = attrs[a]; else e.setAttribute(a, attrs[a]); }
    if (html != null) e.innerHTML = html;
    return e;
  };
  CC.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  CC.euros = function (n) {
    var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (n < 0 ? "−" : "") + s + " €";
  };
  CC.signe = function (n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + CC.euros(Math.abs(n)); };
  CC.mmss = function (s) {
    var neg = s < 0; s = Math.abs(Math.round(s));
    var m = Math.floor(s / 60), r = s % 60;
    return (neg ? "−" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  };
  CC.heure = function (d) { d = d || new Date(); return (d.getHours() < 10 ? "0" : "") + d.getHours() + "h" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(); };
  CC.reduit = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  CC.alea = function (n) { var a = new Uint32Array(1); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : (a[0] = Math.floor(Math.random() * 4294967295)); return a[0] % n; };

  /* Animation : Web Animations API ; si mouvement réduit, simple fondu */
  CC.anim = function (el, kf, opts) {
    if (!el || !el.animate) return { finished: Promise.resolve(), cancel: function () {} };
    if (CC.reduit()) {
      var dernier = kf[kf.length - 1] || {};
      var fin = dernier.opacity != null ? dernier.opacity : 1;
      return el.animate([{ opacity: fin === 0 ? 1 : 0 }, { opacity: fin }], { duration: 250, fill: opts && opts.fill || "none" });
    }
    return el.animate(kf, opts);
  };
  CC.attendre = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------------- Équipes ---------------- */
  CC.nomEquipe = function (n) {
    var noms = CC.get("noms", null) || [];
    var def = (D.equipes && D.equipes.noms_par_defaut) || ["Cabinet 1", "Cabinet 2"];
    return (noms[n - 1] && String(noms[n - 1]).trim()) || def[n - 1];
  };

  /* ---------------- Codes ---------------- */
  CC.normaliser = function (s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").toUpperCase();
  };
  function hexa(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join(""); }
  CC.sha256 = function (txt) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)); };
  var hachages = null;
  CC.hachages = function () {
    if (hachages) return Promise.resolve(hachages);
    // data/codes-hash.json (servi par GitHub Pages) ; repli sur la copie intégrée (ouverture en fichier local)
    return fetch("data/codes-hash.json", { cache: "no-store" }).then(function (r) { return r.json(); })
      .then(function (j) { hachages = j.codes; return hachages; })
      .catch(function () { hachages = D.codes_hash || []; return hachages; });
  };
  CC.verifierCode = function (piece, saisie) {
    var n = CC.normaliser(saisie);
    if (!n) return Promise.resolve(false);
    return Promise.all([CC.hachages(), CC.sha256(n)]).then(function (r) {
      var h = r[0].filter(function (c) { return c.piece === piece; })[0];
      return !!h && h.sha256 === hexa(r[1]);
    });
  };
  CC.dechiffrer = function (b64, code) {
    try {
      var brut = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
      var iv = brut.slice(0, 12), ct = brut.slice(12);
      return CC.sha256("cold-case-gifi|" + CC.normaliser(code))
        .then(function (k) { return crypto.subtle.importKey("raw", k, { name: "AES-GCM" }, false, ["decrypt"]); })
        .then(function (cle) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, cle, ct); })
        .then(function (buf) { return new TextDecoder().decode(buf); })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  };

  /* ---------------- Logos ---------------- */
  CC.logosActifs = function () { return window.AFFICHER_LOGOS === true; };
  CC.logo = function (marque, taille) {
    var L = (D.logos && D.logos.marques) || {};
    var b = L[marque] || { nom: marque };
    var w = CC.el("span", { class: "logo-marque" + (taille ? " " + taille : "") });
    function texte() { w.innerHTML = ""; w.appendChild(CC.el("span", { class: "marque-texte", text: b.nom })); w.classList.add("txt"); }
    if (CC.logosActifs() && (b.logo || b.icone)) {
      // 1) le logo (variante « light » : logo clair, posé sur fond sombre) ; 2) sinon l'icône officielle ; 3) sinon le nom en texte.
      // URL Brandfetch utilisées telles quelles (jeton ?c= compris), jamais téléchargées.
      var img = new Image();
      img.alt = b.nom;
      img.decoding = "async";
      var etape = b.logo ? "logo" : "icone";
      img.onload = function () { w.classList.add(etape === "logo" ? "sombre" : "icone"); };
      img.onerror = function () {
        if (etape === "logo" && b.icone) { etape = "icone"; img.src = b.icone; } else texte();
      };
      img.src = b[etape];
      w.appendChild(img);
    } else texte();
    return w;
  };

  /* ---------------- Sons (Web Audio, coupés par défaut) ---------------- */
  var actx = null;
  var son = { actif: false };
  CC.son = son;
  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, a, d, v, f2) {
    var c = ctx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    env(g, t, a, d, v); o.connect(g).connect(c.destination); o.start(t); o.stop(t + a + d + 0.05);
  }
  var bruitBuf = null;
  function bruit(t, d, v, filtre, fq) {
    var c = ctx(); if (!c) return;
    if (!bruitBuf) { bruitBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); var ch = bruitBuf.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    var s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s.buffer = bruitBuf; f.type = filtre || "highpass"; f.frequency.value = fq || 2000;
    env(g, t, 0.002, d, v); s.connect(f).connect(g).connect(c.destination); s.start(t, Math.random()); s.stop(t + d + 0.05);
  }
  function jouer(fn) { if (!son.actif) return; var c = ctx(); if (!c) return; fn(c.currentTime + 0.01); }
  CC.bip = function (f, d) { jouer(function (t) { osc("sine", f || 880, t, 0.01, d || 0.18, 0.18); }); };
  CC.bipDouble = function () { jouer(function (t) { osc("sine", 880, t, 0.01, 0.14, 0.18); osc("sine", 880, t + 0.22, 0.01, 0.14, 0.18); }); };
  CC.bipFin = function () { jouer(function (t) { osc("sine", 660, t, 0.01, 0.25, 0.2); osc("sine", 440, t + 0.3, 0.01, 0.5, 0.2); }); };
  CC.cliquetis = function () { jouer(function (t) { bruit(t, 0.025, 0.25, "highpass", 2500); osc("square", 180, t, 0.001, 0.02, 0.03); }); };
  CC.coupSourd = function () { jouer(function (t) { osc("sine", 120, t, 0.005, 0.35, 0.6, 45); bruit(t, 0.08, 0.25, "lowpass", 600); }); };
  CC.marteau = function () { jouer(function (t) { osc("triangle", 220, t, 0.002, 0.12, 0.5, 90); bruit(t, 0.05, 0.4, "bandpass", 1800); osc("sine", 90, t, 0.004, 0.4, 0.5, 40); }); };
  CC.jingle = function () { jouer(function (t) { [523.25, 659.25, 783.99].forEach(function (f, i) { osc("triangle", f, t + i * 0.2, 0.01, 0.26, 0.22); }); }); };
  CC.sirene = function () { jouer(function (t) { osc("sawtooth", 620, t, 0.05, 0.5, 0.06, 940); osc("sawtooth", 620, t + 0.6, 0.05, 0.5, 0.06, 940); }); };
  CC.gain = function () { jouer(function (t) { osc("sine", 988, t, 0.005, 0.12, 0.15); osc("sine", 1319, t + 0.1, 0.005, 0.3, 0.15); }); };
  CC.perte = function () { jouer(function (t) { osc("square", 200, t, 0.005, 0.3, 0.06, 120); }); };
  CC.tambour = function (duree) {
    jouer(function (t) {
      var d = duree || 2;
      for (var x = 0; x < d; x += 0.045) bruit(t + x, 0.04, 0.05 + 0.25 * (x / d), "bandpass", 900);
      bruit(t + d, 0.9, 0.35, "highpass", 5000); osc("sine", 110, t + d, 0.005, 0.5, 0.5, 50);
    });
  };
  CC.activerSon = function (on) {
    son.actif = !!on;
    if (on) ctx();
    CC.set("son", son.actif);
    CC.$$("[data-son]").forEach(function (b) {
      b.setAttribute("aria-pressed", son.actif ? "true" : "false");
      b.textContent = son.actif ? "Son activé (M)" : "Activer le son";
    });
  };

  /* ---------------- Barre haute et pied de page ---------------- */
  var NAV = D.nav || [
    ["index.html", "Accueil"], ["equipe.html?e=1", "Cabinet 1"], ["equipe.html?e=2", "Cabinet 2"],
    ["chrono.html", "Chrono"], ["breaking.html", "Breaking news"], ["quiz.html", "Quiz"], ["imprimer.html", "Imprimer"]
  ];
  CC.entete = function (sousTitre) {
    var h = CC.$("#cc-top");
    if (!h) return;
    var ici = location.pathname.split("/").pop() || "index.html";
    var q = location.search;
    h.className = "topbar no-print";
    h.innerHTML = '<a class="tb-logo" href="../"><img src="' + (D.racine || "") + 'img/bf-conseil.png" alt="BF Conseil" width="57" height="42"></a>' +
      '<div class="tb-t"><b>' + CC.esc((D.meta && D.meta.titre_court) || "Cold case GiFi") + '</b>' + CC.esc(sousTitre || "L'enquête · Mastère MA28 · Bloc 1") + "</div>" +
      '<nav class="tb-nav" aria-label="Pages de l\'atelier">' + NAV.map(function (n) {
        var cible = n[0].split("?");
        var cur = cible[0] === ici && (!cible[1] || ("?" + cible[1]) === q);
        var lib = n[1];
        if (/equipe/.test(n[0])) lib = CC.nomEquipe(n[0].slice(-1) * 1);
        return '<a href="' + n[0] + '"' + (cur ? ' aria-current="page"' : "") + ">" + CC.esc(lib) + "</a>";
      }).join("") + '<button type="button" class="btn-son" data-son aria-pressed="false">Activer le son</button></nav>';
  };
  CC.pied = function (avecLogos) {
    var f = CC.$("#cc-pied");
    if (!f) return;
    f.className = "pied no-print";
    var m = avecLogos && CC.logosActifs() && D.logos ? '<span class="mention">' + CC.esc(D.logos.mention) + "</span>" : "";
    f.innerHTML = "Belel Hanachi · BF Conseil · " + CC.esc((D.meta && D.meta.groupe) || "") +
      ' · <a href="sources.html">Sources</a> · Rien n\u0027est envoyé : tout reste sur cet appareil.<br>Un redressement judiciaire n\u0027est pas une liquidation : on analyse un marché et des décisions, avec respect pour les 6 000 salariés de GiFi.' + m;
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.add("js");
    var b = document.body;
    CC.entete(b.getAttribute("data-sous-titre"));
    CC.pied(b.hasAttribute("data-avec-logos"));
    CC.activerSon(false); // coupé par défaut à chaque ouverture
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-son]");
      if (t) CC.activerSon(!son.actif);
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "m" || e.key === "M") && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        CC.activerSon(!son.actif);
      }
    });
  });
})();
