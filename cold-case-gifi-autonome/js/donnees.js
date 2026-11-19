/* Cold case GiFi, version autonome : contenu des pièces (repris du kit _kit-cold-case-gifi/contenu).
 * Les codes, indices et corrections ne sont pas ici : voir js/secret.js (haché et brouillé).
 * Types de champs : text, area, select, grid (lignes x colonnes), image (capture d'écran), radar (pièce 7).
 */
window.CCA = {
  prefixe: "ccga1:",
  duree_totale: 190, // 3 h 10
  emails: ["belel.hanachi@esara-lyon.fr", "olivier.muller@esara-lyon.fr"],

  bareme: {
    depart: 30000,
    quiz: 500,          // par bonne réponse au « Vrai ou faux ? »
    code: 4000,         // code trouvé
    erreur: -500,       // par code refusé
    indice: -1000,      // indice acheté
    passer: -3000,      // pièce passée sans le code
    livrable: 1000,     // toutes les réponses de la pièce remplies
    breaking: 500,      // réponse à une Breaking news
    rapport: 2000,      // rapport final complet
  },

  une: {
    date: "3 novembre 2026",
    titre: "GiFi placé en redressement judiciaire",
    texte: "Le tribunal de commerce de Toulouse ouvre une période d'observation de six mois. Prochaine audience : 8 janvier 2027. L'enseigne compte environ 500 magasins et 6 000 salariés en France.",
    rappel: "Un redressement judiciaire sert à poursuivre l'activité et à chercher une solution. Ce n'est pas une liquidation.",
  },

  lettre: "L'administrateur judiciaire de GiFi vous mandate pour une mission d'enquête. Une question lui est posée avant l'audience du 8 janvier 2027 : la chute de GiFi était-elle prévisible, et qu'aurait dû voir une étude de marché et une veille sérieuses ? Huit pièces à conviction vous attendent. Chacune s'ouvre avec la méthode d'une séance de cours. Chaque pièce cache un code. À la fin, vous remettez votre rapport à l'administrateur : chaque argument devra s'appuyer sur une pièce.",

  quiz: [
    "GiFi a été fondé dans les années 1980.",
    "GiFi a été placé en liquidation judiciaire le 3 novembre 2026.",
    "En 2023, GiFi réalisait plus de chiffre d'affaires en France qu'Action.",
    "Temu est arrivé en France en 2023.",
    "Depuis le 1er juillet 2026, les petits colis venant de hors de l'Union européenne sont taxés.",
  ],

  // Plan de la matinée, en minutes depuis le lancement (total 190 min)
  plan: [
    { id: "quiz", nom: "Échauffement", duree: 8 },
    { id: 1, duree: 20 }, { id: 2, duree: 18 }, { id: 3, duree: 22 }, { id: 4, duree: 18 },
    { id: "pause", nom: "Pause (avant : PDF provisoire et sauvegarde, page « Envoi »)", duree: 10 },
    { id: 5, duree: 15 }, { id: 6, duree: 22 }, { id: 7, duree: 15 }, { id: 8, duree: 22 },
    { id: "rapport", nom: "Rapport final et envoi du PDF", duree: 20 },
  ],

  breaking: {
    3: {
      n: 1, titre: "L'Europe taxe les petits colis",
      texte: "Depuis le 1er juillet 2026, un droit de douane de 3 € par catégorie d'article frappe les colis de 150 € ou moins importés dans l'Union européenne. La France suspend en même temps sa propre taxe de 2 €, en place depuis le 1er mars 2026.",
      source: "info.gouv.fr, 1er juillet 2026",
      question: "Pour GiFi, opportunité ou menace ? Et pourquoi arrive-t-elle peut-être trop tard ?",
    },
    6: {
      n: 2, titre: "Action continue de grandir",
      texte: "Sur les neuf premiers mois de 2026, le chiffre d'affaires d'Action progresse de 14 %, à 12,8 Md€, mais de 3,4 % seulement dans les magasins ouverts depuis plus d'un an. En France, les ventes à magasins comparables progressent, portées par le nombre de transactions, alors que la confiance des consommateurs faiblit.",
      source: "L'Express Franchise, d'après Action, novembre 2026",
      question: "Signal faible ou signal fort ? Que dit l'écart entre +14 % et +3,4 % ?",
    },
    8: {
      n: 3, titre: "Ce que révèle le tribunal",
      texte: "Selon la décision du tribunal de commerce de Toulouse, l'Ebitda de GiFi, attendu à +9 M€ pour 2025, est ressorti à −100 M€. Les produits saisonniers représentent environ la moitié du chiffre d'affaires du groupe.",
      source: "AFP, 3 novembre 2026",
      question: "Si la moitié du chiffre d'affaires est saisonnière, que coûte un réassort qui ne suit pas ? Quel FCS de la pièce 7 cela confirme-t-il ? Servez-vous de la réponse dans votre rapport final.",
    },
  },

  pieces: [
    /* ------------------------------------------------------------------ 1 */
    {
      id: 1, titre: "La décision", seance: 1, lien: "1.1 (question de départ), 1.2 (le marché), 1.4 (les 4 cercles)",
      objectif: "Retrouver la décision que GiFi aurait dû étudier en 2023, mesurer son marché et cartographier ses concurrents.",
      materiel: `
<h3>Fiche « Chiffres du marché »</h3>
<div class="tbl"><table class="cc"><thead><tr><th>Donnée</th><th>Valeur</th><th>Source</th></tr></thead><tbody>
<tr><td>Marché français du bazar discount</td><td>environ 10 Md€</td><td>Xerfi, cité par LSA (2024)</td></tr>
<tr><td>Chiffre d'affaires de GiFi, 2023</td><td>1,3 Md€</td><td>LSA (2024)</td></tr>
<tr><td>Chiffre d'affaires d'Action en France, 2023</td><td>4,45 Md€</td><td>LSA (2024)</td></tr>
</tbody></table></div>
<h3>Encadré « Contrôle d'identité » : deux sources à contrôler</h3>
<ul>
<li><b>Source A :</b> un site d'actualité people écrit que GiFi « réalisait 1 milliard de chiffre d'affaires et 65 millions de bénéfices nets en 2022 », en citant une enquête de Libération (février 2026).</li>
<li><b>Source B :</b> LSA, magazine professionnel de la distribution : GiFi compte 545 magasins en France et 1,3 Md€ de chiffre d'affaires en 2023.</li>
</ul>`,
      etapes: [
        { titre: "Étape 1 : la décision", consigne: "Nous sommes à la mi-2023 : Temu vient d'arriver en France, et GiFi déploie un nouveau logiciel de gestion. Écrivez la décision que la direction aurait dû trancher, sous forme de choix A ou B. Puis écrivez le problème d'étude : ce que l'étude devait chercher pour trancher.",
          champs: [
            { k: "p1_a", type: "text", label: "Option A" },
            { k: "p1_b", type: "text", label: "Option B" },
            { k: "p1_pb", type: "area", label: "Le problème d'étude, en une phrase" },
          ] },
        { titre: "Étape 2 : le marché", consigne: "À partir de la fiche « Chiffres du marché », calculez la part de marché de GiFi et celle d'Action France en 2023. Dites ce que ces chiffres valent : périmètre, année, source.",
          champs: [
            { k: "p1_pm_g", type: "text", label: "Part de marché de GiFi en 2023 (avec le calcul)" },
            { k: "p1_pm_a", type: "text", label: "Part de marché d'Action France en 2023 (avec le calcul)" },
            { k: "p1_lim", type: "area", label: "Ce que valent ces chiffres : leur limite (périmètre, année, source)" },
          ] },
        { titre: "Étape 3 : les 4 cercles", consigne: "Placez au moins 2 acteurs nommés dans chacun des 4 cercles de GiFi.",
          champs: [
            { k: "p1_c1", type: "text", label: "Marché principal" },
            { k: "p1_c2", type: "text", label: "Marché environnant" },
            { k: "p1_c3", type: "text", label: "Marché générique" },
            { k: "p1_c4", type: "text", label: "Marché support" },
          ] },
        { titre: "Étape 4 : le contrôle d'identité", consigne: "Faites passer les 4 questions du contrôle d'identité aux deux sources de l'encadré, puis donnez votre verdict.",
          champs: [
            { k: "p1_ctrl", type: "grid", label: "Contrôle d'identité", lignes: ["Source A", "Source B"],
              cols: [
                { k: "qui", label: "Qui parle ?" }, { k: "quand", label: "Quand ?" },
                { k: "pourquoi", label: "Pourquoi me le dit-il ?" }, { k: "autre", label: "Qui d'autre le dit ?" },
                { k: "verdict", label: "Verdict", type: "select", options: ["Fiable", "À vérifier : remonter à l'origine", "Non fiable"] },
              ] },
          ] },
      ],
      code: { label: "4 chiffres", aide: "La part de marché de GiFi suivie de celle d'Action France, en %, arrondies chacune à l'entier inférieur. Exemple : 12 % et 37 % donnent 1237." },
    },

    /* ------------------------------------------------------------------ 2 */
    {
      id: 2, titre: "Le sondage", seance: 2, lien: "1.2 (volet chiffré : l'enquête)",
      objectif: "Construire l'enquête que GiFi aurait dû mener auprès de ses clients, en évitant les biais, et savoir lire un résultat.",
      materiel: `
<h3>Le questionnaire piégé (écrit trop vite)</h3>
<ol>
<li>Dans quelle ville habitez-vous ?</li>
<li>N'êtes-vous pas d'accord pour dire que les prix de GiFi sont trop élevés ?</li>
<li>À quelle fréquence achetez-vous de la décoration ? (Chaque semaine / Chaque mois / Plusieurs fois par an / Moins souvent)</li>
<li>Trouvez-vous les magasins GiFi bien rangés et les vendeurs aimables ?</li>
<li>Achetez-vous souvent sur les plateformes ?</li>
<li>Sur une échelle de 1 à 5, quelle note donnez-vous à votre dernière visite chez GiFi ?</li>
<li>Où achetez-vous votre décoration ? (GiFi / Action)</li>
<li>Quel est votre âge ? (Moins de 25 ans / 25-39 ans / 40-59 ans / 60 ans et plus)</li>
</ol>
<h3>La formule du cours</h3>
<p class="formule">ME = 1,96 × √( p × (1 − p) / n )</p>`,
      etapes: [
        { titre: "Étape 1 : la chasse aux biais", consigne: "Pour chaque question du questionnaire piégé, dites si elle est correcte ou nommez son biais : question orientée, double question, terme vague, réponses incomplètes.",
          champs: [
            { k: "p2_biais", type: "grid", label: "La chasse aux biais", lignes: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"],
              cols: [
                { k: "v", label: "Verdict", type: "select", options: ["Correcte", "Question orientée", "Double question", "Terme vague", "Réponses incomplètes"] },
                { k: "why", label: "Pourquoi (facultatif)", opt: true },
              ] },
          ] },
        { titre: "Étape 2 : le bon questionnaire", consigne: "Écrivez 6 questions qui permettraient à GiFi de comprendre pourquoi ses clients achètent aussi chez Action ou sur Temu. Du général au personnel, une idée par question, au moins une échelle. Précisez la cible, le canal et la taille d'échantillon visée.",
          champs: [
            { k: "p2_q1", type: "text", label: "Question 1" }, { k: "p2_q2", type: "text", label: "Question 2" },
            { k: "p2_q3", type: "text", label: "Question 3" }, { k: "p2_q4", type: "text", label: "Question 4" },
            { k: "p2_q5", type: "text", label: "Question 5" }, { k: "p2_q6", type: "text", label: "Question 6" },
            { k: "p2_cible", type: "text", label: "La cible" }, { k: "p2_canal", type: "text", label: "Le canal" },
            { k: "p2_ech", type: "text", label: "La taille d'échantillon visée" },
          ] },
        { titre: "Étape 3 : la marge d'erreur", consigne: "Votre enquête est faite : sur 100 clients interrogés, 60 % déclarent avoir acheté de la décoration chez Action dans les 3 derniers mois. Calculez la marge d'erreur avec la formule du cours, puis écrivez la phrase de lecture du résultat, avec sa limite.",
          champs: [
            { k: "p2_calc", type: "area", label: "Votre calcul, étape par étape" },
            { k: "p2_lect", type: "area", label: "La phrase de lecture du résultat, avec sa limite" },
          ] },
      ],
      code: { label: "3 chiffres", aide: "La marge d'erreur, en points, sans la virgule. Exemple : 7,3 points donnent 073." },
    },

    /* ------------------------------------------------------------------ 3 */
    {
      id: 3, titre: "Les avis", seance: 3, lien: "1.2 (volet qualitatif : pourquoi ils achètent)",
      objectif: "Le duel GiFi contre Action : écouter ce que disent les clients des deux enseignes, par la netnographie, et vérifier une explication toute faite : « les clients partent à cause des prix ».",
      materiel: `
<h3>Ce qu'il vous faut</h3>
<ul>
<li>Google Maps, sur un ordinateur ou un téléphone. Si la page ne s'ouvre pas sur l'ordinateur de l'école, utilisez un téléphone.</li>
<li>Choisissez un magasin GiFi de la région (par exemple dans la Loire ou le Rhône), puis le magasin Action le plus proche.</li>
<li>Dans les avis, choisissez le tri « Plus récents » et ne gardez que les avis qui ont un commentaire.</li>
<li><b>Ne notez aucun nom de client.</b> N'inventez aucun avis : on ne travaille que sur des avis réels et publics.</li>
</ul>
<p><a href="https://www.google.com/maps/search/GiFi" target="_blank" rel="noopener">Ouvrir Google Maps (recherche « GiFi »)</a></p>`,
      etapes: [
        { titre: "Étape 1 : le duel", consigne: "Pour chacun des deux magasins, relevez les 6 avis les plus récents qui ont un commentaire : la date, la note et un extrait.",
          champs: [
            { k: "p3_mg", type: "text", label: "Le magasin GiFi choisi (ville)" },
            { k: "p3_ma", type: "text", label: "Le magasin Action le plus proche (ville)" },
            { k: "p3_avis", type: "grid", label: "Les 12 avis", lignes: ["GiFi 1", "GiFi 2", "GiFi 3", "GiFi 4", "GiFi 5", "GiFi 6", "Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
              cols: [
                { k: "date", label: "Date", w: 0.7 },
                { k: "note", label: "Note", type: "select", options: ["1", "2", "3", "4", "5"], w: 0.5 },
                { k: "ext", label: "Extrait (sans nom)", w: 2.2 },
                { k: "etiq", label: "Étiquette (ce dont le client parle)", w: 1.3 },
              ] },
          ] },
        { titre: "Étape 2 : le codage", consigne: "Donnez une étiquette à chacun des 12 avis (colonne de droite ci-dessus), regroupez les étiquettes en 3 thèmes, puis comptez, enseigne par enseigne.",
          champs: [
            { k: "p3_themes", type: "grid", label: "Les 3 thèmes", lignes: ["Thème 1", "Thème 2", "Thème 3"],
              cols: [
                { k: "t", label: "Le thème", w: 2 },
                { k: "g", label: "Nb d'avis GiFi (sur 6)", type: "select", options: ["0", "1", "2", "3", "4", "5", "6"] },
                { k: "a", label: "Nb d'avis Action (sur 6)", type: "select", options: ["0", "1", "2", "3", "4", "5", "6"] },
              ] },
            { k: "p3_vg", type: "text", label: "Un verbatim GiFi" },
            { k: "p3_va", type: "text", label: "Un verbatim Action" },
          ] },
        { titre: "Étape 3 : le test", consigne: "Les clients de GiFi se plaignent-ils d'abord des prix ? Et ceux d'Action, de quoi sont-ils contents ? Le thème qui sépare les deux enseignes, c'est lequel ?",
          champs: [{ k: "p3_test", type: "area", label: "Votre réponse au test « c'est le prix ? »" }] },
        { titre: "Étape 4 : la règle des 3", consigne: "Trouvez une autre source de nature différente (un chiffre, un article, une carte d'une autre pièce) qui confirme ou contredit ce thème.",
          champs: [{ k: "p3_src", type: "area", label: "L'autre source (qui le dit, quand) et ce qu'elle confirme ou contredit" }] },
      ],
      code: { label: "2 chiffres", aide: "Le code est la réponse à une question de cours de la séance 3 : combien de participants compte un focus group ? Écrivez les deux nombres de la fourchette du cours, sans espace. Exemple : « de 4 à 5 » donnerait 45." },
    },

    /* ------------------------------------------------------------------ 4 */
    {
      id: 4, titre: "Le client perdu", seance: 4, lien: "1.2 (le portrait client)",
      objectif: "Comprendre comment une cliente de GiFi passe chez un concurrent, à quel moment du parcours elle est perdue, et ce qui la fait basculer.",
      materiel: `
<h3>Les 6 cartes « parcours » (mélangées)</h3>
<p>Chaque carte porte une lettre au dos : cliquez sur « Retourner » pour la voir.</p>
<div class="cartes-p4" data-widget="cartes-p4"></div>
<p class="note">Le prix du vase (5 € chez GiFi, 2,50 € sur Temu) est un exemple cité par Économie Matin (novembre 2026). Les autres situations sont des hypothèses d'exercice, à vérifier par l'étude.</p>`,
      cartes: [
        { l: "L", t: "Dans le magasin qu'elle connaît, le rayon est à moitié vide et l'article vu en photo n'est plus en stock." },
        { l: "E", t: "Elle publie une photo de son salon, et revient le mois suivant voir les nouveautés du magasin voisin." },
        { l: "V", t: "Elle veut refaire la décoration de son salon avant de recevoir sa famille à Noël." },
        { l: "I", t: "Elle compare le même vase : 5 € dans une enseigne de bazar, 2,50 € sur une application." },
        { l: "L", t: "Chez le discounter voisin, les nouveautés changent chaque semaine et tout est en rayon." },
        { l: "E", t: "Elle tape « déco salon pas cher » et regarde des vidéos sur les réseaux sociaux." },
      ],
      etapes: [
        { titre: "Étape 1 : le parcours", consigne: "Rangez les 6 cartes dans l'ordre des 6 moments du parcours d'achat vu en cours. Pour chaque moment, donnez aussi le statut de l'information : observé, déclaré, documenté ou hypothèse.",
          champs: [
            { k: "p4_parc", type: "grid", label: "Le parcours en 6 moments", lignes: ["1. Déclencheur", "2. Recherche", "3. Comparaison", "4. Frein", "5. Déclic", "6. Après l'achat"],
              cols: [
                { k: "c", label: "La carte", type: "select", options: ["Carte 1 : le rayon à moitié vide", "Carte 2 : la photo du salon", "Carte 3 : refaire le salon avant Noël", "Carte 4 : le vase à 5 € et à 2,50 €", "Carte 5 : le discounter voisin", "Carte 6 : « déco salon pas cher »"], w: 2 },
                { k: "s", label: "Statut de l'information", type: "select", options: ["Observé", "Déclaré", "Documenté", "Hypothèse"] },
              ] },
          ] },
        { titre: "Étape 2 : le moment de bascule", consigne: "À quel moment GiFi perd-il la cliente ? Qu'est-ce qui, chez GiFi, a provoqué ce moment ? Est-ce externe ou interne ?",
          champs: [
            { k: "p4_mom", type: "select", label: "Le moment de bascule", options: ["Déclencheur", "Recherche", "Comparaison", "Frein", "Déclic", "Après l'achat"] },
            { k: "p4_cause", type: "area", label: "Sa cause chez GiFi" },
            { k: "p4_orig", type: "select", label: "Cette cause est…", options: ["Externe", "Interne"] },
          ] },
        { titre: "Étape 3 : la balance envies et peurs", consigne: "Remplissez la balance de cette cliente : 3 envies (motivations), 3 peurs (freins), et le levier qui aurait pu la retenir chez GiFi.",
          champs: [
            { k: "p4_e1", type: "text", label: "Envie 1" }, { k: "p4_e2", type: "text", label: "Envie 2" }, { k: "p4_e3", type: "text", label: "Envie 3" },
            { k: "p4_f1", type: "text", label: "Peur 1" }, { k: "p4_f2", type: "text", label: "Peur 2" }, { k: "p4_f3", type: "text", label: "Peur 3" },
            { k: "p4_lev", type: "area", label: "Le levier qui aurait pu la retenir chez GiFi" },
          ] },
        { titre: "Étape 4 : l'implication et l'information", consigne: "Placez l'achat de décoration à petit prix dans la matrice d'implication du cours et dites ce qui marche alors. Où cette cliente s'informe-t-elle en premier, et quelle preuve chercheriez-vous ?",
          champs: [
            { k: "p4_imp", type: "select", label: "Le niveau d'implication", options: ["Achat réfléchi", "Coup de cœur", "Habitude", "Envie de changer"] },
            { k: "p4_impw", type: "area", label: "Ce qui marche alors" },
            { k: "p4_info", type: "area", label: "Où elle s'informe en premier, et la preuve que vous chercheriez" },
          ] },
      ],
      code: { label: "6 lettres", aide: "Les lettres au dos des cartes, lues dans l'ordre du parcours (du déclencheur à l'après-achat)." },
    },

    /* ------------------------------------------------------------------ 5 */
    {
      id: 5, titre: "La veille absente", seance: 5, lien: "1.1 (démarche de veille, outils)",
      objectif: "Monter la veille que GiFi aurait dû avoir dès 2022 : une question, quelques bonnes sources, un outil vraiment réglé, et savoir quelle information on a le droit d'utiliser.",
      materiel: `
<h3>Les 6 informations</h3>
<div class="tbl"><table class="cc"><thead><tr><th>Carte</th><th>Information</th></tr></thead><tbody>
<tr><td>P5-1</td><td>Le catalogue professionnel remis aux visiteurs d'un salon de la décoration, avec les prix de gros d'un fournisseur.</td></tr>
<tr><td>P5-2</td><td>Un article de LSA qui analyse la stratégie logistique d'Action.</td></tr>
<tr><td>P5-3</td><td>Un ancien salarié d'un concurrent propose d'envoyer le fichier des prix d'achat de son ancien employeur.</td></tr>
<tr><td>P5-4</td><td>Les comptes annuels d'un concurrent, consultés sur Pappers.</td></tr>
<tr><td>P5-5</td><td>Ce que vous confie le commercial d'un fournisseur commun, croisé sur le stand d'un salon professionnel.</td></tr>
<tr><td>P5-6</td><td>Les avis Google publics d'un magasin Action de la région.</td></tr>
</tbody></table></div>
<p class="pied-carte">Document d'exercice · Cold case GiFi</p>
<p>Outils : <a href="https://www.google.fr/alerts" target="_blank" rel="noopener">Google Alertes</a> · <a href="https://trends.google.fr/trends/" target="_blank" rel="noopener">Google Trends</a></p>`,
      etapes: [
        { titre: "Étape 1 : le tri", consigne: "Pour chacune des 6 informations, décidez : blanche (publique), grise (accessible au bon endroit, comme un salon professionnel) ou noire (obtenue de façon illégale ou déloyale, donc interdite).",
          champs: [
            { k: "p5_tri", type: "grid", label: "Le tri des 6 informations", lignes: ["P5-1", "P5-2", "P5-3", "P5-4", "P5-5", "P5-6"],
              cols: [
                { k: "c", label: "Couleur", type: "select", options: ["Blanche", "Grise", "Noire"] },
                { k: "why", label: "Pourquoi (facultatif)", opt: true, w: 2 },
              ] },
          ] },
        { titre: "Étape 2 : la question de veille", consigne: "Écrivez la question de veille que la direction de GiFi aurait dû poser en 2022. Elle doit partir d'une décision.",
          champs: [{ k: "p5_q", type: "area", label: "La question de veille de 2022" }] },
        { titre: "Étape 3 : le plan express", consigne: "3 sources de nature différente (par exemple la presse professionnelle, une source publique, le terrain), et ce que chacune vous apprendrait.",
          champs: [
            { k: "p5_plan", type: "grid", label: "Le plan express", lignes: ["Source 1", "Source 2", "Source 3"],
              cols: [
                { k: "s", label: "La source", w: 1.3 },
                { k: "n", label: "Sa nature", type: "select", options: ["Presse professionnelle", "Source publique", "Terrain", "Autre"] },
                { k: "a", label: "Ce qu'elle m'apprendrait", w: 2 },
              ] },
          ] },
        { titre: "Étape 4 : l'outil réglé", consigne: "Créez pour de vrai une Google Alerte (mots-clés entre guillemets) ou une comparaison Google Trends (termes comparés, zone, période). Faites une capture d'écran et ajoutez-la ici : elle ira dans votre PDF.",
          champs: [
            { k: "p5_outil", type: "select", label: "L'outil réglé", options: ["Google Alertes", "Google Trends"] },
            { k: "p5_regl", type: "area", label: "Les réglages exacts (mots-clés, ou termes comparés, zone et période)" },
            { k: "p5_cap", type: "image", label: "La capture d'écran de l'outil réglé" },
          ] },
      ],
      code: { label: "3 chiffres", aide: "Le nombre d'informations blanches, puis grises, puis noires. Exemple : 4 blanches, 1 grise, 1 noire donnent 411." },
    },

    /* ------------------------------------------------------------------ 6 */
    {
      id: 6, titre: "Les signaux faibles", seance: 6, lien: "1.1 (preuve d'usage : la fiche de veille), 1.2 (tendances), 1.5 (opportunités et menaces)",
      objectif: "Retrouver les signaux que GiFi pouvait voir avant sa chute, les trier, les placer dans la matrice, et écrire la fiche de veille qui aurait dû arriver sur le bureau du dirigeant.",
      materiel: `
<h3>Les 4 cartes à coter</h3>
<div class="cartes-p6">
<div class="carte-doc"><b class="lettre">A</b><p>Depuis le 1er juillet 2026, un droit de douane forfaitaire de 3 € par catégorie d'article s'applique aux petits colis de 150 € ou moins importés dans l'Union européenne.</p><p class="src">Source : info.gouv.fr, site du gouvernement, 1er juillet 2026</p><p class="pied-carte">Document d'exercice · Cold case GiFi</p></div>
<div class="carte-doc"><b class="lettre">B</b><p>GiFi « réalisait 1 milliard de chiffre d'affaires et 65 millions de bénéfices nets en 2022 ».</p><p class="src">Source : un site d'actualité people, qui cite une enquête de Libération du 10 février 2026</p><p class="pied-carte">Document d'exercice · Cold case GiFi</p></div>
<div class="carte-doc"><b class="lettre">C</b><p>« 72 % des clients de GiFi sont passés sur Temu en 2024. »</p><p class="src">Source : post LinkedIn d'un consultant en commerce, non daté, sans méthode indiquée</p><p class="pied-carte">Document d'exercice · Cold case GiFi</p></div>
<div class="carte-doc"><b class="lettre">D</b><p>Au premier semestre 2024, les clients d'Action font en moyenne 6,4 transactions, contre 2 chez GiFi.</p><p class="src">Source : analyse de transactions bancaires de Joko, citée par LSA (2024)</p><p class="pied-carte">Document d'exercice · Cold case GiFi</p></div>
</div>
<p>Outil : <a href="https://trends.google.fr/trends/explore?date=today%205-y&geo=FR&q=gifi,action,temu" target="_blank" rel="noopener">Google Trends : « gifi », « action », « temu », France, 5 ans</a></p>`,
      etapes: [
        { titre: "Étape 1 : la cotation", consigne: "Cotez les 4 cartes en vert (source fiable et information confirmée), orange (l'un des deux) ou rouge (ni l'un ni l'autre), et justifiez.",
          champs: [
            { k: "p6_cot", type: "grid", label: "La cotation des 4 cartes", lignes: ["Carte A", "Carte B", "Carte C", "Carte D"],
              cols: [
                { k: "c", label: "Cotation", type: "select", options: ["Vert", "Orange", "Rouge"] },
                { k: "j", label: "Justification", w: 2.5 },
              ] },
          ] },
        { titre: "Étapes 2 et 3 : la courbe et le tri", consigne: "Sur Google Trends, comparez « gifi », « action » et « temu », France, 5 ans (lien ci-dessus). Puis regardez les requêtes associées à « gifi ». Relevez 3 signaux : ce que vous voyez, la date, et s'il s'agit de bruit, d'un signal faible ou d'un signal fort. Pour chacun : mode, tendance ou mégatendance ? Quelle mégatendance le porte ?",
          champs: [
            { k: "p6_sig", type: "grid", label: "Les 3 signaux", lignes: ["Signal 1", "Signal 2", "Signal 3"],
              cols: [
                { k: "vu", label: "Ce que je vois", w: 2 },
                { k: "d", label: "Date", w: 0.7 },
                { k: "t", label: "Bruit ou signal ?", type: "select", options: ["Bruit", "Signal faible", "Signal fort"] },
                { k: "n", label: "Mode, tendance ou mégatendance ?", type: "select", options: ["Mode", "Tendance", "Mégatendance"] },
                { k: "m", label: "La mégatendance qui le porte" },
              ] },
            { k: "p6_cap", type: "image", label: "La capture d'écran de Google Trends" },
          ] },
        { titre: "Étape 4 : la matrice impact × probabilité", consigne: "Placez vos 3 signaux dans la matrice. Pour chacun : agir maintenant, préparer un plan B, surveiller ou ignorer.",
          champs: [
            { k: "p6_mat", type: "grid", label: "La matrice", lignes: ["Signal 1", "Signal 2", "Signal 3"],
              cols: [
                { k: "i", label: "Impact", type: "select", options: ["Faible", "Fort"] },
                { k: "p", label: "Probabilité", type: "select", options: ["Faible", "Forte"] },
                { k: "a", label: "Décision", type: "select", options: ["Agir maintenant", "Préparer un plan B", "Surveiller", "Ignorer"] },
              ] },
          ] },
        { titre: "Étape 5 : la fiche de veille de juin 2023", consigne: "Écrivez, à la date de juin 2023, la fiche de veille que la direction de GiFi aurait dû recevoir.",
          champs: [
            { k: "p6_f1", type: "text", label: "Titre-conclusion" },
            { k: "p6_f2", type: "text", label: "Source" },
            { k: "p6_f3", type: "text", label: "Date" },
            { k: "p6_f4", type: "text", label: "Cotation" },
            { k: "p6_f5", type: "area", label: "Impact : « Et alors, pour nous ? »" },
            { k: "p6_f6", type: "area", label: "Recommandation que la direction peut accepter ou refuser" },
          ] },
      ],
      code: { label: "4 chiffres", aide: "La cotation des cartes A, B, C et D, dans l'ordre, avec vert = 1, orange = 2, rouge = 3. Exemple : vert, vert, orange, rouge donnent 1123." },
    },

    /* ------------------------------------------------------------------ 7 */
    {
      id: 7, titre: "Les facteurs clés de succès", seance: 7, lien: "1.6 (les facteurs clés de succès)",
      objectif: "Définir ce qu'il faut maîtriser pour gagner sur le marché du bazar discount, et mesurer l'écart entre GiFi, Action et Temu.",
      materiel: `
<h3>La grille pondérée d'exercice</h3>
<div class="tbl"><table class="cc"><thead><tr><th>FCS</th><th>Poids</th><th>Note de GiFi (exercice)</th><th>Pourquoi cette note</th></tr></thead><tbody>
<tr><td>Prix bas</td><td>30 %</td><td>3</td><td>Prix serrés historiquement, mais un vase à 5 € contre 2,50 € sur Temu</td></tr>
<tr><td>Renouvellement rapide de l'offre</td><td>25 %</td><td>3</td><td>Collections saisonnières, mais Action renouvelle plus vite</td></tr>
<tr><td>Disponibilité en rayon</td><td>20 %</td><td>2</td><td>Ruptures et réassort désorganisés après le logiciel de gestion de 2023</td></tr>
<tr><td>Maillage de magasins</td><td>15 %</td><td>4</td><td>Environ 500 magasins en France</td></tr>
<tr><td>Offre en ligne</td><td>10 %</td><td>2</td><td>Offre en ligne peu développée face aux plateformes</td></tr>
</tbody></table></div>
<p>Score pondéré = somme de (poids × note).</p>`,
      etapes: [
        { titre: "Étape 1 : le calcul", consigne: "Calculez le score pondéré de GiFi avec la grille d'exercice.",
          champs: [{ k: "p7_calc", type: "area", label: "Votre calcul du score pondéré de GiFi" }] },
        { titre: "Étapes 2 et 3 : vos FCS et la notation", consigne: "Les FCS de la grille sont une proposition. Gardez-les, modifiez-les ou remplacez-les (5 à 6 FCS), côté demande et côté offre. Pour chacun, donnez son origine. Pondérez (total 100 %) et notez GiFi, Action et Temu de 1 à 5, avec une justification. Le site calcule les scores et trace le radar.",
          champs: [
            { k: "p7_g", type: "grid", label: "Votre grille de FCS", lignes: ["FCS 1", "FCS 2", "FCS 3", "FCS 4", "FCS 5", "FCS 6 (facultatif)"], min: 5,
              cols: [
                { k: "f", label: "FCS", w: 1.5 },
                { k: "cote", label: "Côté", type: "select", options: ["Demande", "Offre"], w: 1.1 },
                { k: "o", label: "Origine", type: "select", options: ["Clients (pièce 3)", "Leaders (Action)", "Échecs (GiFi)", "Experts (presse professionnelle)"], w: 1.9 },
                { k: "p", label: "Poids (%)", type: "number", w: 0.6 },
                { k: "g", label: "GiFi", type: "select", options: ["1", "2", "3", "4", "5"], w: 0.65 },
                { k: "a", label: "Action", type: "select", options: ["1", "2", "3", "4", "5"], w: 0.75 },
                { k: "t", label: "Temu", type: "select", options: ["1", "2", "3", "4", "5"], w: 0.7 },
                { k: "j", label: "Justification des notes", w: 2 },
              ] },
            { k: "p7_radar", type: "radar", label: "Le radar", source: "p7_g", opt: true },
          ] },
        { titre: "Étape 4 : la conclusion", consigne: "Quel retard de GiFi est la priorité ?",
          champs: [{ k: "p7_conc", type: "area", label: "La phrase de conclusion : le score de GiFi, celui du meilleur concurrent, et le retard prioritaire" }] },
      ],
      code: { label: "3 chiffres", aide: "Le score pondéré de GiFi calculé avec la grille d'exercice (étape 1), sans la virgule. Exemple : 3,40 donne 340." },
    },

    /* ------------------------------------------------------------------ 8 */
    {
      id: 8, titre: "Le diagnostic", seance: 8, lien: "1.3 (PESTEL), 1.4 (5 forces de Porter), 1.5 (opportunités et menaces)",
      objectif: "Séparer ce que GiFi pouvait changer de ce qu'il subissait, poser le diagnostic externe, et préparer trois futurs pour l'audience du 8 janvier 2027.",
      materiel: `<h3>Les 15 cartes indices</h3><p>Une carte = un fait daté et sourcé.</p><div class="cartes-p8" data-widget="cartes-p8"></div>`,
      indices15: [
        ["Un concurrent débarque", "La plateforme chinoise Temu est lancée officiellement en France en avril 2023.", "LSA Data"],
        ["La bascule informatique", "En 2023, GiFi change de logiciel de gestion (ERP). Le pilotage des achats, la gestion des stocks et l'approvisionnement des magasins sont fortement perturbés, avec des effets durables sur le chiffre d'affaires.", "Décision du tribunal, citée par l'AFP (novembre 2026) ; Le Monde Informatique"],
        ["La part de Temu", "Entre 2023 et 2025, la part de marché de Temu dans le discount passe de 8 % à 19 % en valeur.", "LSA Data"],
        ["Un rachat qui pèse", "Le rachat de Tati fait partie des « déboires successifs » de GiFi.", "LSA (2024)"],
        ["Action accélère", "Le chiffre d'affaires d'Action en France passe de 2,92 Md€ en 2021 à 5,27 Md€ en 2024.", "IntoTheMinds, d'après les données d'Action"],
        ["Des magasins fatigués", "LSA décrit un « parc de magasins vieillissants » parmi les difficultés de GiFi.", "LSA (2024)"],
        ["Une météo défavorable", "En 2024, une météo défavorable pèse sur les ventes des produits printemps-été.", "Le Journal des entreprises (2025)"],
        ["En ligne, trop peu", "GiFi ne parvient pas à développer une offre en ligne solide face aux plateformes.", "Journal de l'économie (octobre 2026)"],
        ["Les clients d'Action", "Action accueille en moyenne 21,6 millions d'acheteurs par semaine en Europe en 2025, contre 18,7 millions l'année précédente.", "Paperjam, d'après Action (2026)"],
        ["Le résultat qui s'effondre", "L'excédent brut d'exploitation (Ebitda) de GiFi, attendu à +9 M€ pour 2025, ressort à −100 M€.", "Décision du tribunal, citée par l'AFP (novembre 2026)"],
        ["La taxe sur les petits colis", "Depuis le 1er juillet 2026, l'Union européenne applique un droit de douane de 3 € par catégorie d'article sur les colis importés de 150 € ou moins.", "info.gouv.fr (juillet 2026)"],
        ["Le réseau qui rétrécit", "En 2025 et 2026, GiFi cède 26 magasins à Grand Frais et ferme 67 points de vente déficitaires.", "Économie Matin (novembre 2026)"],
        ["Les colis chinois reculent", "Depuis la taxe européenne, les petits colis chinois chutent de 30 à 40 %.", "Euronews (août 2026)"],
        ["Un été difficile", "Selon le dirigeant de GiFi, le marché s'est nettement dégradé au cours de l'été 2026.", "Économie Matin (novembre 2026)"],
        ["La confiance baisse", "En France, les ventes d'Action à magasins comparables progressent, alors que la confiance des consommateurs faiblit.", "L'Express Franchise, d'après Action (novembre 2026)"],
      ],
      etapes: [
        { titre: "Étapes 1 et 2 : le tri, puis O, M, F, F", consigne: "Classez les 15 cartes. Un seul test : GiFi pouvait-il le changer lui-même ? Non : externe (opportunité ou menace). Oui : interne (force ou faiblesse).",
          champs: [
            { k: "p8_tri", type: "grid", label: "Le tri des 15 cartes", lignes: "indices15",
              cols: [{ k: "c", label: "Classement", type: "select", options: ["Externe : opportunité", "Externe : menace", "Interne : force", "Interne : faiblesse"] }] },
          ] },
        { titre: "Étape 3 : le PESTEL", consigne: "Un fait daté et sourcé par lettre, tiré des cartes ou de vos recherches. Pour chacun : opportunité ou menace pour GiFi, et ce que ça change.",
          champs: [
            { k: "p8_pestel", type: "grid", label: "Le PESTEL", lignes: ["Politique", "Économique", "Socioculturel", "Technologique", "Écologique", "Légal"],
              cols: [
                { k: "f", label: "Le fait, sa source et sa date", w: 2.2 },
                { k: "om", label: "O ou M ?", type: "select", options: ["Opportunité", "Menace"] },
                { k: "c", label: "Ce que ça change pour GiFi", w: 1.6 },
              ] },
          ] },
        { titre: "Étape 4 : les 5 forces", consigne: "Notez l'intensité de chaque force (faible, moyenne, forte) avec un argument.",
          champs: [
            { k: "p8_forces", type: "grid", label: "Les 5 forces de Porter", lignes: ["Rivalité entre concurrents", "Menace des nouveaux entrants", "Menace des substituts", "Pouvoir des clients", "Pouvoir des fournisseurs"],
              cols: [
                { k: "i", label: "Intensité", type: "select", options: ["Faible", "Moyenne", "Forte"] },
                { k: "a", label: "L'argument", w: 2.5 },
              ] },
          ] },
        { titre: "Étape 5 : les 3 futurs", consigne: "Écrivez trois scénarios pour GiFi d'ici l'audience du 8 janvier 2027 : le bon, le moyen, le mauvais. Pour chacun, le signal qui dira qu'il se réalise.",
          champs: [
            { k: "p8_futurs", type: "grid", label: "Les 3 futurs", lignes: ["Le bon", "Le moyen", "Le mauvais"],
              cols: [{ k: "s", label: "Le scénario", w: 2 }, { k: "sig", label: "Le signal qui dira qu'il se réalise", w: 1.5 }] },
          ] },
      ],
      code: { label: "4 chiffres", aide: "Le nombre de cartes internes sur 2 chiffres, puis le nombre de cartes externes sur 2 chiffres. Exemple : 3 internes et 12 externes donnent 0312." },
    },
  ],

  // Le livrable de chaque pièce (repris du kit), entièrement rendu dans le site : chaque élément renvoie aux cadres qui le contiennent
  livrables: {
    1: [
      { t: "La décision A/B et le problème d'étude, en une phrase chacun", k: ["p1_a", "p1_b", "p1_pb"] },
      { t: "Les deux parts de marché et leur limite", k: ["p1_pm_g", "p1_pm_a", "p1_lim"] },
      { t: "Les 4 cercles remplis", k: ["p1_c1", "p1_c2", "p1_c3", "p1_c4"] },
      { t: "La cotation des sources A et B", k: ["p1_ctrl"] },
    ],
    2: [
      { t: "La liste des questions biaisées et le biais de chacune", k: ["p2_biais"] },
      { t: "Le nouveau questionnaire de 6 questions, avec sa cible, son canal et son échantillon", k: ["p2_q1", "p2_q2", "p2_q3", "p2_q4", "p2_q5", "p2_q6", "p2_cible", "p2_canal", "p2_ech"] },
      { t: "Le calcul de la marge d'erreur et la phrase de lecture du résultat, avec sa limite", k: ["p2_calc", "p2_lect"] },
    ],
    3: [
      { t: "La grille des 12 avis, 6 GiFi et 6 Action", k: ["p3_mg", "p3_ma", "p3_avis"] },
      { t: "Les 3 thèmes, comptés pour chaque enseigne, avec un verbatim GiFi et un verbatim Action", k: ["p3_themes", "p3_vg", "p3_va"] },
      { t: "La réponse au test « c'est le prix ? », avec l'autre source qui la confirme ou la contredit", k: ["p3_test", "p3_src"] },
    ],
    4: [
      { t: "Le parcours en 6 moments, avec le statut de chaque information (observé, déclaré, documenté, hypothèse)", k: ["p4_parc"] },
      { t: "Le moment de bascule et sa cause", k: ["p4_mom", "p4_cause", "p4_orig"] },
      { t: "La balance envies et peurs, avec le levier", k: ["p4_e1", "p4_e2", "p4_e3", "p4_f1", "p4_f2", "p4_f3", "p4_lev"] },
      { t: "Le niveau d'implication et la source d'information à vérifier", k: ["p4_imp", "p4_impw", "p4_info"] },
    ],
    5: [
      { t: "Le tri des 6 informations", k: ["p5_tri"] },
      { t: "La question de veille", k: ["p5_q"] },
      { t: "Le plan express", k: ["p5_plan"] },
      { t: "L'outil réglé : ses réglages et sa capture d'écran", k: ["p5_outil", "p5_regl", "p5_cap"] },
    ],
    6: [
      { t: "La cotation des 4 cartes, justifiée", k: ["p6_cot"] },
      { t: "Les 3 signaux classés, avec la capture Google Trends", k: ["p6_sig", "p6_cap"] },
      { t: "La matrice remplie", k: ["p6_mat"] },
      { t: "La fiche de veille de juin 2023", k: ["p6_f1", "p6_f2", "p6_f3", "p6_f4", "p6_f5", "p6_f6"] },
    ],
    7: [
      { t: "Le calcul du score pondéré de GiFi (grille d'exercice)", k: ["p7_calc"] },
      { t: "Votre grille : 5 à 6 FCS, leur origine, leur poids, les notes justifiées des trois acteurs", k: ["p7_g"] },
      { t: "Le radar (tracé par le site à partir de votre grille)", k: ["p7_g"] },
      { t: "La phrase de conclusion : le score de GiFi, celui du meilleur concurrent, et le retard prioritaire", k: ["p7_conc"] },
    ],
    8: [
      { t: "Le tri des 15 cartes en externe ou interne, puis en O, M, F, F", k: ["p8_tri"] },
      { t: "Le PESTEL de 6 lignes", k: ["p8_pestel"] },
      { t: "Les 5 forces notées", k: ["p8_forces"] },
      { t: "Les 3 futurs et leurs signaux", k: ["p8_futurs"] },
    ],
  },
  livrable_commun: "La preuve à retenir pour le rapport final (fait, source, date) et ce que ça change pour GiFi",

  // Étape ajoutée automatiquement à la fin de chaque pièce (remplace la diapositive du grand oral)
  etape_rapport: function (n) {
    return { titre: "Pour le rapport final", consigne: "Avant de passer à la suite, notez ce que cette pièce apporte à votre enquête.",
      champs: [
        { k: "p" + n + "_preuve", type: "area", label: "La preuve à retenir : le fait, sa source et sa date" },
        { k: "p" + n + "_change", type: "text", label: "Ce que ça change pour GiFi" },
      ] };
  },

  rapport: {
    titre: "Le rapport à l'administrateur judiciaire",
    consigne: "C'est votre conclusion d'enquête, celle que vous auriez présentée au grand oral. La réponse d'abord, puis les preuves datées et sourcées. Chaque argument s'appuie sur une pièce. Ton respectueux : 6 000 salariés sont concernés, et un redressement judiciaire n'est pas une liquidation.",
    champs: [
      { k: "r_verdict", type: "select", label: "La chute de GiFi était-elle prévisible pour une étude de marché et une veille sérieuses ?", options: ["Oui, c'était prévisible", "En partie", "Non, pas à ce point"] },
      { k: "r_these", type: "area", label: "Votre conclusion, en 4 à 6 phrases (la réponse d'abord)", rows: 6 },
      { k: "r_preuves", type: "grid", label: "Vos 3 preuves les plus fortes", lignes: ["Preuve 1", "Preuve 2", "Preuve 3"],
        cols: [
          { k: "p", label: "Pièce", type: "select", options: ["Pièce 1", "Pièce 2", "Pièce 3", "Pièce 4", "Pièce 5", "Pièce 6", "Pièce 7", "Pièce 8", "Breaking news 1", "Breaking news 2", "Breaking news 3"] },
          { k: "f", label: "Le fait", w: 2.2 }, { k: "s", label: "La source", w: 1.2 }, { k: "d", label: "La date", w: 0.7 },
        ] },
      { k: "r_signal", type: "area", label: "Le signal qui était visible avant 2024, et ce que la veille aurait dû en faire" },
      { k: "r_limite", type: "area", label: "Une limite de votre raisonnement, et ce qui la compense" },
      { k: "r_reco", type: "area", label: "Votre recommandation à l'administrateur avant l'audience du 8 janvier 2027" },
      { k: "r_rep", type: "area", label: "Qui a fait quoi : la répartition du travail dans le cabinet (à parts égales)" },
    ],
  },
};
