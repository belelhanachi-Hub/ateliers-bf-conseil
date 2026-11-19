/* Cold case GiFi, version autonome : l'application.
 * Un ordinateur = un cabinet. Tout est enregistré dans le navigateur (localStorage, repli en mémoire).
 * Un code par pièce : trouvé = gain ; refusé, indice ou pièce passée = perte. Rien n'est bloquant :
 * on peut toujours passer à la pièce suivante. À la fin, le site produit le PDF du rapport.
 */
(function () {
  "use strict";
  var D = window.CCA, SEC = window.CCA_S || { h: {}, i: {}, c: {} }, B = D.bareme;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var PIECE = {}; D.pieces.forEach(function (p) { PIECE[p.id] = p; });

  /* ======================= Stockage ======================= */
  var CLE = D.prefixe + "etat", memoire = null, stockageOK = true;
  function charger() {
    var v = null;
    try { v = localStorage.getItem(CLE); } catch (e) { stockageOK = false; }
    if (v == null) v = memoire;
    try { v = v ? JSON.parse(v) : null; } catch (e) { v = null; }
    return v || neuf();
  }
  function neuf() { return { v: 1, cabinet: "", membres: ["", "", "", ""], debut: null, quiz: {}, pieces: {}, bn: {}, champs: {}, journal: [], vue: "accueil", pdf: null }; }
  var S = charger();
  var minuteurSauve = null;
  function sauver(tout_de_suite) {
    clearTimeout(minuteurSauve);
    var f = function () {
      var s = JSON.stringify(S);
      memoire = s;
      try { localStorage.setItem(CLE, s); stockageOK = true; } catch (e) { stockageOK = false; }
      majSauve();
    };
    if (tout_de_suite) f(); else minuteurSauve = setTimeout(f, 250);
  }
  function majSauve() {
    var el = $("#etat-sauve"); if (!el) return;
    el.textContent = stockageOK ? "Enregistré sur cet ordinateur" : "Attention : enregistrement impossible (navigation privée ?). Ne fermez pas cette page.";
    el.className = stockageOK ? "sauve" : "sauve ko";
  }
  window.addEventListener("storage", function (e) {
    if (e.key === CLE) alerte("Le site est ouvert dans un autre onglet ou une autre fenêtre. Gardez un seul onglet ouvert, sinon des réponses peuvent se perdre.");
  });

  /* ======================= Outils ======================= */
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function euros(n) { var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); return (n < 0 ? "−" : "") + s + " €"; }
  function signe(n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + euros(Math.abs(n)); }
  function hm(t) { var d = new Date(t); return d.getHours() + "h" + ("0" + d.getMinutes()).slice(-2); }
  function duree(ms) { var m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + ("0" + (m % 60)).slice(-2); }
  function hhmmss(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 3600) + ":" + ("0" + Math.floor(s / 60) % 60).slice(-2) + ":" + ("0" + (s % 60)).slice(-2); }
  function maintenant() { return Date.now(); }
  function etatP(n) { return S.pieces[n] || (S.pieces[n] = { ouv: null, statut: null, essais: 0, indice: false, clos: false }); }
  function noter(motif, montant) { S.journal.push({ t: maintenant(), m: motif, v: montant }); }
  function deBrouiller(b64) {
    try {
      var bin = atob(b64), k = "GiFi-cold-case-autonome-2026", u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i) ^ k.charCodeAt(i % k.length);
      return new TextDecoder("utf-8").decode(u);
    } catch (e) { return ""; }
  }
  var QUIZ = []; try { QUIZ = JSON.parse(deBrouiller(SEC.q)); } catch (e) { QUIZ = []; }

  /* SHA-256 : Web Crypto si disponible, sinon calcul en JavaScript */
  function sha256js(str) {
    var u = new TextEncoder().encode(str), l = u.length, K = [], Hh = [], i, j;
    function prem(n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
    for (i = 2, j = 0; j < 64; i++) if (prem(i)) { if (j < 8) Hh[j] = (Math.pow(i, 1 / 2) * 4294967296) | 0; K[j++] = (Math.pow(i, 1 / 3) * 4294967296) | 0; }
    var n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n); m.set(u); m[l] = 0x80;
    var dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8); dv.setUint32(n - 8, Math.floor(l / 536870912));
    var w = new Array(64);
    for (var o = 0; o < n; o += 64) {
      for (i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (i = 16; i < 64; i++) {
        var a = w[i - 15], b = w[i - 2];
        var s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3), s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var A = Hh[0], Bb = Hh[1], C = Hh[2], Dd = Hh[3], E = Hh[4], F = Hh[5], G = Hh[6], HH = Hh[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((E >>> 6) | (E << 26)) ^ ((E >>> 11) | (E << 21)) ^ ((E >>> 25) | (E << 7)), ch = (E & F) ^ (~E & G);
        var t1 = (HH + S1 + ch + K[i] + w[i]) | 0;
        var S0 = ((A >>> 2) | (A << 30)) ^ ((A >>> 13) | (A << 19)) ^ ((A >>> 22) | (A << 10)), mj = (A & Bb) ^ (A & C) ^ (Bb & C);
        var t2 = (S0 + mj) | 0;
        HH = G; G = F; F = E; E = (Dd + t1) | 0; Dd = C; C = Bb; Bb = A; A = (t1 + t2) | 0;
      }
      Hh[0] = (Hh[0] + A) | 0; Hh[1] = (Hh[1] + Bb) | 0; Hh[2] = (Hh[2] + C) | 0; Hh[3] = (Hh[3] + Dd) | 0;
      Hh[4] = (Hh[4] + E) | 0; Hh[5] = (Hh[5] + F) | 0; Hh[6] = (Hh[6] + G) | 0; Hh[7] = (Hh[7] + HH) | 0;
    }
    return Hh.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }
  function sha256(str) {
    try {
      if (window.crypto && crypto.subtle && window.isSecureContext !== false) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (b) {
          return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
        }, function () { return sha256js(str); });
      }
    } catch (e) { /* repli */ }
    return Promise.resolve(sha256js(str));
  }

  /* ======================= Champs et complétude ======================= */
  function etapesDe(p) { return p.etapes.concat([D.etape_rapport(p.id)]); }
  function lignesDe(p, ch) {
    if (ch.lignes === "indices15") return p.indices15.map(function (c, i) { return "Carte " + (i + 1) + " : " + c[0]; });
    return ch.lignes;
  }
  function val(k) { return S.champs[k]; }
  function rempli(v) { return v != null && String(v).trim().length >= 2 || (v != null && /^[0-9]$/.test(String(v).trim())); }
  // Pour une liste de champs : { total, faits }
  function compter(champs, p) {
    var total = 0, faits = 0;
    champs.forEach(function (ch) {
      if (ch.opt || ch.type === "radar") return;
      if (ch.type === "image") { total++; var im = val(ch.k); if (im && im.src) faits++; return; }
      if (ch.type === "grid") {
        var lignes = lignesDe(p, ch), g = val(ch.k) || {}, cols = ch.cols.filter(function (c) { return !c.opt; });
        var min = ch.min || lignes.length;
        // les lignes au-delà du minimum ne comptent pas
        var pleines = [];
        lignes.forEach(function (l, i) { var r = g[i] || {}; pleines.push(cols.filter(function (c) { return rempli(r[c.k]); }).length); });
        var tri = pleines.slice().sort(function (a, b) { return b - a; }).slice(0, min);
        total += min * cols.length;
        faits += tri.reduce(function (s, x) { return s + x; }, 0);
        return;
      }
      total++;
      if (rempli(val(ch.k))) faits++;
    });
    return { total: total, faits: faits, ok: faits >= total };
  }
  function completudePiece(n) {
    var p = PIECE[n], champs = [];
    etapesDe(p).forEach(function (e) { champs = champs.concat(e.champs); });
    return compter(champs, p);
  }
  function completudeRapport() { return compter(D.rapport.champs, null); }
  /* Le livrable d'une pièce : ses éléments, chacun rendu ou non (d'après les cadres qui le contiennent) */
  function champDef(p, k) {
    var r = null;
    etapesDe(p).forEach(function (e) { e.champs.forEach(function (ch) { if (ch.k === k) r = ch; }); });
    return r;
  }
  function livrable(n) {
    var p = PIECE[n];
    var l = (D.livrables[n] || []).concat([{ t: D.livrable_commun, k: ["p" + n + "_preuve", "p" + n + "_change"] }]);
    return l.map(function (it) {
      var defs = it.k.map(function (k) { return champDef(p, k); }).filter(Boolean);
      return { t: it.t, k: it.k[0], ok: compter(defs, p).ok };
    });
  }
  function livrableHTML(n) {
    var l = livrable(n), faits = l.filter(function (x) { return x.ok; }).length;
    return '<section class="livrable" id="livrable"><h2 class="h-sec">Votre livrable : il se rend ici, dans le site</h2>' +
      "<p>Rien sur papier, rien à côté : chaque élément se remplit dans les cadres de cette page, et tout part dans votre PDF. " +
      "<b>" + faits + " élément" + (faits > 1 ? "s" : "") + " rendu" + (faits > 1 ? "s" : "") + " sur " + l.length + ".</b></p><ul>" +
      l.map(function (x) {
        return '<li class="' + (x.ok ? "ok" : "") + '"><span class="pastille">' + (x.ok ? "✓ Rendu" : "À rendre") + "</span> " + esc(x.t) +
          ' <button type="button" class="lien" data-vers="' + x.k + '">aller au cadre</button></li>';
      }).join("") + "</ul></section>";
  }
  function majLivrable(n) {
    var z = $("#livrable"); if (!z) return;
    var tmp = document.createElement("div"); tmp.innerHTML = livrableHTML(n);
    z.replaceWith(tmp.firstChild); brancherVers();
  }
  function brancherVers() {
    $$("[data-vers]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-vers");
        var el = $('[data-k="' + k + '"]') || $('[data-cap="' + k + '"]') || $('[data-radar="' + k + '"]');
        if (!el) return;
        el.scrollIntoView({ block: "center" });
        var f = el.matches("input,textarea,select") ? el : $("input,textarea,select,label.btn", el);
        if (f && f.focus) f.focus({ preventScroll: true });
      });
    });
  }
  function bnRepondue(n) { var v = val("bn" + n); return v != null && String(v).trim().length >= 15; }

  /* ======================= Trésorerie ======================= */
  function bonus() {
    var l = [];
    D.pieces.forEach(function (p) { if (completudePiece(p.id).ok) l.push({ m: "Pièce " + p.id + " : toutes les réponses remplies", v: B.livrable }); });
    [1, 2, 3].forEach(function (n) { if (bnRepondue(n)) l.push({ m: "Breaking news " + n + " : réponse rédigée", v: B.breaking }); });
    if (completudeRapport().ok) l.push({ m: "Rapport final complet", v: B.rapport });
    return l;
  }
  function solde() {
    return B.depart + S.journal.reduce(function (s, j) { return s + j.v; }, 0) + bonus().reduce(function (s, j) { return s + j.v; }, 0);
  }

  /* ======================= Progression ======================= */
  function lance() { return !!S.debut; }
  function ouverte(n) {
    if (!lance()) return false;
    if (n === 1) return true;
    return !!etatP(n - 1).statut;
  }
  function rapportOuvert() { return lance() && !!etatP(8).statut; }
  function etapeConseillee() {
    if (!lance()) return null;
    var ecoule = (maintenant() - S.debut) / 60000, cumul = 0;
    for (var i = 0; i < D.plan.length; i++) { cumul += D.plan[i].duree; if (ecoule < cumul) return { e: D.plan[i], fin: S.debut + cumul * 60000 }; }
    return { e: { id: "fini", nom: "Temps écoulé" }, fin: S.debut + cumul * 60000 };
  }
  function finConseillee(id) {
    var cumul = 0;
    for (var i = 0; i < D.plan.length; i++) { cumul += D.plan[i].duree; if (D.plan[i].id === id) return S.debut + cumul * 60000; }
    return null;
  }
  function pieceEnCours() { for (var n = 1; n <= 8; n++) if (!etatP(n).statut) return n; return null; }

  /* ======================= Barre de statut ======================= */
  function majStatut() {
    var b = $("#statut");
    if (!lance()) { b.hidden = true; return; }
    b.hidden = false;
    var s = solde();
    $("#st-cab").textContent = S.cabinet || "Votre cabinet";
    var ts = $("#st-treso"); ts.textContent = euros(s); ts.classList.toggle("neg", s < 0);
    var ecoule = maintenant() - S.debut, totalMs = D.duree_totale * 60000;
    $("#st-chrono").textContent = hhmmss(ecoule);
    var reste = totalMs - ecoule;
    $("#st-reste").textContent = reste > 0 ? "reste " + duree(reste) : "temps écoulé";
    var c = etapeConseillee(), msg = "", cls = "";
    var enCours = pieceEnCours();
    if (c && c.e.id === "fini") { msg = "Les 3 h 10 sont écoulées : finalisez le rapport et envoyez le PDF maintenant."; cls = "rouge"; }
    else if (c) {
      var nom = typeof c.e.id === "number" ? "Pièce " + c.e.id : c.e.nom;
      msg = "Plan : " + nom + " jusqu'à " + hm(c.fin) + ".";
      if (enCours) {
        var fe = finConseillee(enCours);
        if (fe && maintenant() > fe + 60000) { msg += " Vous êtes sur la pièce " + enCours + " : en retard de " + duree(maintenant() - fe) + ". Prenez un indice ou passez la pièce."; cls = "orange"; }
      } else if (!etatP(8).statut) { /* rien */ }
      else if (!completudeRapport().ok) msg += " Toutes les pièces sont faites : rédigez le rapport final.";
    }
    var pl = $("#st-plan"); pl.textContent = msg; pl.className = "st-plan " + cls;
    $("#bandeau-faillite").hidden = s >= 0;
  }

  /* ======================= Navigation ======================= */
  function etapesNav() {
    var l = [{ id: "accueil", n: "", t: "Accueil" }, { id: "quiz", n: "0", t: "Échauffement" }];
    D.pieces.forEach(function (p) { l.push({ id: "p" + p.id, n: String(p.id), t: p.titre }); });
    l.push({ id: "rapport", n: "R", t: "Rapport final" }, { id: "envoi", n: "PDF", t: "Envoi" });
    return l;
  }
  function accessible(id) {
    if (id === "accueil") return true;
    if (!lance()) return false;
    if (id === "quiz" || id === "envoi") return true;
    if (id === "rapport") return rapportOuvert();
    return ouverte(+id.slice(1));
  }
  function etatNav(id) {
    if (!accessible(id)) return "verrou";
    if (id[0] === "p") { var e = etatP(+id.slice(1)); if (e.statut === "trouve") return "trouve"; if (e.statut === "passe") return "passe"; return "ouverte"; }
    if (id === "quiz") return Object.keys(S.quiz).length >= D.quiz.length ? "trouve" : "ouverte";
    if (id === "rapport") return completudeRapport().ok ? "trouve" : "ouverte";
    if (id === "envoi") return S.pdf ? "trouve" : "ouverte";
    return "ouverte";
  }
  var ETIQ = { verrou: "verrouillée", ouverte: "ouverte", trouve: "code trouvé", passe: "passée" };
  function rendreNav() {
    var ul = $("#frise");
    ul.innerHTML = etapesNav().map(function (x) {
      var e = etatNav(x.id), lab = e === "trouve" && (x.id === "quiz" || x.id === "rapport" || x.id === "envoi") ? "fait" : ETIQ[e];
      if (x.id === "accueil") lab = "";
      return '<li><button type="button" class="fr" data-vue="' + x.id + '" data-etat="' + e + '"' + (S.vue === x.id ? ' aria-current="true"' : "") + (e === "verrou" ? " disabled" : "") +
        ' aria-label="' + esc(x.t + (lab ? ", " + lab : "")) + '"><span class="n">' + (x.n || "⌂") + '</span><span class="t">' + esc(x.t) + "</span>" +
        (lab ? '<span class="e">' + (e === "verrou" ? "🔒 " : e === "trouve" ? "✓ " : e === "passe" ? "→ " : "") + lab + "</span>" : "") + "</button></li>";
    }).join("");
  }
  function aller(id) {
    if (!accessible(id)) return;
    S.vue = id;
    if (id[0] === "p") { var e = etatP(+id.slice(1)); if (!e.ouv) e.ouv = maintenant(); }
    sauver(true);
    rendre();
    window.scrollTo(0, 0);
    var h = $("#vue h1, #vue h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    if (id[0] === "p") { var n = +id.slice(1); if (D.breaking[n] && !(S.bn[n] && S.bn[n].vu)) montrerBreaking(n); }
  }

  /* ======================= Rendu des champs ======================= */
  function champHTML(ch, p, bloque) {
    var dis = bloque ? " disabled" : "", v = val(ch.k);
    var lab = '<span class="lab">' + esc(ch.label) + (ch.opt ? ' <i>(facultatif)</i>' : "") + "</span>";
    if (ch.type === "text") return '<label class="ch">' + lab + '<input type="text" data-k="' + ch.k + '" value="' + esc(v || "") + '"' + dis + "></label>";
    if (ch.type === "area") return '<label class="ch">' + lab + '<textarea rows="' + (ch.rows || 3) + '" data-k="' + ch.k + '"' + dis + ">" + esc(v || "") + "</textarea></label>";
    if (ch.type === "select") return '<label class="ch">' + lab + selectHTML(ch.options, v, 'data-k="' + ch.k + '"' + dis) + "</label>";
    if (ch.type === "grid") {
      var lignes = lignesDe(p, ch), g = v || {};
      var h = '<div class="ch"><span class="lab">' + esc(ch.label) + (ch.min ? ' <i>(au moins ' + ch.min + " lignes)</i>" : "") + '</span><div class="tbl"><table class="grille"><thead><tr><th></th>' +
        ch.cols.map(function (c) { return "<th>" + esc(c.label) + "</th>"; }).join("") + "</tr></thead><tbody>";
      lignes.forEach(function (l, i) {
        var r = g[i] || {};
        h += '<tr><th scope="row">' + esc(l) + "</th>" + ch.cols.map(function (c) {
          var attr = 'data-k="' + ch.k + '" data-r="' + i + '" data-c="' + c.k + '" aria-label="' + esc(l + " : " + c.label) + '"' + dis;
          var st = c.w ? ' style="min-width:' + Math.round(c.w * 120) + 'px"' : ' style="min-width:110px"';
          if (c.type === "select") return "<td" + st + ">" + selectHTML(c.options, r[c.k], attr) + "</td>";
          if (c.type === "number") return "<td" + st + '><input type="number" min="0" max="100" step="1" ' + attr + ' value="' + esc(r[c.k] || "") + '"></td>';
          return "<td" + st + '><textarea rows="1" class="cel" ' + attr + ">" + esc(r[c.k] || "") + "</textarea></td>";
        }).join("") + "</tr>";
      });
      return h + "</tbody></table></div></div>";
    }
    if (ch.type === "image") {
      var img = v && v.src ? '<img src="' + v.src + '" alt="Capture ajoutée">' : "";
      return '<div class="ch">' + lab + '<div class="capture" data-cap="' + ch.k + '">' + img +
        (bloque ? "" : '<label class="btn petit">' + (img ? "Remplacer la capture" : "Ajouter une capture") + '<input type="file" accept="image/*" data-img="' + ch.k + '" class="sr"></label>' +
        (img ? ' <button type="button" class="lien" data-suppr-img="' + ch.k + '">Retirer</button>' : "")) +
        '<p class="note">Faites une capture (touche Impr. écran, ou Windows + Maj + S), enregistrez-la, puis ajoutez le fichier ici.</p></div></div>';
    }
    if (ch.type === "radar") return '<div class="ch"><span class="lab">' + esc(ch.label) + '</span><div class="radar-zone" data-radar="' + ch.source + '"></div></div>';
    return "";
  }
  function selectHTML(options, v, attr) {
    return "<select " + attr + '><option value="">Choisir…</option>' + options.map(function (o) {
      return '<option value="' + esc(o) + '"' + (v === o ? " selected" : "") + ">" + esc(o) + "</option>";
    }).join("") + "</select>";
  }
  function brancherChamps(racine, apres) {
    $$("[data-k]", racine).forEach(function (el) {
      var evt = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(evt, function () {
        var k = el.getAttribute("data-k"), r = el.getAttribute("data-r"), c = el.getAttribute("data-c");
        if (r != null) {
          var g = S.champs[k] || (S.champs[k] = {});
          var ligne = g[r] || (g[r] = {});
          ligne[c] = el.value;
        } else S.champs[k] = el.value;
        if (el.classList.contains("cel")) autoHauteur(el);
        sauver();
        if (apres) apres();
        majStatut(); rendreNav();
      });
      if (el.classList.contains("cel")) autoHauteur(el);
    });
    $$("[data-img]", racine).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var f = inp.files && inp.files[0]; if (!f) return;
        reduireImage(f, function (res) {
          if (!res) { alerte("Cette image n'a pas pu être lue. Essayez une capture au format PNG ou JPG."); return; }
          S.champs[inp.getAttribute("data-img")] = res; sauver(true);
          if (!stockageOK) alerte("La capture est trop lourde pour être enregistrée sur cet ordinateur : elle sera dans le PDF si vous le téléchargez sans fermer la page.");
          rendre();
        });
      });
    });
    $$("[data-suppr-img]", racine).forEach(function (b) {
      b.addEventListener("click", function () { delete S.champs[b.getAttribute("data-suppr-img")]; sauver(true); rendre(); });
    });
  }
  function autoHauteur(t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 260) + "px"; }
  function reduireImage(fichier, fin) {
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 1400, w = im.naturalWidth, h = im.naturalHeight, r = Math.min(1, max / Math.max(w, h));
        w = Math.max(1, Math.round(w * r)); h = Math.max(1, Math.round(h * r));
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); cx.drawImage(im, 0, 0, w, h);
        fin({ src: cv.toDataURL("image/jpeg", 0.72), w: w, h: h });
      };
      im.onerror = function () { fin(null); };
      im.src = lecteur.result;
    };
    lecteur.onerror = function () { fin(null); };
    lecteur.readAsDataURL(fichier);
  }

  /* ======================= Pièce 7 : scores et radar ======================= */
  function lignesFCS() {
    var g = val("p7_g") || {}, l = [];
    for (var i = 0; i < 6; i++) { var r = g[i] || {}; if (r.f && String(r.f).trim()) l.push(r); }
    return l;
  }
  function scoresFCS() {
    var l = lignesFCS(), tp = 0, sc = { g: 0, a: 0, t: 0 };
    l.forEach(function (r) { var p = parseFloat(String(r.p || "").replace(",", ".")) || 0; tp += p; ["g", "a", "t"].forEach(function (k) { sc[k] += p / 100 * (parseFloat(r[k]) || 0); }); });
    return { total: tp, sc: sc, n: l.length };
  }
  function fr2(x) { return x.toFixed(2).replace(".", ","); }
  var SERIES = [{ k: "g", nom: "GiFi", coul: "#151515", pdf: [0.08, 0.08, 0.08], tirets: "" }, { k: "a", nom: "Action", coul: "#1f4fd1", pdf: [0.12, 0.31, 0.82], tirets: "6 3" }, { k: "t", nom: "Temu", coul: "#a8262f", pdf: [0.66, 0.15, 0.18], tirets: "2 2.5" }];
  function majRadar() {
    $$("[data-radar]").forEach(function (z) {
      var l = lignesFCS(), s = scoresFCS();
      var info = '<p class="scores">Total des poids : <b>' + s.total + " %</b>" + (s.total === 100 ? " ✓" : " (le total doit faire 100 %)") +
        (s.n ? " · Scores pondérés de votre grille : GiFi <b>" + fr2(s.sc.g) + "</b> · Action <b>" + fr2(s.sc.a) + "</b> · Temu <b>" + fr2(s.sc.t) + "</b> (sur 5)" : "") + "</p>";
      if (l.length < 3) { z.innerHTML = info + '<p class="note">Le radar apparaît dès que 3 FCS sont remplis.</p>'; return; }
      z.innerHTML = info + radarSVG(l);
    });
  }
  function radarSVG(l) {
    if (l.length < 3) return "";
    {
      var n = l.length, R = 120, cx = 210, cy = 160;
      function pt(i, v) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; }
      var svg = '<svg viewBox="0 0 560 330" role="img" aria-label="Radar des FCS : GiFi, Action et Temu">';
      for (var g = 1; g <= 5; g++) svg += '<polygon fill="none" stroke="#e3e3df" points="' + l.map(function (_, i) { return pt(i, g).join(","); }).join(" ") + '"/>';
      l.forEach(function (r, i) {
        var e = pt(i, 5), t = pt(i, 5.75), anchor = t[0] > cx + 5 ? "start" : t[0] < cx - 5 ? "end" : "middle";
        svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="#cdcdc7"/>';
        svg += '<text x="' + t[0] + '" y="' + (t[1] + 4) + '" text-anchor="' + anchor + '" font-size="11.5" fill="#484845">' + esc(String(r.f).slice(0, 30)) + "</text>";
      });
      SERIES.forEach(function (se, j) {
        svg += '<polygon fill="none" stroke="' + se.coul + '" stroke-width="2.4"' + (se.tirets ? ' stroke-dasharray="' + se.tirets + '"' : "") + ' points="' + l.map(function (r, i) { return pt(i, parseFloat(r[se.k]) || 0).join(","); }).join(" ") + '"/>';
        svg += '<line x1="440" x2="476" y1="' + (40 + j * 24) + '" y2="' + (40 + j * 24) + '" stroke="' + se.coul + '" stroke-width="2.4"' + (se.tirets ? ' stroke-dasharray="' + se.tirets + '"' : "") + "/>";
        svg += '<text x="484" y="' + (44 + j * 24) + '" font-size="13" font-weight="700" fill="#151515">' + se.nom + "</text>";
      });
      return svg + "</svg>";
    }
  }

  /* ======================= Vues ======================= */
  function rendre() {
    rendreNav(); majStatut(); majSauve();
    var v = $("#vue"), id = S.vue;
    if (!accessible(id)) id = S.vue = "accueil";
    if (id === "accueil") v.innerHTML = vueAccueil();
    else if (id === "quiz") v.innerHTML = vueQuiz();
    else if (id === "rapport") v.innerHTML = vueRapport();
    else if (id === "envoi") v.innerHTML = vueEnvoi();
    else v.innerHTML = vuePiece(+id.slice(1));
    brancher(id);
  }

  function uneHTML() {
    return '<div class="une-mini"><div class="u-tete"><span class="u-nom">La Gazette du Commerce</span><span class="u-date">' + D.une.date + '</span></div>' +
      '<h2 class="u-titre">' + D.une.titre + "</h2><p>" + D.une.texte + '</p><p class="u-rappel">' + D.une.rappel + '</p>' +
      '<p class="u-fictif">Journal fictif créé pour l\'exercice. Les faits rapportés sont réels et sourcés.</p></div>';
  }
  function baremeHTML() {
    return '<div class="tbl"><table class="cc bareme"><thead><tr><th>Ce qui se passe</th><th>Trésorerie</th></tr></thead><tbody>' +
      "<tr><td>Capital de départ du cabinet</td><td><b>" + euros(B.depart) + "</b></td></tr>" +
      "<tr><td>Échauffement : chaque bonne réponse au « Vrai ou faux ? »</td><td class=\"g\">" + signe(B.quiz) + "</td></tr>" +
      "<tr><td>Code trouvé (la pièce suivante s'ouvre)</td><td class=\"g\">" + signe(B.code) + "</td></tr>" +
      "<tr><td>Code refusé (à chaque essai faux)</td><td class=\"p\">" + signe(B.erreur) + "</td></tr>" +
      "<tr><td>Indice acheté (un par pièce)</td><td class=\"p\">" + signe(B.indice) + "</td></tr>" +
      "<tr><td>Pièce passée sans le code (la pièce suivante s'ouvre quand même)</td><td class=\"p\">" + signe(B.passer) + "</td></tr>" +
      "<tr><td>Toutes les réponses d'une pièce remplies</td><td class=\"g\">" + signe(B.livrable) + "</td></tr>" +
      "<tr><td>Réponse rédigée à une Breaking news</td><td class=\"g\">" + signe(B.breaking) + "</td></tr>" +
      "<tr><td>Rapport final complet</td><td class=\"g\">" + signe(B.rapport) + "</td></tr>" +
      "</tbody></table></div>";
  }
  function planHTML() {
    var t = S.debut, cumul = 0;
    return '<div class="tbl"><table class="cc plan"><thead><tr><th>Étape</th><th>Durée conseillée</th>' + (t ? "<th>À finir vers</th>" : "") + "</tr></thead><tbody>" +
      D.plan.map(function (e) {
        cumul += e.duree;
        var nom = typeof e.id === "number" ? "Pièce " + e.id + " · " + PIECE[e.id].titre : e.nom;
        return "<tr><td>" + esc(nom) + "</td><td>" + e.duree + " min</td>" + (t ? "<td>" + hm(t + cumul * 60000) + "</td>" : "") + "</tr>";
      }).join("") + "<tr><td><b>Total</b></td><td><b>3 h 10</b></td>" + (t ? "<td><b>" + hm(t + cumul * 60000) + "</b></td>" : "") + "</tr></tbody></table></div>";
  }
  function vueAccueil() {
    var h = '<div class="p-tete"><div><div class="kick">MA28 · Bloc 1, C1.1 · Séances 1 à 8 · Version autonome</div>' +
      '<h1 class="p-titre">Cold case GiFi : l\'enquête en autonomie</h1>' +
      '<p class="p-sous">3 h 10 pour comprendre ce que l\'étude de marché et la veille n\'ont pas vu. Vous travaillez seuls : tout est sur ce site, et rien n\'est bloquant.</p></div></div>';
    h += '<div class="grille2"><div>' + uneHTML() + '</div><div class="chemise"><span class="etiq">Lettre de mission</span><p>' +
      (S.cabinet ? "Cabinet <b>" + esc(S.cabinet) + "</b>,</p><p>" : "Cabinet,</p><p>") + esc(D.lettre) + "</p></div></div>";
    if (!lance()) {
      h += '<section class="bloc mt"><h2 class="h-sec">1. Constituez votre cabinet</h2>' +
        '<p>Un cabinet = 3 ou 4 étudiants, sur <b>un seul ordinateur</b> (les téléphones servent aux recherches). L\'autre cabinet fait la même chose sur son propre ordinateur.</p>' +
        '<div class="form-cab"><label class="ch"><span class="lab">Nom du cabinet</span><input type="text" id="f-cab" maxlength="40" placeholder="Par exemple : Cabinet Lumière" value="' + esc(S.cabinet) + '"></label>' +
        [0, 1, 2, 3].map(function (i) { return '<label class="ch"><span class="lab">Membre ' + (i + 1) + (i === 3 ? " <i>(si vous êtes 4)</i>" : "") + ' : prénom et nom</span><input type="text" class="f-mb" data-i="' + i + '" maxlength="60" value="' + esc(S.membres[i] || "") + '"></label>'; }).join("") +
        "</div></section>";
      h += regles();
      h += '<section class="bloc mt lancer"><h2 class="h-sec">3. Lancez l\'enquête</h2><p>Le chrono de 3 h 10 démarre au clic. Il ne s\'arrête pas, même si vous fermez la page : vos réponses restent enregistrées sur cet ordinateur.</p>' +
        '<label class="coche"><input type="checkbox" id="f-lu"> Nous avons lu les règles du jeu.</label>' +
        '<p><button type="button" class="btn pri grand" id="b-lancer">Lancer l\'enquête</button></p><p class="msg" id="m-lancer" role="status"></p></section>' +
        '<section class="bloc mt"><h2 class="h-sec">Vous changez d\'ordinateur en cours d\'enquête ?</h2><p>Reprenez le fichier de sauvegarde téléchargé sur l\'ancien ordinateur (page « Envoi »).</p>' +
        '<label class="btn">Reprendre une sauvegarde<input type="file" accept=".json,application/json" id="f-reprise" class="sr"></label><p class="msg" id="m-reprise" role="status"></p></section>';
    } else {
      h += '<section class="bloc mt"><h2 class="h-sec">Votre cabinet</h2><p><b>' + esc(S.cabinet) + "</b> · " + esc(S.membres.filter(Boolean).join(", ")) +
        ' · enquête lancée à ' + hm(S.debut) + '</p><details><summary>Corriger le nom ou les membres</summary><div class="form-cab">' +
        '<label class="ch"><span class="lab">Nom du cabinet</span><input type="text" id="f-cab" maxlength="40" value="' + esc(S.cabinet) + '"></label>' +
        [0, 1, 2, 3].map(function (i) { return '<label class="ch"><span class="lab">Membre ' + (i + 1) + '</span><input type="text" class="f-mb" data-i="' + i + '" maxlength="60" value="' + esc(S.membres[i] || "") + '"></label>'; }).join("") +
        '</div></details><p class="mt"><button type="button" class="btn pri" data-aller="' + (Object.keys(S.quiz).length < D.quiz.length ? "quiz" : "p" + (pieceEnCours() || 8)) + '">Continuer l\'enquête →</button></p></section>';
      h += regles();
    }
    return h;
  }
  function regles() {
    return '<section class="bloc mt"><h2 class="h-sec">' + (lance() ? "Les règles du jeu" : "2. Les règles du jeu") + "</h2>" +
      '<div class="grille2"><div><ul class="regles">' +
      "<li><b>8 pièces à conviction</b>, une par séance de cours (S1 à S8), dans l'ordre. Commencez par l'échauffement (5 questions, 8 min).</li>" +
      "<li>Dans chaque pièce : lisez les documents, faites les étapes et <b>écrivez vos réponses dans les cadres</b>. <b>Tout le livrable se rend dans le site</b> : rien sur papier, rien sur une affiche, rien dans un autre fichier. En tête de chaque pièce, l'encadré « Votre livrable » coche chaque élément rendu. Tout part dans votre PDF final.</li>" +
      "<li><b>Chaque pièce cache un code.</b> Le bon code rapporte de l'argent et ouvre la pièce suivante.</li>" +
      "<li><b>Rien n'est bloquant.</b> Si vous séchez : achetez un indice. Si vous séchez encore : passez la pièce. Elle vous coûte de l'argent, mais la suivante s'ouvre.</li>" +
      "<li><b>La correction</b> d'une pièce s'affiche quand vous la demandez, après le code trouvé ou la pièce passée. Elle <b>verrouille vos réponses</b> de cette pièce : remplissez tout avant de la demander.</li>" +
      "<li><b>3 Breaking news</b> tombent à l'ouverture des pièces 3, 6 et 8 : répondez à leur question.</li>" +
      "<li>Pas de rôles : tout le monde cherche, lit, calcule, écrit. Répartissez-vous les tâches à parts égales. Avant de valider : « Qui le dit ? Depuis quand ? Et alors, pour nous ? »</li>" +
      "<li><b>À la fin</b> : le rapport final, puis vous téléchargez le PDF et vous l'envoyez à " + D.emails.join(" et ") + ".</li>" +
      "</ul></div><div><h3 class=\"h-mini\">La trésorerie du cabinet</h3>" + baremeHTML() +
      "<h3 class=\"h-mini\">Le plan des 3 h 10</h3>" + planHTML() + "</div></div></section>";
  }

  function vueQuiz() {
    var h = '<div class="titre-vue"><div class="kick">Échauffement · 8 min</div><h1>Vrai ou faux ?</h1><p class="p-sous">5 affirmations sur GiFi et son marché. Mettez-vous d\'accord dans le cabinet, puis répondez. Chaque bonne réponse rapporte ' + euros(B.quiz) + ". Une réponse donnée est définitive.</p></div><ol class=\"quiz\">";
    D.quiz.forEach(function (q, i) {
      var r = S.quiz[i], sol = QUIZ[i] || {};
      h += '<li class="bloc q"><p class="q-t">' + esc(q) + "</p>";
      if (r) {
        var ok = r === sol.r;
        h += '<p class="q-res ' + (ok ? "ok" : "ko") + '"><b>' + (ok ? "✓ Bonne réponse " + signe(B.quiz) : "✗ Mauvaise réponse") + "</b> · vous avez répondu « " + (r === "V" ? "Vrai" : "Faux") + " »</p><p>" + (sol.ex || "") + "</p>";
      } else h += '<p><button type="button" class="btn" data-quiz="' + i + '" data-r="V">Vrai</button> <button type="button" class="btn" data-quiz="' + i + '" data-r="F">Faux</button></p>';
      h += "</li>";
    });
    h += "</ol>";
    h += '<p class="mt"><button type="button" class="btn pri grand" data-aller="p1">Ouvrir la pièce 1 →</button></p>';
    return h;
  }

  function vuePiece(n) {
    var p = PIECE[n], e = etatP(n), bloque = e.clos, comp = completudePiece(n);
    var h = '<div class="titre-vue"><div class="kick">Pièce ' + n + " sur 8 · Séance " + p.seance + " · Dossier : " + esc(p.lien) + "</div><h1>Pièce " + n + " · " + esc(p.titre) + "</h1>" +
      '<p class="p-sous">' + esc(p.objectif) + "</p>" +
      '<p class="temps" id="temps-piece" data-n="' + n + '"></p></div>';
    h += livrableHTML(n);
    if (D.breaking[n]) h += breakingBloc(n, bloque);
    if (bloque) h += '<p class="bloc beige">🔒 La correction a été consultée à ' + hm(e.t_clos) + " : les réponses de cette pièce sont verrouillées.</p>";
    h += '<section class="chemise"><span class="etiq">Les pièces du dossier</span><div class="doc">' + p.materiel + "</div></section>";
    etapesDe(p).forEach(function (et) {
      h += '<section class="bloc etape mt"><h2 class="h-sec">' + esc(et.titre) + '</h2><p class="consigne">' + esc(et.consigne) + "</p>" +
        et.champs.map(function (ch) { return champHTML(ch, p, bloque); }).join("") + "</section>";
    });
    h += '<p class="compte" id="compte">' + compteTexte(comp) + "</p>";
    h += codeBox(n);
    return h;
  }
  function compteTexte(c) {
    return c.ok ? "✓ Toutes les réponses de cette pièce sont remplies : " + signe(B.livrable) + " dans la trésorerie."
      : "Réponses remplies : " + c.faits + " sur " + c.total + ". Tout remplir rapporte " + signe(B.livrable) + ".";
  }
  function codeBox(n) {
    var p = PIECE[n], e = etatP(n), h = '<section class="codebox mt" id="codebox"><h2 class="h-sec">Le code de la pièce ' + n + "</h2>";
    if (!e.statut) {
      h += '<p><b>' + esc(p.code.label) + " :</b> " + esc(p.code.aide) + "</p>" +
        '<form class="code-form" id="f-code"><label class="sr" for="code-in">Code de la pièce ' + n + '</label><input id="code-in" autocomplete="off" spellcheck="false" placeholder="Votre code" maxlength="12">' +
        '<button class="btn pri" type="submit">Valider le code</button></form><p class="msg" id="m-code" role="status" aria-live="polite">' +
        (e.essais ? e.essais + " code" + (e.essais > 1 ? "s" : "") + " refusé" + (e.essais > 1 ? "s" : "") + " sur cette pièce." : "") + "</p>";
      if (e.indice) h += '<div class="indice"><b>Indice</b><p>' + esc(deBrouiller(SEC.i[n])) + "</p></div>";
      h += '<div class="secours"><p class="lib-sec">Vous séchez ?</p>' +
        (e.indice ? "" : '<button type="button" class="btn beige" id="b-indice">Acheter un indice (' + signe(B.indice) + ")</button> ") +
        '<button type="button" class="btn" id="b-passer">Passer sans le code (' + signe(B.passer) + ")</button>" +
        '<p class="note">Passer ouvre la pièce suivante. Vous pourrez continuer à remplir les réponses de cette pièce.</p></div>';
    } else {
      var trouve = e.statut === "trouve";
      h += '<p class="resultat"><span class="tampon' + (trouve ? " vert" : "") + '" id="tampon">' + (trouve ? "Pièce versée au dossier" : "Pièce passée") + "</span> " +
        (trouve ? "Code trouvé à " + hm(e.t_fin) + " : " + signe(B.code) + "." : "Pièce passée à " + hm(e.t_fin) + " : " + signe(B.passer) + ".") + "</p>";
      if (e.indice) h += '<div class="indice"><b>Indice acheté</b><p>' + esc(deBrouiller(SEC.i[n])) + "</p></div>";
      h += '<p class="actions">' + (n < 8 ? '<button type="button" class="btn pri grand" data-aller="p' + (n + 1) + '">Ouvrir la pièce ' + (n + 1) + " →</button>" : '<button type="button" class="btn pri grand" data-aller="rapport">Rédiger le rapport final →</button>') + "</p>";
      if (!e.clos) h += '<div class="correction-av"><p><b>La correction</b> : quand vos réponses sont complètes, affichez-la pour vérifier votre travail. Attention, <b>elle verrouille vos réponses de cette pièce</b>.</p><button type="button" class="btn" id="b-corr">Voir la correction et verrouiller mes réponses</button></div>';
      else h += '<div class="correction doc"><p class="lib-sec">Correction · pièce ' + n + "</p>" + deBrouiller(SEC.c[n]) + "</div>";
    }
    return h + "</section>";
  }
  function breakingBloc(n, bloque) {
    var b = D.breaking[n];
    return '<section class="breaking-bloc"><div class="bk-bandeau">Breaking news n° ' + b.n + "</div><h2>« " + esc(b.titre) + " »</h2><p>" + esc(b.texte) + '</p><p class="src">Source : ' + esc(b.source) + "</p>" +
      '<label class="ch"><span class="lab">La question : ' + esc(b.question) + '</span><textarea rows="3" data-k="bn' + b.n + '"' + (bloque ? " disabled" : "") + ">" + esc(val("bn" + b.n) || "") + "</textarea></label>" +
      '<p class="note">Répondre rapporte ' + signe(B.breaking) + " (au moins une phrase).</p></section>";
  }
  function montrerBreaking(n) {
    var b = D.breaking[n];
    S.bn[n] = { vu: true }; sauver(true);
    var o = document.createElement("div");
    o.className = "bk-over"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Breaking news");
    o.innerHTML = '<div class="bk-boite"><div class="bk-bandeau grand">BREAKING NEWS</div><p class="bk-heure">' + hm(maintenant()) + "</p><h2>« " + esc(b.titre) + " »</h2><p>" + esc(b.texte) +
      '</p><p class="src">Source : ' + esc(b.source) + '</p><p class="bk-q"><b>La question :</b> ' + esc(b.question) + '</p><p><button type="button" class="btn pri grand" id="bk-ok">Compris : on y répond dans la pièce</button></p></div>';
    document.body.appendChild(o);
    var ok = $("#bk-ok", o); ok.focus();
    function fermer() { o.remove(); var t = $('[data-k="bn' + b.n + '"]'); if (t) t.scrollIntoView({ block: "center" }); }
    ok.addEventListener("click", fermer);
    o.addEventListener("keydown", function (ev) { if (ev.key === "Escape") fermer(); });
  }

  function vueRapport() {
    var c = completudeRapport();
    var h = '<div class="titre-vue"><div class="kick">Fin de l\'enquête · 20 min avec l\'envoi</div><h1>' + esc(D.rapport.titre) + '</h1><p class="p-sous">' + esc(D.rapport.consigne) + "</p></div>";
    h += '<section class="bloc beige"><p class="lib-sec">Vos preuves, pièce par pièce</p><ul class="rappel-preuves">' + D.pieces.map(function (p) {
      var v = val("p" + p.id + "_preuve");
      return "<li><b>Pièce " + p.id + " · " + esc(p.titre) + " :</b> " + (v ? esc(v) : "<i>non renseignée</i>") + "</li>";
    }).join("") + [1, 2, 3].map(function (n) { var v = val("bn" + n); return "<li><b>Breaking news " + n + " :</b> " + (v ? esc(v) : "<i>non renseignée</i>") + "</li>"; }).join("") + "</ul></section>";
    h += '<section class="bloc etape mt">' + D.rapport.champs.map(function (ch) { return champHTML(ch, null, false); }).join("") + "</section>";
    h += '<p class="compte" id="compte">' + (c.ok ? "✓ Rapport complet : " + signe(B.rapport) + " dans la trésorerie." : "Réponses remplies : " + c.faits + " sur " + c.total + ". Un rapport complet rapporte " + signe(B.rapport) + ".") + "</p>";
    h += '<p class="mt"><button type="button" class="btn pri grand" data-aller="envoi">Télécharger et envoyer le PDF →</button></p>';
    return h;
  }

  function resumeLignes() {
    return D.pieces.map(function (p) {
      var e = etatP(p.id), c = completudePiece(p.id);
      var t = e.ouv && e.t_fin ? duree(e.t_fin - e.ouv) : e.ouv ? "en cours" : "-";
      return ["Pièce " + p.id + " · " + p.titre, e.statut === "trouve" ? "Trouvé" : e.statut === "passe" ? "Passé" : e.ouv ? "Pas encore" : "Non ouverte",
        String(e.essais || 0), e.indice ? "Oui" : "Non", t, c.faits + " / " + c.total, e.clos ? "Oui, " + hm(e.t_clos) : "Non"];
    });
  }
  function vueEnvoi() {
    var fini = !!etatP(8).statut && completudeRapport().ok;
    var h = '<div class="titre-vue"><div class="kick">Le rendu</div><h1>Télécharger et envoyer votre PDF</h1><p class="p-sous">Le PDF contient tout votre travail : le rapport final, les réponses de chaque pièce, les Breaking news, la trésorerie et les temps.</p></div>';
    if (!fini) h += '<p class="bloc beige">⚠ L\'enquête n\'est pas terminée (pièces ou rapport final incomplets). Vous pouvez télécharger un PDF provisoire pour faire une sauvegarde, mais envoyez le PDF définitif à la fin.</p>';
    h += '<section class="bloc mt"><h2 class="h-sec">Où vous en êtes</h2><div class="tbl"><table class="cc"><thead><tr><th>Pièce</th><th>Code</th><th>Codes refusés</th><th>Indice</th><th>Temps</th><th>Réponses</th><th>Correction vue</th></tr></thead><tbody>' +
      resumeLignes().map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
      "<p>Trésorerie actuelle : <b>" + euros(solde()) + "</b></p>" + tresoDetail() + "</section>";
    h += '<section class="bloc mt etape-envoi"><h2 class="h-sec">Étape 1 : téléchargez le PDF</h2>' +
      '<p><button type="button" class="btn pri grand" id="b-pdf">Télécharger le PDF</button></p>' +
      '<p class="msg" id="m-pdf" role="status">' + (S.pdf ? "Dernier PDF téléchargé à " + hm(S.pdf) + " : " + esc(nomFichier()) : "") + "</p>" +
      '<p class="note">Le fichier arrive dans le dossier <b>Téléchargements</b> de l\'ordinateur, sous le nom <b>' + esc(nomFichier()) + '</b>. Si rien ne se télécharge : <button type="button" class="lien" id="b-print">imprimer la page et choisir « Enregistrer au format PDF »</button>.</p></section>';
    var sujet = "Cold case GiFi : rapport du cabinet " + (S.cabinet || "");
    h += '<section class="bloc mt etape-envoi"><h2 class="h-sec">Étape 2 : envoyez-le par mail</h2>' +
      "<p>Envoyez le PDF <b>en pièce jointe</b> aux deux adresses :</p>" +
      '<ul class="adresses">' + D.emails.map(function (m) { return "<li><b>" + m + '</b> <button type="button" class="btn petit" data-copie="' + m + '">Copier</button></li>'; }).join("") + "</ul>" +
      "<p>Objet du mail : <b>" + esc(sujet) + '</b> <button type="button" class="btn petit" data-copie="' + esc(sujet) + '">Copier</button></p>' +
      '<p><a class="btn" id="b-mail" href="' + esc(lienMail(sujet)) + '">Ouvrir ma messagerie avec le mail prérempli</a></p>' +
      '<p class="note">Le bouton ouvre la messagerie de l\'ordinateur. Si elle ne s\'ouvre pas, allez sur votre messagerie habituelle (Outlook, Gmail…), écrivez aux deux adresses ci-dessus et <b>joignez le PDF</b> avant d\'envoyer. Un seul envoi par cabinet ; mettez tous les membres en copie si vous le pouvez.</p></section>';
    h += '<section class="bloc mt"><h2 class="h-sec">Changer d\'ordinateur sans rien perdre</h2><p>Téléchargez la sauvegarde de l\'enquête (un petit fichier). Sur l\'autre ordinateur, ouvrez le site et, sur la page d\'accueil, cliquez sur « Reprendre une sauvegarde » : vous repartez exactement où vous en étiez.</p>' +
      '<p><button type="button" class="btn" id="b-save">Télécharger la sauvegarde</button></p></section>';
    return h;
  }
  function tresoDetail() {
    var l = S.journal.map(function (j) { return "<tr><td>" + hm(j.t) + "</td><td>" + esc(j.m) + '</td><td class="' + (j.v >= 0 ? "g" : "p") + '">' + signe(j.v) + "</td></tr>"; }).join("") +
      bonus().map(function (b) { return "<tr><td>-</td><td>" + esc(b.m) + '</td><td class="g">' + signe(b.v) + "</td></tr>"; }).join("");
    return '<details><summary>Le détail de la trésorerie</summary><div class="tbl"><table class="cc"><thead><tr><th>Heure</th><th>Motif</th><th>Montant</th></tr></thead><tbody>' +
      "<tr><td>" + (S.debut ? hm(S.debut) : "-") + "</td><td>Capital de départ</td><td>" + euros(B.depart) + "</td></tr>" + l + "</tbody></table></div></details>";
  }
  function nomFichier() {
    var c = norm(S.cabinet).slice(0, 24) || "CABINET", d = new Date(S.debut || maintenant());
    return "ColdCaseGiFi_" + c + "_" + d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + ".pdf";
  }
  function lienMail(sujet) {
    var corps = "Bonjour,\n\nVeuillez trouver ci-joint le rapport d'enquête Cold case GiFi du cabinet " + (S.cabinet || "") + ".\n\nMembres : " + S.membres.filter(Boolean).join(", ") +
      "\nTrésorerie finale : " + euros(solde()).replace(/ | /g, " ") + "\n\nCordialement,\n" + S.membres.filter(Boolean).join(", ");
    return "mailto:" + D.emails.join(",") + "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
  }

  /* ======================= Événements ======================= */
  function brancher(id) {
    var v = $("#vue");
    $$("[data-aller]", v).forEach(function (b) { b.addEventListener("click", function () { aller(b.getAttribute("data-aller")); }); });
    if (id === "accueil") brancherAccueil();
    if (id === "quiz") $$("[data-quiz]", v).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-quiz"), r = b.getAttribute("data-r");
        if (S.quiz[i]) return;
        S.quiz[i] = r;
        var ok = QUIZ[i] && QUIZ[i].r === r;
        if (ok) noter("Échauffement : bonne réponse à la question " + (i + 1), B.quiz);
        sauver(true); rendre();
      });
    });
    if (id[0] === "p" && id !== "accueil") brancherPiece(+id.slice(1));
    if (id === "rapport") brancherChamps(v, function () {
      var c = completudeRapport();
      $("#compte").textContent = c.ok ? "✓ Rapport complet : " + signe(B.rapport) + " dans la trésorerie." : "Réponses remplies : " + c.faits + " sur " + c.total + ". Un rapport complet rapporte " + signe(B.rapport) + ".";
    });
    if (id === "envoi") brancherEnvoi();
  }
  function brancherAccueil() {
    var cab = $("#f-cab");
    if (cab) cab.addEventListener("input", function () { S.cabinet = cab.value.trim(); sauver(); majStatut(); });
    $$(".f-mb").forEach(function (m) { m.addEventListener("input", function () { S.membres[+m.getAttribute("data-i")] = m.value.trim(); sauver(); }); });
    var rep = $("#f-reprise");
    if (rep) rep.addEventListener("change", function () {
      var f = rep.files && rep.files[0], m = $("#m-reprise"); if (!f) return;
      var lec = new FileReader();
      lec.onload = function () {
        try {
          var o = JSON.parse(lec.result);
          if (!o || o.v !== 1 || !o.debut || !o.pieces || !o.champs) throw new Error("format");
          S = o; sauver(true); m.textContent = ""; aller(S.vue && accessible(S.vue) ? S.vue : "accueil"); rendre();
          alerte("Sauvegarde reprise : vous repartez où vous en étiez.");
        } catch (e) { m.textContent = "Ce fichier n'est pas une sauvegarde Cold case GiFi."; }
      };
      lec.readAsText(f);
    });
    var b = $("#b-lancer");
    if (b) b.addEventListener("click", function () {
      var msg = $("#m-lancer");
      if (!S.cabinet) { msg.textContent = "Donnez un nom à votre cabinet."; $("#f-cab").focus(); return; }
      if (!S.membres.filter(Boolean).length) { msg.textContent = "Écrivez le nom d'au moins un membre."; $(".f-mb").focus(); return; }
      if (!$("#f-lu").checked) { msg.textContent = "Cochez « Nous avons lu les règles du jeu »."; $("#f-lu").focus(); return; }
      S.debut = maintenant();
      sauver(true);
      aller("quiz");
    });
  }
  function brancherPiece(n) {
    var v = $("#vue"), e = etatP(n);
    function majCompte() { var c = $("#compte"); if (c) c.textContent = compteTexte(completudePiece(n)); }
    brancherChamps(v, function () { majCompte(); majLivrable(n); if (n === 7) majRadar(); });
    brancherVers();
    // Pièce 4 : les cartes à retourner
    var z4 = $('[data-widget="cartes-p4"]', v);
    if (z4) {
      z4.innerHTML = PIECE[4].cartes.map(function (c, i) {
        return '<div class="carte4"><div class="c4-face"><span class="c4-n">Carte ' + (i + 1) + "</span><p>" + esc(c.t) + '</p><p class="pied-carte">Document d\'exercice · Cold case GiFi</p></div>' +
          '<div class="c4-dos" hidden><span class="c4-n">Carte ' + (i + 1) + ', au dos</span><b class="c4-l">' + c.l + "</b></div>" +
          '<button type="button" class="btn petit" data-retourner="' + i + '" aria-pressed="false">Retourner</button></div>';
      }).join("");
      $$("[data-retourner]", z4).forEach(function (b) {
        b.addEventListener("click", function () {
          var c = b.parentNode, dos = $(".c4-dos", c), face = $(".c4-face", c), montre = dos.hidden;
          dos.hidden = !montre; face.hidden = montre; b.setAttribute("aria-pressed", String(montre)); b.textContent = montre ? "Revoir la face" : "Retourner";
        });
      });
    }
    var z8 = $('[data-widget="cartes-p8"]', v);
    if (z8) z8.innerHTML = PIECE[8].indices15.map(function (c, i) {
      return '<div class="carte-doc"><b class="lettre">' + (i + 1) + '</b><h4>' + esc(c[0]) + "</h4><p>" + esc(c[1]) + '</p><p class="src">Source : ' + esc(c[2]) + '</p><p class="pied-carte">Document d\'exercice · Cold case GiFi</p></div>';
    }).join("");
    if (n === 7) majRadar();
    majTempsPiece();
    // Code
    var f = $("#f-code");
    if (f) f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var inp = $("#code-in"), m = $("#m-code"), saisie = norm(inp.value);
      if (!saisie) { m.textContent = "Saisissez un code."; return; }
      var bouton = $("button[type=submit]", f); bouton.disabled = true;
      sha256(saisie).then(function (h) {
        bouton.disabled = false;
        if (h === SEC.h[n]) {
          e.statut = "trouve"; e.t_fin = maintenant();
          noter("Pièce " + n + " : code trouvé", B.code);
          sauver(true); rendre();
          celebrer();
        } else {
          e.essais = (e.essais || 0) + 1;
          noter("Pièce " + n + " : code refusé (" + saisie + ")", B.erreur);
          sauver(true); majStatut();
          m.textContent = "Code refusé (" + signe(B.erreur) + "). " + (e.essais >= 3 ? "Déjà " + e.essais + " essais : pensez à l'indice, ou passez la pièce." : "Vérifiez votre calcul et le format demandé.");
          inp.classList.remove("tremble"); void inp.offsetWidth; inp.classList.add("tremble");
          inp.select();
        }
      });
    });
    var bi = $("#b-indice");
    if (bi) bi.addEventListener("click", function () {
      if (!confirm("Acheter l'indice de la pièce " + n + " ? Cela coûte " + euros(-B.indice) + " à votre cabinet.")) return;
      e.indice = true; noter("Pièce " + n + " : indice acheté", B.indice); sauver(true); rendre();
      var ind = $(".indice"); if (ind) ind.scrollIntoView({ block: "center" });
    });
    var bp = $("#b-passer");
    if (bp) bp.addEventListener("click", function () {
      if (!confirm("Passer la pièce " + n + " sans le code ? Cela coûte " + euros(-B.passer) + ". La pièce suivante s'ouvre, et vous pourrez encore compléter vos réponses de cette pièce.")) return;
      e.statut = "passe"; e.t_fin = maintenant(); noter("Pièce " + n + " : passée sans le code", B.passer); sauver(true); rendre();
      var cb = $("#codebox"); if (cb) cb.scrollIntoView({ block: "start" });
    });
    var bc = $("#b-corr");
    if (bc) bc.addEventListener("click", function () {
      var c = completudePiece(n);
      var txt = (c.ok ? "" : "Il manque des réponses (" + c.faits + " sur " + c.total + ").\n") + "Après la correction, vos réponses de la pièce " + n + " seront verrouillées. Afficher la correction ?";
      if (!confirm(txt)) return;
      e.clos = true; e.t_clos = maintenant(); sauver(true); rendre();
      var cb = $("#codebox"); if (cb) cb.scrollIntoView({ block: "start" });
    });
  }
  function celebrer() {
    var cb = $("#codebox"); if (cb) cb.scrollIntoView({ block: "start" });
    var t = $("#tampon");
    if (t && t.animate && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches))
      t.animate([{ transform: "rotate(-4deg) scale(2.2)", opacity: 0 }, { transform: "rotate(-4deg) scale(.92)", opacity: 1, offset: .7 }, { transform: "rotate(-4deg) scale(1)", opacity: 1 }], { duration: 650, easing: "ease-out" });
  }
  function majTempsPiece() {
    var el = $("#temps-piece"); if (!el) return;
    var n = +el.getAttribute("data-n"), e = etatP(n), conseil = (D.plan.filter(function (x) { return x.id === n; })[0] || {}).duree;
    if (!e.ouv) { el.textContent = ""; return; }
    var fin = e.t_fin || maintenant(), t = fin - e.ouv;
    el.textContent = "Temps conseillé : " + conseil + " min · temps passé sur cette pièce : " + duree(t) + (e.t_fin ? " (code réglé)" : "");
    el.className = "temps" + (!e.t_fin && t > conseil * 60000 ? " retard" : "");
  }
  function brancherEnvoi() {
    $("#b-pdf").addEventListener("click", function () {
      var m = $("#m-pdf");
      m.textContent = "Préparation du PDF…";
      setTimeout(function () {
        try {
          var blob = construirePDF();
          var url = URL.createObjectURL(blob), a = document.createElement("a");
          a.href = url; a.download = nomFichier(); document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
          S.pdf = maintenant(); sauver(true);
          m.innerHTML = "✓ PDF téléchargé à " + hm(S.pdf) + " : <b>" + esc(nomFichier()) + "</b> (dossier Téléchargements). Passez à l'étape 2.";
          rendreNav();
        } catch (err) {
          m.textContent = "Le PDF n'a pas pu être créé (" + err.message + "). Utilisez le lien « imprimer la page » ci-dessous.";
        }
      }, 30);
    });
    $("#b-print").addEventListener("click", imprimer);
    $("#b-save").addEventListener("click", function () {
      var url = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" })), a = document.createElement("a");
      a.href = url; a.download = nomFichier().replace(/\.pdf$/, "_sauvegarde.json"); document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
    });
    $$("[data-copie]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-copie");
        var fait = function () { b.textContent = "Copié ✓"; setTimeout(function () { b.textContent = "Copier"; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fait, function () { prompt("Copiez :", t); });
        else prompt("Copiez :", t);
      });
    });
    $("#b-mail").addEventListener("click", function () { $("#b-mail").href = lienMail("Cold case GiFi : rapport du cabinet " + (S.cabinet || "")); });
  }

  /* ======================= Le rapport (PDF et impression) ======================= */
  function valeurTexte(ch, p) {
    var v = val(ch.k);
    return v == null ? "" : String(v);
  }
  function blocsChamps(champs, p, out) {
    champs.forEach(function (ch) {
      if (ch.type === "grid") {
        var lignes = lignesDe(p, ch), g = val(ch.k) || {};
        out.push({ t: "table", titre: ch.label, cols: [{ label: "", w: ch.lignes === "indices15" ? 1.8 : 0.9 }].concat(ch.cols.map(function (c) { return { label: c.label, w: c.w || 1 }; })),
          rows: lignes.map(function (l, i) { var r = g[i] || {}; return [l].concat(ch.cols.map(function (c) { return r[c.k] || ""; })); }) });
      } else if (ch.type === "image") {
        var im = val(ch.k);
        if (im && im.src) out.push({ t: "image", titre: ch.label, src: im.src, w: im.w, h: im.h });
        else out.push({ t: "champ", label: ch.label, v: "", vide: "(capture non ajoutée)" });
      } else if (ch.type === "radar") {
        var l = lignesFCS();
        if (l.length >= 3) out.push({ t: "radar", axes: l.map(function (r) { return r.f; }), series: SERIES.map(function (s) { return { nom: s.nom, coul: s.pdf, tirets: s.tirets, css: s.coul, valeurs: l.map(function (r) { return parseFloat(r[s.k]) || 0; }) }; }) });
        var sc = scoresFCS();
        out.push({ t: "champ", label: "Scores pondérés de la grille du cabinet (total des poids : " + sc.total + " %)", v: sc.n ? "GiFi " + fr2(sc.sc.g) + " · Action " + fr2(sc.sc.a) + " · Temu " + fr2(sc.sc.t) + " (sur 5)" : "" });
      } else out.push({ t: "champ", label: ch.label, v: valeurTexte(ch, p) });
    });
  }
  function modele() {
    var m = [], fin = !!etatP(8).statut && completudeRapport().ok, now = maintenant();
    m.push({ t: "h1", v: "Cold case GiFi · Rapport d'enquête" });
    m.push({ t: "p", v: "Version autonome · Mastère Manager d'affaires MA28 · Bloc 1, C1.1 « Étude de marché et veille stratégique » · séances 1 à 8", c: "gris" });
    m.push({ t: "encadre", lignes: [
      { t: "Cabinet : " + (S.cabinet || "(sans nom)"), f: "B", size: 13 },
      { t: "Membres : " + (S.membres.filter(Boolean).join(", ") || "(non renseignés)") },
      { t: "Date : " + new Date(S.debut || now).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
      { t: "Enquête lancée à " + (S.debut ? hm(S.debut) : "-") + " · PDF créé à " + hm(now) + " · durée : " + (S.debut ? duree(now - S.debut) : "-") },
      { t: "Trésorerie finale : " + euros(solde()), f: "B", size: 12 },
      { t: fin ? "Enquête terminée." : "PDF PROVISOIRE : enquête non terminée.", f: "B", coul: fin ? [0.11, 0.48, 0.29] : [0.66, 0.15, 0.18] },
    ] });
    m.push({ t: "h2", v: "Tableau de bord" });
    m.push({ t: "table", cols: [{ label: "Pièce", w: 2 }, { label: "Code", w: 0.8 }, { label: "Codes refusés", w: 0.8 }, { label: "Indice", w: 0.6 }, { label: "Temps", w: 0.8 }, { label: "Réponses", w: 0.8 }, { label: "Correction vue", w: 1 }], rows: resumeLignes() });
    var quizBons = 0; D.quiz.forEach(function (q, i) { if (S.quiz[i] && QUIZ[i] && S.quiz[i] === QUIZ[i].r) quizBons++; });
    m.push({ t: "p", v: "Échauffement « Vrai ou faux ? » : " + quizBons + " bonne(s) réponse(s) sur " + D.quiz.length + " (" + Object.keys(S.quiz).length + " répondue(s))." });
    var tres = [["Départ", "Capital de départ", euros(B.depart)]].concat(S.journal.map(function (j) { return [hm(j.t), j.m, signe(j.v)]; }), bonus().map(function (b) { return ["Bonus", b.m, signe(b.v)]; }));
    tres.push(["", "Trésorerie finale", euros(solde())]);
    m.push({ t: "h3", v: "La trésorerie" });
    m.push({ t: "table", cols: [{ label: "Heure", w: 0.6 }, { label: "Motif", w: 3 }, { label: "Montant", w: 0.9 }], rows: tres });

    m.push({ t: "h2", v: "1. " + D.rapport.titre, sous: "La conclusion d'abord, puis les preuves." });
    blocsChamps(D.rapport.champs, null, m);

    D.pieces.forEach(function (p) {
      var e = etatP(p.id);
      m.push({ t: "h2", v: "Pièce " + p.id + " · " + p.titre, sous: "Séance " + p.seance + " · Dossier : " + p.lien + " · Code : " + (e.statut === "trouve" ? "trouvé" : e.statut === "passe" ? "pièce passée" : "non réglé") +
        (e.indice ? " · indice acheté" : "") + " · " + (e.essais || 0) + " code(s) refusé(s)" + (e.clos ? " · correction consultée à " + hm(e.t_clos) + " (réponses verrouillées ensuite)" : " · correction non consultée") });
      m.push({ t: "table", titre: "Le livrable de la pièce", cols: [{ label: "Élément du livrable", w: 4 }, { label: "État", w: 0.8 }],
        rows: livrable(p.id).map(function (x) { return [x.t, x.ok ? "Rendu" : "Incomplet"]; }) });
      if (D.breaking[p.id]) {
        var b = D.breaking[p.id];
        m.push({ t: "h3", v: "Breaking news n° " + b.n + " : « " + b.titre + " »" });
        m.push({ t: "champ", label: b.question, v: val("bn" + b.n) || "" });
      }
      etapesDe(p).forEach(function (et) {
        m.push({ t: "h3", v: et.titre });
        blocsChamps(et.champs, p, m);
      });
    });
    m.push({ t: "p", v: "Document produit par le site Cold case GiFi (version autonome). Les faits cités viennent des sources de l'atelier ; les cartes parcours de la pièce 4 et certaines cartes sont des situations d'exercice. Rappel : un redressement judiciaire n'est pas une liquidation.", c: "gris" });
    return m;
  }
  function construirePDF() {
    var doc = new window.MiniPDF({ titre: "Cold case GiFi · " + (S.cabinet || "Cabinet"), pied: "Cold case GiFi · rapport du cabinet " + (S.cabinet || "") + " · " + new Date().toLocaleDateString("fr-FR") });
    modele().forEach(function (b) {
      if (b.t === "h1") doc.h1(b.v);
      else if (b.t === "h2") doc.h2(b.v, b.sous);
      else if (b.t === "h3") doc.h3(b.v);
      else if (b.t === "p") doc.texte(b.v, { size: 9.5, coul: b.c === "gris" ? [0.35, 0.35, 0.33] : null, apres: 8 });
      else if (b.t === "encadre") doc.encadre(b.lignes);
      else if (b.t === "champ") doc.champ(b.label, b.v, b.vide);
      else if (b.t === "table") { if (b.titre) doc.texte(b.titre, { size: 8.5, f: "B", coul: [0.35, 0.35, 0.33], apres: 3 }); doc.tableau(b.cols, b.rows, { premiereGras: true }); }
      else if (b.t === "image") { doc.texte(b.titre, { size: 8.5, f: "B", coul: [0.35, 0.35, 0.33], apres: 3 }); doc.image(b.src, b.w, b.h); }
      else if (b.t === "radar") doc.radar(b.axes, b.series);
    });
    return doc.blob();
  }
  function imprimer() {
    var z = $("#impression");
    z.innerHTML = modele().map(function (b) {
      if (b.t === "h1") return "<h1>" + esc(b.v) + "</h1>";
      if (b.t === "h2") return "<h2>" + esc(b.v) + "</h2>" + (b.sous ? '<p class="gris">' + esc(b.sous) + "</p>" : "");
      if (b.t === "h3") return "<h3>" + esc(b.v) + "</h3>";
      if (b.t === "p") return '<p class="' + (b.c || "") + '">' + esc(b.v) + "</p>";
      if (b.t === "encadre") return '<div class="enc">' + b.lignes.map(function (l) { return "<p" + (l.f === "B" ? ' style="font-weight:700"' : "") + ">" + esc(l.t) + "</p>"; }).join("") + "</div>";
      if (b.t === "champ") return '<p class="lab-i">' + esc(b.label) + '</p><p class="val-i">' + (String(b.v || "").trim() ? esc(b.v).replace(/\n/g, "<br>") : "<i>(non renseigné)</i>") + "</p>";
      if (b.t === "table") return (b.titre ? '<p class="lab-i">' + esc(b.titre) + "</p>" : "") + "<table><thead><tr>" + b.cols.map(function (c) { return "<th>" + esc(c.label) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        b.rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return (i ? "<td>" : "<th>") + esc(c) + (i ? "</td>" : "</th>"); }).join("") + "</tr>"; }).join("") + "</tbody></table>";
      if (b.t === "image") return '<p class="lab-i">' + esc(b.titre) + '</p><img src="' + b.src + '" alt="">';
      if (b.t === "radar") return '<div class="radar-imp">' + radarSVG(lignesFCS()) + "</div>";
      return "";
    }).join("");
    document.body.classList.add("imprime");
    setTimeout(function () { window.print(); }, 60);
  }
  window.addEventListener("afterprint", function () { document.body.classList.remove("imprime"); });

  /* ======================= Divers ======================= */
  function alerte(t) {
    var a = $("#alerte"); a.textContent = t; a.hidden = false;
    clearTimeout(alerte.m); alerte.m = setTimeout(function () { a.hidden = true; }, 9000);
  }
  $("#frise").addEventListener("click", function (ev) { var b = ev.target.closest("[data-vue]"); if (b && !b.disabled) aller(b.getAttribute("data-vue")); });
  $("#b-raz").addEventListener("click", function () {
    var t = prompt("Tout effacer sur cet ordinateur (réponses, trésorerie, chrono) ? Cette action est définitive.\nPour confirmer, tapez EFFACER :");
    if (t && norm(t) === "EFFACER") { S = neuf(); try { localStorage.removeItem(CLE); } catch (e) {} memoire = null; rendre(); }
  });
  window.addEventListener("beforeunload", function () { sauver(true); });
  setInterval(function () { if (lance()) { majStatut(); majTempsPiece(); } }, 1000);
  if (!SEC.h[1]) alerte("Le fichier des codes n'a pas été chargé. Rechargez la page (touche F5).");
  rendre();
  if (S.vue && S.vue[0] === "p" && S.vue !== "accueil") { var n0 = +S.vue.slice(1); if (D.breaking[n0] && !(S.bn[n0] && S.bn[n0].vu)) montrerBreaking(n0); }
})();
