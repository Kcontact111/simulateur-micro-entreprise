#!/usr/bin/env node
/* ============================================================================
   BUILD — génération du site
   ============================================================================

   Ce script s'exécute automatiquement à chaque publication sur Vercel.
   Vous n'avez normalement jamais besoin de le lancer à la main, mais vous
   pouvez le faire pour vérifier avant de publier :

       node build.js

   Ce qu'il fait :
     1. Contrôle la cohérence des barèmes. Si une incohérence est détectée,
        LE DÉPLOIEMENT ÉCHOUE. C'est volontaire : mieux vaut un site inchangé
        qu'un site qui affiche un mauvais chiffre.
     2. Injecte le domaine réel (lu dans baremes.js) partout où il est attendu,
        à la place du jeton {{DOMAINE}} : canonical, hreflang, Open Graph.
     3. Génère sitemap.xml et robots.txt à partir de la liste des outils.
     4. Copie le tout dans public/, qui est ce que Vercel met en ligne.

   Pour ajouter un outil : déposez son fichier .html à la racine, puis
   ajoutez-le à B.OUTILS dans baremes.js. Le reste est automatique.
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const RACINE = __dirname;
const SORTIE = path.join(RACINE, 'public');
const B = require('./baremes.js');

let erreurs = 0;
const echec = (m) => { console.error('  ERREUR  ' + m); erreurs++; };
const ok    = (m) => console.log('  ok      ' + m);
const info  = (m) => console.log('          ' + m);

console.log('\n=== Génération du site — barèmes version ' + B.MAJ.version + ' ===\n');

/* ---------------------------------------------------------------------------
   1. Contrôle des barèmes
   --------------------------------------------------------------------------- */
console.log('1. Contrôle des barèmes');
const incoherences = B.verifie();
if (incoherences.length) {
  incoherences.forEach(echec);
} else {
  ok('cohérence interne vérifiée');
}

/* Le domaine doit avoir été renseigné */
if (!B.SITE.domaine || B.SITE.domaine.includes('example.com')) {
  echec('le domaine n\'a pas été renseigné dans baremes.js (B.SITE.domaine)');
} else if (!/^https:\/\//.test(B.SITE.domaine)) {
  echec('le domaine doit commencer par https:// (valeur actuelle : ' + B.SITE.domaine + ')');
} else {
  ok('domaine : ' + B.SITE.domaine);
}

/* Fraîcheur des barèmes : simple avertissement, pas un blocage */
const jours = Math.floor((Date.now() - new Date(B.MAJ.date)) / 86400000);
if (jours > 120) info('AVERTISSEMENT : les barèmes n\'ont pas été revérifiés depuis ' + jours + ' jours');
else ok('barèmes vérifiés il y a ' + jours + ' jour(s)');

if (erreurs) {
  console.error('\n=== GÉNÉRATION INTERROMPUE : ' + erreurs + ' erreur(s) ===');
  console.error('Le site en ligne reste inchangé. Corrigez baremes.js puis republiez.\n');
  process.exit(1);
}

/* ---------------------------------------------------------------------------
   2. Copie et substitution du domaine
   --------------------------------------------------------------------------- */
console.log('\n2. Assemblage des pages');
fs.rmSync(SORTIE, { recursive: true, force: true });
fs.mkdirSync(SORTIE, { recursive: true });

const DOMAINE = B.SITE.domaine.replace(/\/$/, '');
const IGNORE = new Set(['public', 'node_modules', '.git', '.vercel', 'archives']);

/* Les sauvegardes de version ne doivent jamais être publiées :
   Google les indexerait comme du contenu dupliqué de la page réelle. */
const EST_SAUVEGARDE = (nom) => /_v\d+[_.]/i.test(nom) || /\.(bak|old|orig)$/i.test(nom);

let pages = 0, jetonsRemplaces = 0;

function parcours(dep, rel = '') {
  for (const nom of fs.readdirSync(dep)) {
    if (IGNORE.has(nom) || nom.startsWith('.') || EST_SAUVEGARDE(nom)) continue;
    if (nom.toLowerCase().endsWith('.md')) continue;   // documentation interne, non publiée
    const src = path.join(dep, nom);
    const dst = path.join(SORTIE, rel, nom);
    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      parcours(src, path.join(rel, nom));
    } else if (/\.(html|js|json|xml|txt|svg|css|webmanifest)$/i.test(nom)) {
      if (nom === 'build.js' || nom === 'vercel.json') continue;
      let c = fs.readFileSync(src, 'utf8');
      const avant = c;
      c = c.replace(/\{\{DOMAINE\}\}/g, DOMAINE)
           .replace(/https:\/\/example\.com/g, DOMAINE);
      if (c !== avant) jetonsRemplaces++;
      fs.writeFileSync(dst, c);
      if (/\.html$/i.test(nom)) pages++;
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}
parcours(RACINE);
ok(pages + ' page(s) HTML assemblée(s)');
ok(jetonsRemplaces + ' fichier(s) avec domaine injecté');

/* ---------------------------------------------------------------------------
   3. Génération des versions anglaises
   ---------------------------------------------------------------------------
   Chaque outil existe en deux langues, mais un moteur de recherche n'indexe
   qu'une langue par adresse. On produit donc une page distincte par langue,
   avec ses propres balises title, description, canonical et hreflang.

   Au passage, les textes sont écrits directement dans le HTML au lieu d'être
   injectés par JavaScript à l'ouverture : plus fiable pour le référencement.
   --------------------------------------------------------------------------- */
console.log('\n3. Versions par langue');

/* Récupère le dictionnaire de traduction d'une page.
   Le bloc ne contient que des affectations de texte, aucun accès au navigateur :
   on peut donc l'évaluer sans risque pour en extraire les deux langues. */
function dictionnaire(html) {
  const debut = html.indexOf('var D={fr:{},en:{}}');
  if (debut < 0) return null;
  const marqueurs = ['/* ============ État', '/* ---------- État', "var lang='fr'"];
  let fin = -1;
  for (const m of marqueurs) {
    const i = html.indexOf(m, debut);
    if (i > 0 && (fin < 0 || i < fin)) fin = i;
  }
  if (fin < 0) return null;
  try {
    return new Function(html.slice(debut, fin) + '\n return D;')();
  } catch (e) {
    echec('dictionnaire illisible : ' + e.message);
    return null;
  }
}

const nettoie = (s) => String(s)
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/* Données structurées de FAQ, construites depuis le dictionnaire.
   Elles restent ainsi toujours synchronisées avec les questions affichées. */
function jsonLdFaq(dico, lang) {
  if (!dico || !Array.isArray(dico.faq) || !dico.faq.length) return null;
  /* Deux formats coexistent selon l'outil : [question, réponse] ou {q, a}.
     On accepte les deux plutôt que d'imposer une réécriture. */
  const paire = (item) => Array.isArray(item) ? item : [item.q, item.a];
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang === 'en' ? 'en-GB' : 'fr-FR',
    mainEntity: dico.faq.map((item) => {
      const [q, r] = paire(item);
      return {
        '@type': 'Question',
        name: nettoie(q),
        acceptedAnswer: { '@type': 'Answer', text: nettoie(r) }
      };
    })
  }, null, 2);
}

/* Écrit les textes du dictionnaire dans les balises data-i / data-ihtml */
function prerend(html, dico, lang) {
  let n = 0;
  const val = (cle) => {
    const v = dico[cle];
    if (v === undefined || typeof v === 'function') return null;
    return B.remplace(String(v), lang);
  };
  /* [\s\S]*? plutôt que \s* : on écrase le contenu existant (souvent le texte
     français laissé en secours dans le fichier source), pas seulement les
     balises vides. Ça permet aussi de garder un fichier source lisible et
     fonctionnel hors build, tout en étant correctement réécrit à la publication. */
  html = html.replace(/(<([a-z0-9]+)([^>]*\sdata-i="([\w]+)"[^>]*)>)[\s\S]*?(<\/\2>)/gi,
    (tout, ouv, bal, attrs, cle, fer) => {
      const v = val(cle); if (v === null) return tout;
      n++; return ouv + nettoie(v).replace(/&/g, '&amp;').replace(/</g, '&lt;') + fer;
    });
  html = html.replace(/(<([a-z0-9]+)([^>]*\sdata-ihtml="([\w]+)"[^>]*)>)[\s\S]*?(<\/\2>)/gi,
    (tout, ouv, bal, attrs, cle, fer) => {
      const v = val(cle); if (v === null) return tout;
      n++; return ouv + v + fer;
    });
  return { html, n };
}

function versionLangue(html, dico, lang, urlFr, urlEn) {
  const url = lang === 'en' ? urlEn : urlFr;
  const d = dico[lang];

  html = html.replace(/<html lang="[^"]*"/i, '<html lang="' + lang + '"');

  if (d.title)
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + nettoie(B.remplace(d.title, lang)) + '</title>');
  if (d.metaDesc)
    html = html.replace(/<meta name="description" content="[^"]*">/i,
      '<meta name="description" content="' + nettoie(B.remplace(d.metaDesc, lang)).replace(/"/g, '&quot;') + '">');

  /* Adresse canonique et équivalences de langue */
  html = html.replace(/<link rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + DOMAINE + url + '">');
  html = html.replace(/<link rel="alternate" hreflang="fr"[^>]*>/i,
    '<link rel="alternate" hreflang="fr" href="' + DOMAINE + urlFr + '">');
  html = html.replace(/<link rel="alternate" hreflang="en"[^>]*>/i,
    '<link rel="alternate" hreflang="en" href="' + DOMAINE + urlEn + '">');
  html = html.replace(/<link rel="alternate" hreflang="x-default"[^>]*>/i,
    '<link rel="alternate" hreflang="x-default" href="' + DOMAINE + urlFr + '">');

  html = html.replace(/<meta property="og:locale" content="[^"]*">/i,
    '<meta property="og:locale" content="' + (lang === 'en' ? 'en_GB' : 'fr_FR') + '">');
  if (!/og:url/.test(html))
    html = html.replace(/<meta property="og:type"/i,
      '<meta property="og:url" content="' + DOMAINE + url + '">\n<meta property="og:type"');
  else
    html = html.replace(/<meta property="og:url" content="[^"]*">/i,
      '<meta property="og:url" content="' + DOMAINE + url + '">');

  /* Données structurées reconstruites depuis les questions de cette langue */
  const ld = jsonLdFaq(d, lang);
  if (ld) html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    '<script type="application/ld+json">\n' + ld + '\n</script>');

  /* Langue par défaut et adresse de la version jumelle */
  const inject = '<script>window.__LANG__="' + lang + '";window.__ALT__='
    + JSON.stringify({ fr: urlFr, en: urlEn }) + ';</script>\n';
  html = html.replace(/<\/head>/i, inject + '</head>');

  const pr = prerend(html, d, lang);
  return { html: pr.html, remplis: pr.n };
}

let versions = 0;
for (const o of B.OUTILS.filter(x => x.etat === 'live')) {
  const fichier = path.join(SORTIE, o.url.replace(/^\//, '') + '.html');
  if (!fs.existsSync(fichier)) { info('AVERTISSEMENT : ' + o.url + '.html absent du dépôt, ignoré'); continue; }
  const src = fs.readFileSync(fichier, 'utf8');
  const dico = dictionnaire(src);
  if (!dico) { echec(o.url + ' : dictionnaire de traduction introuvable'); continue; }

  for (const lang of B.LANGUES) {
    const r = versionLangue(src, dico, lang, o.url, o.urlEn);
    const dest = path.join(SORTIE, (lang === 'en' ? o.urlEn : o.url).replace(/^\//, '') + '.html');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, r.html);
    ok((lang === 'en' ? o.urlEn : o.url) + '  (' + r.remplis + ' textes écrits dans le HTML)');
    versions++;
  }
}

/* Page d'accueil, même traitement */
{
  const src = fs.readFileSync(path.join(SORTIE, 'index.html'), 'utf8');
  const dico = dictionnaire(src);
  if (dico) {
    for (const lang of B.LANGUES) {
      const r = versionLangue(src, dico, lang, '/', '/en/');
      const dest = lang === 'en' ? path.join(SORTIE, 'en', 'index.html') : path.join(SORTIE, 'index.html');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, r.html);
      ok((lang === 'en' ? '/en/' : '/') + '  (' + r.remplis + ' textes écrits dans le HTML)');
      versions++;
    }
  } else echec('page d\'accueil : dictionnaire introuvable');
}
info(versions + ' version(s) générée(s)');

if (erreurs) {
  console.error('\n=== GÉNÉRATION INTERROMPUE : ' + erreurs + ' erreur(s) ===\n');
  process.exit(1);
}

/* ---------------------------------------------------------------------------
   3. sitemap.xml et robots.txt
   --------------------------------------------------------------------------- */
console.log('\n4. Fichiers pour les moteurs de recherche');

const enLigne = B.OUTILS.filter(o => o.etat === 'live');
const paires = [{ fr: '/', en: '/en/', prio: '1.0' }]
  .concat(enLigne.map(o => ({ fr: o.url, en: o.urlEn, prio: '0.8' })));
const urls = [];
paires.forEach(p => { urls.push({ loc: p.fr, prio: p.prio, alt: p });
                      urls.push({ loc: p.en, prio: p.prio, alt: p }); });

const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>${DOMAINE}${u.loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${DOMAINE}${u.alt.fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${DOMAINE}${u.alt.en}"/>
    <lastmod>${B.MAJ.date}</lastmod>
    <priority>${u.prio}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(SORTIE, 'sitemap.xml'), sitemap);
ok('sitemap.xml — ' + urls.length + ' adresse(s)');

fs.writeFileSync(path.join(SORTIE, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${DOMAINE}/sitemap.xml
`);
ok('robots.txt');

/* ---------------------------------------------------------------------------
   4. Récapitulatif
   --------------------------------------------------------------------------- */
console.log('\n=== Site prêt ===');
console.log('   Outils en ligne : ' + enLigne.length + ' — ' + enLigne.map(o => o.titre.fr).join(', '));
const aVenir = B.OUTILS.filter(o => o.etat !== 'live');
if (aVenir.length) console.log('   À venir         : ' + aVenir.map(o => o.titre.fr).join(', '));
console.log('');
