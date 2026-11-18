/* La une du 3 novembre 2026 — « La Gazette du Commerce », journal fictif créé pour l'exercice.
 * Maquette originale (n'imite aucun journal réel). Aucun logo de marque ni de média en en-tête.
 */
(function () {
  "use strict";
  var CC = window.CC, D = CC.data;
  CC.UNE_L = 960; CC.UNE_H = 640;

  CC.creerUne = function () {
    var u = D.une || {};
    var titre = String(u.titre || "").split("—").pop().trim();
    var e = CC.el("article", { class: "une", "aria-label": "La une du 3 novembre 2026, journal fictif" });
    e.innerHTML =
      '<header class="u-tete"><div class="u-nom">La Gazette<br>du Commerce</div>' +
      '<div class="u-date">Mardi 3 novembre 2026<br>Édition spéciale</div></header>' +
      '<div class="u-bandeau"><span>Distribution · Bazar discount</span><span>Journal fictif créé pour l’exercice</span></div>' +
      '<h2 class="u-titre">' + CC.esc(titre) + "</h2>" +
      '<div class="u-corps"><div><p class="u-texte">' + CC.esc(u.texte || "[À COMPLÉTER]") + "</p>" +
      '<p class="u-rappel">' + CC.esc(u.rappel || "") + "</p></div>" +
      '<div class="u-chiffres">' +
      '<div class="u-ch"><b>≈ 500</b><span>magasins en France</span></div>' +
      '<div class="u-ch"><b>6 000</b><span>salariés en France</span></div>' +
      '<div class="u-ch"><b>6 mois</b><span>de période d’observation</span></div>' +
      '<div class="u-ch"><b>8 janv. 2027</b><span>prochaine audience</span></div>' +
      "</div></div>" +
      '<footer class="u-pied"><span>Source : ' + CC.esc(u.source || "") + '</span><span>Journal fictif créé pour l’exercice. Les faits rapportés sont réels et sourcés.</span></footer>';
    return e;
  };

  /* Monte la une, mise à l'échelle de son conteneur. Retourne { cadre, une, echelle(), facteur } */
  CC.monterUne = function (conteneur) {
    var cadre = CC.el("div", { class: "une-cadre" });
    var ech = CC.el("div", { class: "une-echelle" });
    var une = CC.creerUne();
    ech.appendChild(une);
    cadre.appendChild(ech);
    conteneur.appendChild(cadre);
    var obj = { cadre: cadre, une: une, couche: ech, facteur: 1 };
    function maj() {
      var w = cadre.clientWidth || CC.UNE_L;
      obj.facteur = w / CC.UNE_L;
      ech.style.transform = "scale(" + obj.facteur + ")";
      cadre.style.height = CC.UNE_H * obj.facteur + "px";
    }
    obj.echelle = maj;
    if (window.ResizeObserver) new ResizeObserver(maj).observe(cadre); else window.addEventListener("resize", maj);
    maj();
    return obj;
  };
})();
