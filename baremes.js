/* ============================================================================
   BARÈMES — SOURCE UNIQUE DE VÉRITÉ POUR TOUS LES OUTILS DU HUB
   ============================================================================

   C'EST LE SEUL FICHIER À MODIFIER LORS D'UNE MISE À JOUR DE BARÈME.
   Ne recopiez jamais un chiffre directement dans un outil : ajoutez-le ici.

   ---------------------------------------------------------------------------
   COMMENT METTRE À JOUR (5 minutes)
   ---------------------------------------------------------------------------
   1. Modifiez la valeur dans la section concernée ci-dessous.
   2. Mettez à jour "source" et "verifie" juste à côté (date + texte officiel).
   3. Changez MAJ.date et MAJ.version en haut.
   4. Republiez le site. Tous les outils affichent la nouvelle valeur,
      dans les calculs comme dans les textes.

   ---------------------------------------------------------------------------
   CALENDRIER DES RÉVISIONS À SURVEILLER
   ---------------------------------------------------------------------------
   1er janvier   PSS, barème de l'impôt, seuils micro-entreprise et TVA,
                 SMIC (revalorisation légale), barème kilométrique
   1er avril     Prime d'activité, RSA, prestations CAF
   1er mai       Grilles du prélèvement à la source (si loi de finances tardive)
   1er juillet   Taux AGIRC-ARRCO éventuels
   En continu    SMIC : revalorisation automatique dès que l'inflation
                 dépasse 2 % depuis la dernière hausse (arrivé en juin 2026)

   ---------------------------------------------------------------------------
   OÙ VÉRIFIER
   ---------------------------------------------------------------------------
   urssaf.fr · boss.gouv.fr · legifrance.gouv.fr · service-public.fr
   impots.gouv.fr · agirc-arrco.fr · insee.fr
   ============================================================================ */

(function (racine) {
  "use strict";

  var B = {};

  /* ---------------------------------------------------------------------- */
  /*  IDENTITÉ DU SITE                                                       */
  /*  À REMPLACER par votre domaine réel : il alimente les balises canonical, */
  /*  hreflang et Open Graph de toutes les pages.                             */
  /* ---------------------------------------------------------------------- */
  B.SITE = {
    nom: "Les Bons Chiffres",
    domaine: "https://lesbonschiffres.com",
    baseline: {
      fr: "Des calculateurs administratifs et fiscaux tenus à jour, sans compte à créer.",
      en: "Administrative and tax calculators kept up to date, with no account to create."
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  VERSION ET DATE DE VÉRIFICATION                                        */
  /* ---------------------------------------------------------------------- */
  /* Langues publiées. Chacune reçoit ses propres adresses, sans quoi
     les moteurs de recherche n'indexent que la version par défaut. */
  B.LANGUES = ["fr", "en"];

  B.MAJ = {
    version: "2026.5",
    date: "2026-08-02",
    dateTxt: { fr: "2 août 2026", en: "2 August 2026" }
  };

  /* ---------------------------------------------------------------------- */
  /*  SMIC                                                                   */
  /* ---------------------------------------------------------------------- */
  B.SMIC = {
    horaire: 12.31,
    mensuel: 1867.02,
    netMensuel: 1477.93,
    depuis: "2026-06-01",
    source: "URSSAF, arrêté du 22 mai 2026 — revalorisation automatique de 2,41 % au 1er juin 2026",
    verifie: "2026-07-27",
    // Valeur précédente, utile pour les contenus « ce qui a changé »
    precedent: { mensuel: 1823.03, depuis: "2026-01-01" },
    mayotte: { horaire: 9.56, mensuel: 1449.93 }
  };

  /* ---------------------------------------------------------------------- */
  /*  PLAFOND DE LA SÉCURITÉ SOCIALE                                         */
  /* ---------------------------------------------------------------------- */
  B.PSS = {
    mensuel: 4005,
    annuel: 48060,
    horaire: 30,
    source: "Arrêté du 22 décembre 2025, JO du 23 décembre 2025",
    verifie: "2026-07-27",
    precedent: { mensuel: 3925, annuel: 47100, annee: 2025 },
    mayotte: { mensuel: 3022, source: "service-public.gouv.fr, valeur au 1er janvier 2026" }
  };

  /* ---------------------------------------------------------------------- */
  /*  COTISATIONS SALARIALES (secteur privé, en %)                           */
  /* ---------------------------------------------------------------------- */
  B.COTIS = {
    vieillessePlafonnee: 6.90,
    vieillesseDeplafonnee: 0.40,
    arrcoT1: 3.15,
    arrcoT2: 8.64,
    cegT1: 0.86,
    cegT2: 1.08,
    cet: 0.14,
    apec: 0.024,
    csgDeductible: 6.80,
    csgNonDeductible: 2.40,
    crds: 0.50,
    abattementCSG: 0.9825,        // assiette = 98,25 % du brut, plafonnée à 4 PASS
    maladieAlsaceMoselle: 1.30,
    source: "BOSS, AGIRC-ARRCO. Alsace-Moselle : décision du conseil d'administration du 19 décembre 2025",
    verifie: "2026-07-27",
    // Fonction publique, modèle simplifié
    pensionCivile: 11.10,
    rafp: 5.00
  };

  /* ---------------------------------------------------------------------- */
  /*  DURÉE DU TRAVAIL ET HEURES SUPPLÉMENTAIRES                             */
  /* ---------------------------------------------------------------------- */
  B.TRAVAIL = {
    dureeLegaleHebdo: 35,
    heuresMensuelles: 151.67,
    semainesParMois: 52 / 12,
    majoration25: 1.25,           // de la 36e à la 43e heure
    majoration50: 1.50,           // à partir de la 44e
    reductionSalariale: 11.31,    // art. L241-17 CSS, plafond
    exonerationAnnuelle: 7500,    // art. 81 quater CGI
    // Seuils d'équivalence (art. D3312-45 du code des transports)
    equivalences: {
      transportLongueDistance: 43,
      transportCourteDistance: 39
    },
    source: "Art. L3121-27 code du travail, L241-17 CSS, 81 quater CGI, D3312-45 code des transports",
    verifie: "2026-07-27"
  };

  /* ---------------------------------------------------------------------- */
  /*  PRÉLÈVEMENT À LA SOURCE — GRILLES DE TAUX NEUTRES                      */
  /*  Format : [plafond de net imposable mensuel, taux en %]                 */
  /* ---------------------------------------------------------------------- */
  B.PAS = {
    depuis: "2026-05-01",
    source: "Art. 204 H du CGI, BOI-BAREME-000037. Loi de finances pour 2026 promulguée le 19 février 2026, revalorisation de 0,90 %",
    verifie: "2026-07-27",
    metropole: [[1635,0],[1698,.5],[1807,1.3],[1928,2.1],[2060,2.9],[2170,3.5],[2315,4.1],[2738,5.3],[3135,7.5],[3571,9.9],[4019,11.9],[4690,13.8],[5624,15.8],[7037,17.9],[8789,20],[12200,24],[16523,28],[25937,33],[55558,38],[Infinity,43]],
    antilles:  [[1875,0],[1989,.5],[2191,1.3],[2392,2.1],[2642,2.9],[2786,3.5],[2881,4.1],[3170,5.3],[3920,7.5],[5016,9.9],[5697,11.9],[6599,13.8],[7907,15.8],[8789,17.9],[9989,20],[13738,24],[18253,28],[27858,33],[60893,38],[Infinity,43]],
    guyane:    [[2008,0],[2170,.5],[2420,1.3],[2728,2.1],[2833,2.9],[2930,3.5],[3026,4.1],[3362,5.3],[4639,7.5],[6005,9.9],[6772,11.9],[7858,13.8],[8644,15.8],[9577,17.9],[11115,20],[14953,24],[19020,28],[30482,33],[64341,38],[Infinity,43]]
  };

  /* ---------------------------------------------------------------------- */
  /*  MICRO-ENTREPRISE ET TVA (outil 1)                                      */
  /* ---------------------------------------------------------------------- */
  B.MICRO = {
    plafondVente: 203100,
    plafondService: 83600,
    plafondMeuble: 15000,
    tvaBaseVente: 85000,
    tvaMajoreVente: 93500,
    tvaBaseService: 37500,
    tvaMajoreService: 41250,
    source: "Plafonds micro : article 50-0 du CGI, seuils 2026-2028, arrêté du 27 janvier 2026 (JO). " +
            "Seuils de TVA : article 293 B du CGI, rétabli dans sa rédaction antérieure par la loi n° 2025-1044 " +
            "du 3 novembre 2025, qui a abrogé le seuil unique de 25 000 €. L'article 25 du PLF 2026, qui prévoyait " +
            "un seuil de base à 37 500 € (25 000 € pour les travaux immobiliers), a été supprimé à l'unanimité par " +
            "l'Assemblée nationale le 20 novembre 2025 : les seuils restent donc inchangés en 2026. " +
            "Recoupé le 2 août 2026 sur entreprendre.service-public.gouv.fr (fiche F21746, vérifiée au 1er janvier 2026), " +
            "economie.gouv.fr et LégiFiscal. Voir B.VEILLE pour la bascule CIBS du 1er janvier 2027.",
    /* Règle de dépassement du seuil majoré : depuis le 1er janvier 2025, la franchise
       cesse « pour les opérations intervenant à compter de la date du dépassement »
       (art. 293 B du CGI) — et non plus au 1er jour du mois, comme c'était le cas
       avant 2025. De nombreuses sources en ligne, y compris de cabinets comptables,
       diffusent encore l'ancienne règle. Vérifié le 2 août 2026. */
    verifie: "2026-08-02"
  };

  /* ---------------------------------------------------------------------- */
  /*  VEILLE — CHANGEMENTS DATÉS DÉJÀ PUBLIÉS MAIS PAS ENCORE EN VIGUEUR     */
  /*                                                                         */
  /*  À relire à CHAQUE mise à jour de ce fichier.                           */
  /*  Une échéance dépassée doit être soit appliquée, soit re-vérifiée :     */
  /*  les reports sont fréquents et rarement relayés. Exemple vécu : la      */
  /*  bascule CIBS annoncée partout au 1er septembre 2026 a été repoussée    */
  /*  au 1er janvier 2027 par une ordonnance du 27 juillet 2026, six jours   */
  /*  avant notre propre vérification.                                       */
  /* ---------------------------------------------------------------------- */
  B.VEILLE = [
    {
      id: "cibs-bascule",
      date: "2027-01-01",
      titre: {
        fr: "La TVA quitte le CGI pour le code des impositions sur les biens et services",
        en: "VAT moves out of the CGI into the new goods and services tax code"
      },
      impact: {
        fr: "La mention de facture « TVA non applicable, art. 293 B du CGI » devient " +
            "« TVA non applicable, art. L. 223-3 du CIBS ». Recodification à droit constant : " +
            "ni les seuils, ni les taux, ni le régime ne changent. À répercuter dans B.MICRO.source " +
            "et dans le générateur de mentions légales.",
        en: "The invoice wording referring to article 293 B of the CGI is replaced by a reference " +
            "to article L. 223-3 of the CIBS. Pure recodification: thresholds, rates and the regime itself are unchanged."
      },
      source: "Ordonnance n° 2025-1247 du 17 décembre 2025 (JO du 20 décembre 2025), dont l'entrée " +
              "en vigueur a été reportée du 1er septembre 2026 au 1er janvier 2027 par l'ordonnance " +
              "n° 2026-671 du 27 juillet 2026 (JO du 28 juillet 2026). Report annoncé au compte rendu " +
              "du Conseil des ministres du 27 juillet 2026 (info.gouv.fr, elysee.fr) et confirmé par " +
              "Lexia Conseil et Cridon Nord-Est citant le rapport au Président de la République.",
      verifie: "2026-08-02"
    },
    {
      id: "cibs-fin-tolerance",
      date: "2028-06-30",
      titre: {
        fr: "Fin de la tolérance des anciennes références au CGI",
        en: "End of the transition period for old CGI references"
      },
      impact: {
        fr: "Jusqu'à cette date, les deux rédactions sont admises sur les factures et documents " +
            "produisant des effets fiscaux. Après, seule la référence au CIBS est correcte.",
        en: "Until this date both wordings are accepted on invoices and documents with tax effect. " +
            "After it, only the CIBS reference is correct."
      },
      source: "Délai initialement fixé au 31 décembre 2027 par l'ordonnance n° 2025-1247, " +
              "reporté au 30 juin 2028 par l'ordonnance n° 2026-671 du 27 juillet 2026.",
      verifie: "2026-08-02"
    }
  ];

  /* ---------------------------------------------------------------------- */
  /*  OUTILS DU HUB                                                          */
  /*  Ajoutez une entrée ici et elle apparaît automatiquement sur la page    */
  /*  d'accueil et dans le pied de page de tous les outils.                  */
  /*  etat : "live" (en ligne) ou "soon" (à venir)                           */
  /* ---------------------------------------------------------------------- */
  B.OUTILS = [
    {
      id: "micro-entreprise",
      etat: "live",
      url: "/simulateur-seuils-micro-entreprise",
      urlEn: "/en/france-micro-entreprise-vat-thresholds",
      cat: { fr: "Indépendants", en: "Self-employed" },
      titre: { fr: "Seuils micro-entreprise et TVA",
               en: "Micro-entreprise and VAT thresholds" },
      desc: { fr: "Vérifiez si vous restez sous le plafond micro-entreprise et sous le seuil de franchise en base de TVA.",
              en: "Check whether you stay under the micro-entreprise cap and the VAT registration threshold." }
    },
    {
      id: "salaire",
      etat: "live",
      url: "/calculateur-salaire-brut-net",
      urlEn: "/en/france-salary-calculator",
      cat: { fr: "Salariés", en: "Employees" },
      titre: { fr: "Salaire brut en net", en: "Gross to net salary" },
      desc: { fr: "Convertissez brut en net et net en brut, avec le détail de chaque cotisation, les heures supplémentaires et l'outre-mer.",
              en: "Convert gross to net and back, with every contribution itemised, overtime and overseas France." }
    },
    {
      id: "mentions-legales",
      etat: "soon",
      url: "/generateur-mentions-legales",
      urlEn: "/en/french-legal-notice-generator",
      cat: { fr: "Entreprises", en: "Businesses" },
      titre: { fr: "Mentions légales et CGV", en: "Legal notices and terms" },
      desc: { fr: "Générez les pages obligatoires de votre site, conformes à la LCEN et au RGPD.",
              en: "Generate the pages your website is legally required to publish." }
    },
    {
      id: "rupture-conventionnelle",
      etat: "soon",
      url: "/simulateur-rupture-conventionnelle",
      urlEn: "/en/rupture-conventionnelle-calculator",
      cat: { fr: "Salariés", en: "Employees" },
      titre: { fr: "Indemnité de rupture conventionnelle", en: "Rupture conventionnelle severance" },
      desc: { fr: "Calculez le minimum légal auquel vous avez droit selon votre ancienneté et votre salaire de référence.",
              en: "Work out the statutory minimum you are entitled to, based on your length of service." }
    }
  ];

  /* ======================================================================= */
  /*  OUTILLAGE — NE PAS MODIFIER EN DESSOUS DE CETTE LIGNE                  */
  /* ======================================================================= */

  /* Formatage monétaire et numérique selon la langue */
  B.fmt = function (v, lang, dec) {
    return new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
      style: "currency", currency: "EUR",
      minimumFractionDigits: dec === undefined ? 0 : dec,
      maximumFractionDigits: dec === undefined ? 0 : dec
    }).format(v);
  };
  B.pct = function (v, lang) {
    return v.toLocaleString(lang === "en" ? "en-GB" : "fr-FR",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";
  };

  /* Formate une date ISO ("2026-08-02") en toutes lettres selon la langue. */
  B.dateTxt = function (iso, lang) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString(
      lang === "en" ? "en-GB" : "fr-FR",
      { day: "numeric", month: "long", year: "numeric" });
  };

  /* Renvoie la PLUS ANCIENNE date de vérification parmi les sections citées.
     C'est volontairement la plus pessimiste : un outil ne peut pas se dire
     « à jour au 2 août » si l'un des barèmes qu'il utilise n'a pas été
     recontrôlé depuis le 27 juillet. Annoncer une date de vérification qu'on
     n'a pas réellement tenue est précisément ce qui ruine la confiance. */
  B.verifieMin = function (sections) {
    var d = sections
      .map(function (c) { return B[c] && B[c].verifie; })
      .filter(Boolean)
      .sort();
    return d[0] || B.MAJ.date;
  };

  /* Jetons réutilisables dans les textes des outils.
     Écrivez {smicMensuel} dans une phrase plutôt que « 1 867,02 € » :
     la valeur suivra automatiquement les mises à jour de ce fichier. */
  B.jetons = function (lang) {
    var l = lang === "en" ? "en" : "fr";
    return {
      smicHoraire:    B.fmt(B.SMIC.horaire, l, 2),
      smicMensuel:    B.fmt(B.SMIC.mensuel, l, 2),
      smicNet:        B.fmt(B.SMIC.netMensuel, l, 2),
      smicPrecedent:  B.fmt(B.SMIC.precedent.mensuel, l, 2),
      smicMayotte:    B.fmt(B.SMIC.mayotte.mensuel, l, 2),
      pssMensuel:     B.fmt(B.PSS.mensuel, l),
      pssAnnuel:      B.fmt(B.PSS.annuel, l),
      pssPrecedent:   B.fmt(B.PSS.precedent.mensuel, l),
      pssMayotte:     B.fmt(B.PSS.mayotte.mensuel, l),
      seuilPasMetro:  B.fmt(B.PAS.metropole[0][0], l),
      seuilPasAnt:    B.fmt(B.PAS.antilles[0][0], l),
      seuilPasGuy:    B.fmt(B.PAS.guyane[0][0], l),
      csgCrds:        B.pct(B.COTIS.csgDeductible + B.COTIS.csgNonDeductible + B.COTIS.crds, l),
      abattementCSG:  B.pct(B.COTIS.abattementCSG * 100, l),
      arrcoT1:        B.pct(B.COTIS.arrcoT1, l),
      arrcoT2:        B.pct(B.COTIS.arrcoT2, l),
      reductionHS:    B.pct(B.TRAVAIL.reductionSalariale, l),
      exoHS:          B.fmt(B.TRAVAIL.exonerationAnnuelle, l),
      microPlafondVente:   B.fmt(B.MICRO.plafondVente, l),
      microPlafondService: B.fmt(B.MICRO.plafondService, l),
      microPlafondMeuble:  B.fmt(B.MICRO.plafondMeuble, l),
      microTvaBaseVente:   B.fmt(B.MICRO.tvaBaseVente, l),
      microTvaMajoreVente: B.fmt(B.MICRO.tvaMajoreVente, l),
      microTvaBaseService: B.fmt(B.MICRO.tvaBaseService, l),
      microTvaMajoreService: B.fmt(B.MICRO.tvaMajoreService, l),
      dateMaj:        B.MAJ.dateTxt[l],
      /* Dates de vérification propres à chaque outil. Utilisez celles-ci dans
         les mentions « à jour au … » plutôt que {dateMaj}, qui ne reflète que
         la dernière modification du fichier, pas le recontrôle des barèmes. */
      dateMicro:      B.dateTxt(B.verifieMin(["MICRO"]), l),
      dateSalaire:    B.dateTxt(B.verifieMin(["SMIC", "PSS", "COTIS", "TRAVAIL", "PAS"]), l)
    };
  };

  /* Remplace les jetons {xxx} d'une chaîne par leur valeur courante */
  B.remplace = function (texte, lang) {
    if (typeof texte !== "string") return texte;
    var j = B.jetons(lang);
    return texte.replace(/\{(\w+)\}/g, function (tout, cle) {
      return (j[cle] !== undefined) ? j[cle] : tout;
    });
  };

  /* Contrôle de cohérence, visible dans la console du navigateur.
     Signale toute incohérence introduite par erreur lors d'une mise à jour. */
  B.verifie = function () {
    var e = [];
    if (Math.abs(B.PSS.annuel - B.PSS.mensuel * 12) > 1)
      e.push("PSS : l'annuel ne correspond pas au mensuel x 12");
    if (Math.abs(B.SMIC.mensuel - B.SMIC.horaire * B.TRAVAIL.heuresMensuelles) > 1)
      e.push("SMIC : le mensuel ne correspond pas à l'horaire x 151,67");
    var somme = B.COTIS.vieillessePlafonnee + B.COTIS.vieillesseDeplafonnee
              + B.COTIS.arrcoT1 + B.COTIS.cegT1;
    if (Math.abs(somme - B.TRAVAIL.reductionSalariale) > 0.01)
      e.push("Heures sup : le plafond de réduction (" + B.TRAVAIL.reductionSalariale
           + " %) devrait égaler la somme des cotisations vieillesse (" + somme.toFixed(2) + " %)");
    ["metropole", "antilles", "guyane"].forEach(function (g) {
      var t = B.PAS[g];
      for (var i = 1; i < t.length; i++) {
        if (t[i][0] <= t[i - 1][0]) e.push("Grille PAS " + g + " : seuils non croissants en position " + i);
        if (t[i][1] < t[i - 1][1]) e.push("Grille PAS " + g + " : taux non croissants en position " + i);
      }
    });
    if (e.length) console.warn("[baremes.js] " + e.length + " incohérence(s) :\n- " + e.join("\n- "));
    else console.info("[baremes.js] version " + B.MAJ.version + " — contrôles de cohérence passés");
    return e;
  };

  racine.BAREMES = B;
  if (typeof module !== "undefined" && module.exports) module.exports = B;
  if (typeof document !== "undefined") B.verifie();

})(typeof window !== "undefined" ? window : this);
