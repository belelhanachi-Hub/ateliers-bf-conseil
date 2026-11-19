/* Cold case GiFi, version autonome : petit générateur de PDF, sans dépendance.
 * Polices standard (Helvetica, gras, italique) en WinAnsi : accents français, €, « », œ.
 * Texte coupé à la largeur (mesures de la police Arial, aux métriques identiques à Helvetica),
 * tableaux, images JPEG (captures d'écran), radar, pied de page numéroté.
 */
(function () {
  "use strict";
  var W = 595.28, H = 841.89, ML = 48, MR = 48, MT = 54, MB = 58;
  var CW = W - ML - MR;

  /* ---------- Encodage WinAnsi ---------- */
  var SPEC = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89,
    0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95,
    0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
  var REMPL = { "−": "-", "√": "racine de ", "≤": "<=", "≥": ">=", "→": "->", "←": "<-", " ": " ", " ": " ", " ": " ", "≈": "~", "≠": "!=", "✓": "v", "✗": "x", "\t": "  " };
  function nettoyer(s) {
    s = String(s == null ? "" : s);
    if (s.normalize) s = s.normalize("NFC");
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), c = s.charCodeAt(i);
      if (REMPL[ch] != null) { out += REMPL[ch]; continue; }
      if (c >= 0xD800 && c <= 0xDBFF) { i++; continue; } // émojis : retirés
      if (c === 10 || (c >= 32 && c < 127) || (c >= 0xA0 && c <= 0xFF) || SPEC[c]) out += ch;
      else if (c === 13) continue;
      else out += "?";
    }
    return out;
  }
  function win(s) { // chaîne déjà nettoyée -> octets WinAnsi (sous forme de chaîne binaire)
    var o = "";
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); o += String.fromCharCode(SPEC[c] || c); }
    return o;
  }
  function chaine(s) { return "(" + win(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ")"; }

  /* ---------- Mesure du texte ---------- */
  var ctx = null, cache = {};
  try { ctx = document.createElement("canvas").getContext("2d"); } catch (e) { ctx = null; }
  var POL = { R: "100px Arial, Helvetica, sans-serif", B: "bold 100px Arial, Helvetica, sans-serif", I: "italic 100px Arial, Helvetica, sans-serif" };
  function largeur(txt, f, size) {
    var k = f + "|" + txt;
    var w = cache[k];
    if (w == null) {
      if (ctx) { ctx.font = POL[f]; w = ctx.measureText(txt).width / 100; }
      else w = txt.length * (f === "B" ? 0.58 : 0.53);
      cache[k] = w;
    }
    return w * size;
  }
  function couper(txt, f, size, maxW) {
    var lignes = [];
    nettoyer(txt).split("\n").forEach(function (par) {
      var mots = par.split(/ +/), cur = "";
      if (!par.trim()) { lignes.push(""); return; }
      mots.forEach(function (m) {
        if (!m) return;
        var essai = cur ? cur + " " + m : m;
        if (largeur(essai, f, size) <= maxW) { cur = essai; return; }
        if (cur) lignes.push(cur);
        // mot trop long : coupé caractère par caractère
        while (largeur(m, f, size) > maxW) {
          var j = m.length;
          while (j > 1 && largeur(m.slice(0, j), f, size) > maxW) j--;
          lignes.push(m.slice(0, j)); m = m.slice(j);
        }
        cur = m;
      });
      lignes.push(cur);
    });
    return lignes;
  }

  /* ---------- Document ---------- */
  function Doc(opts) {
    this.pages = []; this.images = []; this.opts = opts || {};
    this.nouvellePage();
  }
  var P = Doc.prototype;
  P.nouvellePage = function () { this.page = []; this.pages.push(this.page); this.y = MT; };
  P.reste = function () { return H - MB - this.y; };
  P.besoin = function (h) { if (this.y + h > H - MB) this.nouvellePage(); };
  P.op = function (s) { this.page.push(s); };
  function rgb(c) { return (c || [0, 0, 0]).map(function (v) { return (+v).toFixed(3); }).join(" "); }
  P.texteXY = function (x, y, txt, f, size, coul) {
    this.op("BT " + rgb(coul) + " rg /" + ({ R: "F1", B: "F2", I: "F3" })[f || "R"] + " " + size + " Tf " + x.toFixed(2) + " " + (H - y).toFixed(2) + " Td " + chaine(nettoyer(txt)) + " Tj ET");
  };
  P.rect = function (x, y, w, h, fill, stroke) {
    var s = "";
    if (fill) s += rgb(fill) + " rg ";
    if (stroke) s += rgb(stroke) + " RG 0.6 w ";
    s += x.toFixed(2) + " " + (H - y - h).toFixed(2) + " " + w.toFixed(2) + " " + h.toFixed(2) + " re " + (fill && stroke ? "B" : fill ? "f" : "S");
    this.op(s);
  };
  P.ligne = function (x1, y1, x2, y2, coul, ep, tirets) {
    this.op("q " + rgb(coul || [0.8, 0.8, 0.78]) + " RG " + (ep || 0.6) + " w " + (tirets ? "[" + tirets + "] 0 d " : "") + x1.toFixed(2) + " " + (H - y1).toFixed(2) + " m " + x2.toFixed(2) + " " + (H - y2).toFixed(2) + " l S Q");
  };

  // Paragraphe : options { size, f ("R","B","I"), coul, indent, apres, interligne }
  P.texte = function (txt, o) {
    o = o || {};
    var size = o.size || 10, f = o.f || "R", lh = size * (o.interligne || 1.35), x = ML + (o.indent || 0);
    var lignes = couper(txt, f, size, CW - (o.indent || 0));
    for (var i = 0; i < lignes.length; i++) {
      this.besoin(lh);
      this.texteXY(x, this.y + size, lignes[i], f, size, o.coul);
      this.y += lh;
    }
    this.y += o.apres != null ? o.apres : 4;
  };
  P.espace = function (h) { this.y += h; };
  P.filet = function (coul, ep) { this.besoin(8); this.ligne(ML, this.y, W - MR, this.y, coul || [0.08, 0.08, 0.08], ep || 1.2); this.y += 8; };
  P.h1 = function (t) { this.besoin(60); this.texte(t, { size: 22, f: "B", apres: 6, interligne: 1.15 }); };
  P.h2 = function (t, sous) {
    this.besoin(70);
    this.espace(6);
    this.texte(t, { size: 15, f: "B", apres: 2, interligne: 1.2 });
    if (sous) this.texte(sous, { size: 9, coul: [0.35, 0.35, 0.33], apres: 2 });
    this.filet();
  };
  P.h3 = function (t) { this.besoin(40); this.espace(4); this.texte(t, { size: 11.5, f: "B", apres: 3 }); };
  // Libellé + réponse
  P.champ = function (label, val, vide) {
    this.besoin(30);
    this.texte(label, { size: 8.5, f: "B", coul: [0.35, 0.35, 0.33], apres: 1 });
    var v = String(val == null ? "" : val).trim();
    this.texte(v || (vide || "(non renseigné)"), { size: 10, f: v ? "R" : "I", coul: v ? [0, 0, 0] : [0.55, 0.2, 0.2], apres: 7 });
  };
  // Encadré grisé avec lignes de texte
  P.encadre = function (lignes, o) {
    o = o || {};
    var size = o.size || 10, lh = size * 1.4, pad = 10, self = this;
    var toutes = [];
    lignes.forEach(function (l) {
      var f = l.f || "R";
      couper(l.t, f, l.size || size, CW - 2 * pad).forEach(function (x) { toutes.push({ t: x, f: f, size: l.size || size, coul: l.coul }); });
    });
    var h = toutes.length * lh + 2 * pad - 4;
    this.besoin(Math.min(h, H - MT - MB));
    this.rect(ML, this.y, CW, h, o.fond || [0.957, 0.949, 0.929], o.bord || [0.85, 0.83, 0.79]);
    var y = this.y + pad;
    toutes.forEach(function (l) { self.texteXY(ML + pad, y + l.size, l.t, l.f, l.size, l.coul); y += lh; });
    this.y += h + 8;
  };
  // Tableau : cols [{label, w}], rows [[texte...]]
  P.tableau = function (cols, rows, o) {
    o = o || {};
    var size = o.size || 8.6, lh = size * 1.3, pad = 4, self = this;
    var tot = cols.reduce(function (s, c) { return s + (c.w || 1); }, 0);
    var ws = cols.map(function (c) { return CW * (c.w || 1) / tot; });
    function entete() {
      var cel = cols.map(function (c, i) { return couper(c.label, "B", size, ws[i] - 2 * pad); });
      var hh = Math.max.apply(null, cel.map(function (l) { return l.length; })) * lh + 2 * pad;
      self.besoin(hh + 20);
      self.rect(ML, self.y, CW, hh, [0.914, 0.902, 0.875]);
      var x = ML;
      cel.forEach(function (ls, i) { ls.forEach(function (l, j) { self.texteXY(x + pad, self.y + pad + size + j * lh, l, "B", size); }); x += ws[i]; });
      self.y += hh;
    }
    entete();
    rows.forEach(function (r) {
      var cel = r.map(function (c, i) {
        var t = String(c == null ? "" : c).trim();
        return { l: couper(t || "-", i === 0 && o.premiereGras ? "B" : "R", size, ws[i] - 2 * pad), vide: !t, f: i === 0 && o.premiereGras ? "B" : "R" };
      });
      var hh = Math.max.apply(null, cel.map(function (c) { return c.l.length; })) * lh + 2 * pad;
      if (self.y + hh > H - MB) { self.nouvellePage(); entete(); }
      var x = ML;
      cel.forEach(function (c, i) {
        c.l.forEach(function (l, j) { self.texteXY(x + pad, self.y + pad + size + j * lh, l, c.f, size, c.vide ? [0.6, 0.6, 0.6] : null); });
        x += ws[i];
      });
      self.y += hh;
      self.ligne(ML, self.y, W - MR, self.y, [0.82, 0.82, 0.8], 0.5);
    });
    this.y += 10;
  };
  // Image JPEG (data URL)
  P.image = function (dataURL, wPx, hPx, maxH) {
    var b64 = String(dataURL).split(",")[1];
    if (!b64) return;
    var bin = atob(b64);
    var nom = "Im" + (this.images.length + 1);
    this.images.push({ nom: nom, data: bin, w: wPx, h: hPx });
    var w = CW, h = CW * hPx / wPx, lim = maxH || 330;
    if (h > lim) { h = lim; w = lim * wPx / hPx; }
    this.besoin(h + 10);
    this.op("q " + w.toFixed(2) + " 0 0 " + h.toFixed(2) + " " + ML.toFixed(2) + " " + (H - this.y - h).toFixed(2) + " cm /" + nom + " Do Q");
    this.rect(ML, this.y, w, h, null, [0.8, 0.8, 0.78]);
    this.y += h + 10;
  };
  // Radar : axes (libellés), séries [{nom, valeurs, coul, tirets}], max 5
  P.radar = function (axes, series) {
    var n = axes.length; if (n < 3) return;
    var R = 95, haut = 2 * R + 70;
    this.besoin(haut);
    var cx = ML + CW / 2 - 60, cy = this.y + R + 30, self = this;
    function pt(i, v) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; }
    for (var g = 1; g <= 5; g++) {
      for (var i = 0; i < n; i++) { var a = pt(i, g), b = pt((i + 1) % n, g); self.ligne(a[0], a[1], b[0], b[1], [0.85, 0.85, 0.83], 0.5); }
    }
    axes.forEach(function (lab, i) {
      var e = pt(i, 5); self.ligne(cx, cy, e[0], e[1], [0.8, 0.8, 0.78], 0.5);
      var t = pt(i, 5.9), txt = nettoyer(lab).slice(0, 34), w = largeur(txt, "R", 7.5);
      var x = t[0] - w / 2; if (t[0] > cx + 5) x = t[0] - 8; if (t[0] < cx - 5) x = t[0] - w + 8;
      self.texteXY(x, t[1] + 3, txt, "R", 7.5);
    });
    series.forEach(function (s) {
      var pts = s.valeurs.map(function (v, i) { return pt(i, +v || 0); });
      var d = pts.map(function (p, i) { return p[0].toFixed(2) + " " + (H - p[1]).toFixed(2) + (i ? " l" : " m"); }).join(" ") + " h";
      self.op("q " + rgb(s.coul) + " RG 1.6 w " + (s.tirets ? "[" + s.tirets + "] 0 d " : "") + d + " S Q");
    });
    var ly = this.y + 30;
    series.forEach(function (s) {
      var x = ML + CW - 120;
      self.ligne(x, ly, x + 26, ly, s.coul, 1.6, s.tirets);
      self.texteXY(x + 32, ly + 3, s.nom, "B", 9);
      ly += 16;
    });
    this.y += haut;
  };

  /* ---------- Assemblage ---------- */
  P.octets = function () {
    var self = this, pied = this.opts.pied || "", N = this.pages.length;
    this.pages.forEach(function (pg, i) {
      self.page = pg;
      self.ligne(ML, H - MB + 18, W - MR, H - MB + 18, [0.8, 0.8, 0.78], 0.5);
      self.texteXY(ML, H - MB + 32, pied, "R", 7.5, [0.4, 0.4, 0.38]);
      var num = "page " + (i + 1) + " / " + N;
      self.texteXY(W - MR - largeur(num, "R", 7.5), H - MB + 32, num, "R", 7.5, [0.4, 0.4, 0.38]);
    });
    var objs = []; // contenu de chaque objet (chaîne binaire), index = numéro - 1
    function ajouter(s) { objs.push(s); return objs.length; }
    var catalogue = ajouter(null), pages = ajouter(null);
    var f1 = ajouter("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    var f2 = ajouter("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    var f3 = ajouter("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>");
    var xo = "";
    this.images.forEach(function (im) {
      var n = ajouter("<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.data.length + " >>\nstream\n" + im.data + "\nendstream");
      xo += "/" + im.nom + " " + n + " 0 R ";
    });
    var res = "<< /Font << /F1 " + f1 + " 0 R /F2 " + f2 + " 0 R /F3 " + f3 + " 0 R >>" + (xo ? " /XObject << " + xo + ">>" : "") + " >>";
    var kids = [];
    this.pages.forEach(function (pg) {
      var flux = pg.join("\n");
      var c = ajouter("<< /Length " + flux.length + " >>\nstream\n" + flux + "\nendstream");
      kids.push(ajouter("<< /Type /Page /Parent " + pages + " 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources " + res + " /Contents " + c + " 0 R >>"));
    });
    objs[catalogue - 1] = "<< /Type /Catalog /Pages " + pages + " 0 R >>";
    objs[pages - 1] = "<< /Type /Pages /Kids [" + kids.map(function (k) { return k + " 0 R"; }).join(" ") + "] /Count " + kids.length + " >>";
    var titre = this.opts.titre ? chaine(nettoyer(this.opts.titre)) : "()";
    var info = ajouter("<< /Title " + titre + " /Producer (Cold case GiFi) >>");
    var out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", offs = [];
    objs.forEach(function (o, i) { offs.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
    var xref = out.length;
    out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n";
    offs.forEach(function (o) { out += ("0000000000" + o).slice(-10) + " 00000 n \n"; });
    out += "trailer\n<< /Size " + (objs.length + 1) + " /Root " + catalogue + " 0 R /Info " + info + " 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    var u = new Uint8Array(out.length);
    for (var i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255;
    return u;
  };
  P.blob = function () { return new Blob([this.octets()], { type: "application/pdf" }); };

  window.MiniPDF = Doc;
})();
