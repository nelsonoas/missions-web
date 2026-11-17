// Données : lecture depuis GitHub, cache local, calculs (heures, salaire, dates)
export const DEPOT = 'nelsonoas/protectas-planning'
export const BRANCHE = 'main'
export const TAUX_HORAIRE_DEFAUT = 24.7
const PART_VACANCES = 0.0833
// Déductions sociales lues sur la fiche de salaire (AVS, AC, LAMat, AANP, LAAC, IJM)
const TAUX_DEDUCTIONS = 0.053 + 0.011 + 0.00029 + 0.01357 + 0.00084 + 0.0135
const CCT_PAR_HEURE = 0.015

// Tout reste sur ce téléphone (localStorage), rien n'est envoyé ailleurs qu'à GitHub
const CLE_JETON = 'missions.jeton'
const CLE_CACHE = 'missions.cache.v1'
const CLE_TAUX = 'missions.taux'

function lire(cle) { try { return localStorage.getItem(cle) } catch { return null } }
function ecrire(cle, valeur) {
  try { valeur == null ? localStorage.removeItem(cle) : localStorage.setItem(cle, valeur) } catch { /* mode privé */ }
}

export const lireJeton = () => lire(CLE_JETON)
export const enregistrerJeton = (jeton) => ecrire(CLE_JETON, jeton ? jeton.trim() : null)

export function lireTaux() {
  const n = parseFloat(lire(CLE_TAUX))
  return Number.isFinite(n) ? n : TAUX_HORAIRE_DEFAUT
}
export const enregistrerTaux = (taux) => ecrire(CLE_TAUX, String(taux))

async function lireFichierGithub(chemin, jeton) {
  const rep = await fetch(`https://api.github.com/repos/${DEPOT}/contents/${chemin}?ref=${BRANCHE}`, {
    headers: {
      Authorization: `Bearer ${jeton}`,
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  })
  if (rep.status === 401 || rep.status === 403) throw new Error('Jeton GitHub refusé. Vérifie-le dans Réglages.')
  if (rep.status === 404) {
    if (chemin.endsWith('ordres_service.json')) return null
    throw new Error('Fichier introuvable : vérifie le dossier data/ du dépôt et les droits du jeton.')
  }
  if (!rep.ok) throw new Error(`GitHub a répondu ${rep.status}`)
  return rep.json()
}

export async function telechargerDonnees(jeton) {
  const [missions, ordres] = await Promise.all([
    lireFichierGithub('data/missions.json', jeton),
    lireFichierGithub('data/ordres_service.json', jeton),
  ])
  const donnees = { missions: missions || {}, ordres: ordres || [], synchroLe: new Date().toISOString() }
  ecrire(CLE_CACHE, JSON.stringify(donnees))
  return donnees
}

export function lireCache() {
  try { return JSON.parse(lire(CLE_CACHE)) } catch { return null }
}

export const lienPdf = (chemin) => `https://github.com/${DEPOT}/blob/${BRANCHE}/${chemin}`
export const lienItineraire = (adresse) => `https://maps.apple.com/?daddr=${encodeURIComponent(adresse)}`

// --- Dates ----------------------------------------------------------------------
export const JOURS_COURTS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
export const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre'];

function dateLocale(jourIso, heure) {
  const [a, m, j] = jourIso.split('-').map(Number);
  const [h, mi] = heure.split(':').map(Number);
  return new Date(a, m - 1, j, h, mi);
}

export const debutDe = (e) => dateLocale(e.jour, e.debut);
export function finDe(e) {
  const fin = dateLocale(e.jour, e.fin);
  if (fin <= debutDe(e)) fin.setDate(fin.getDate() + 1); // service qui passe minuit
  return fin;
}

export const cleJour = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function libelleJour(jourIso, long = false) {
  const d = dateLocale(jourIso, '00:00');
  const auj = cleJour(new Date());
  const demain = new Date(); demain.setDate(demain.getDate() + 1);
  if (jourIso === auj) return "Aujourd'hui";
  if (jourIso === cleJour(demain)) return 'Demain';
  const nom = long ? JOURS_LONGS[d.getDay()] : JOURS_COURTS[d.getDay()];
  return `${nom.charAt(0).toUpperCase()}${nom.slice(1)} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function duree(minutes) {
  const signe = minutes < 0 ? '-' : '';
  const m = Math.abs(Math.round(minutes));
  return `${signe}${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

export function compteARebours(cible, maintenant = new Date()) {
  const min = Math.max(0, Math.round((cible - maintenant) / 60000));
  const j = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (j > 0) return `dans ${j} j ${h} h`;
  if (h > 0) return m ? `dans ${h} h ${String(m).padStart(2, '0')}` : `dans ${h} h`;
  return `dans ${m} min`;
}

// --- Missions -------------------------------------------------------------------
const TYPES_PAYES = ['mission', 'releve', 'ajustement'];

export function toutesLesEntrees(missions) {
  return Object.values(missions || {})
    .flatMap((p) => (p.entrees || []).map((e) => ({ ...e, periode: p.periode })))
    .sort((a, b) => debutDe(a) - debutDe(b));
}

export const seulementMissions = (entrees) => entrees.filter((e) => e.type === 'mission');

export function prochaines(entrees, maintenant = new Date()) {
  return seulementMissions(entrees).filter((e) => finDe(e) > maintenant);
}

export function minutesPayees(entrees, du, au) {
  // du inclus, au exclu (dates locales)
  return entrees
    .filter((e) => TYPES_PAYES.includes(e.type))
    .filter((e) => { const d = debutDe(e); return d >= du && d < au; })
    .reduce((s, e) => s + (e.duree_min || 0) + (e.majoration_min || 0), 0);
}

export function bornesSemaine(ref = new Date()) {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const decalage = (d.getDay() + 6) % 7; // lundi = 0
  const du = new Date(d); du.setDate(d.getDate() - decalage);
  const au = new Date(du); au.setDate(du.getDate() + 7);
  return [du, au];
}

export function bornesMois(annee, mois0) {
  return [new Date(annee, mois0, 1), new Date(annee, mois0 + 1, 1)];
}

export function estimerSalaire(minutes, taux) {
  const heures = minutes / 60;
  const base = heures * taux;
  const vacances = base * PART_VACANCES;
  const brut = base + vacances;
  const deductions = brut * TAUX_DEDUCTIONS + heures * CCT_PAR_HEURE;
  return { heures, base, vacances, brut, deductions, net: brut - deductions };
}

export const chf = (n) => `${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")} CHF`;

// Ordres de service reçus le jour d'une mission ou dans les 10 jours avant,
// dont l'objet mentionne un mot du nom du client (ex. « Patek », « Christie's »).
export function ordresPourMission(mission, ordres) {
  const mots = mission.client.toLowerCase().split(/[\s·,()]+/).filter((m) => m.length >= 4);
  const debut = debutDe(mission);
  return (ordres || []).filter((o) => {
    const recu = new Date(o.recu_le);
    const ecart = (debut - recu) / 86400000;
    const sujet = o.sujet.toLowerCase();
    return ecart >= -1 && ecart <= 10 && mots.some((m) => sujet.includes(m));
  });
}
