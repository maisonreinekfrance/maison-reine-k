// Caisse Maison Reine K — Cloudflare Worker
// 1. Reçoit le panier du site, vérifie les prix et la livraison, ouvre la page de paiement Stripe.
// 2. Crée et tient à jour tous les produits et leurs prix dans Stripe (adresse /synchroniser).
// 3. Après chaque paiement, envoie le détail complet de la commande à la boîte de Reine (adresse /stripe).
//
// À régler dans Cloudflare (Settings > Variables and Secrets) :
//   STRIPE_SECRET_KEY  (Secret)  clé secrète Stripe : sk_test_... pour tester, sk_live_... en réel
//   SITE_URL           (Text)    adresse du site, sans / final. Plusieurs adresses possibles, séparées par des virgules.
//   MAIL_URL           (Text)    adresse du script Google qui envoie l'e-mail de commande à Reine

// Prix en centimes. C'est ICI que les prix font foi : le site ne peut pas les modifier.
// Généré automatiquement depuis _outils/catalogue.py (mêmes identifiants que le panier du site).
// produit = fiche produit (un produit Stripe), option = variante (un prix Stripe).
const CATALOGUE = /*CATALOGUE*/{
  "hydra-essence": {
    "produit": "hydra-essence",
    "nom": "Hydra Essence",
    "option": "Kit shampoing + masque",
    "prix": 4000,
    "img": "img/p-hydra.jpg"
  },
  "hydra-essence-shampoing": {
    "produit": "hydra-essence",
    "nom": "Hydra Essence",
    "option": "Shampoing seul",
    "prix": 1800,
    "img": "img/p-hydra.jpg"
  },
  "hydra-essence-masque": {
    "produit": "hydra-essence",
    "nom": "Hydra Essence",
    "option": "Masque seul",
    "prix": 2700,
    "img": "img/p-hydra.jpg"
  },
  "nutri-essence": {
    "produit": "nutri-essence",
    "nom": "Nutri Essence",
    "option": "Kit shampoing + masque",
    "prix": 4000,
    "img": "img/p-nutri.jpg"
  },
  "nutri-essence-shampoing": {
    "produit": "nutri-essence",
    "nom": "Nutri Essence",
    "option": "Shampoing seul",
    "prix": 1800,
    "img": "img/p-nutri.jpg"
  },
  "nutri-essence-masque": {
    "produit": "nutri-essence",
    "nom": "Nutri Essence",
    "option": "Masque seul",
    "prix": 2700,
    "img": "img/p-nutri.jpg"
  },
  "scalp-detox": {
    "produit": "scalp-detox",
    "nom": "Scalp Detox",
    "option": "",
    "prix": 2500,
    "img": "img/p-scalp.jpg"
  },
  "serum-elixir": {
    "produit": "serum-elixir",
    "nom": "Sérum Élixir",
    "option": "",
    "prix": 2500,
    "img": "img/p-serum.jpg"
  },
  "leave-in": {
    "produit": "leave-in",
    "nom": "Leave-in Kéra-Monoï",
    "option": "",
    "prix": 2500,
    "img": "img/p-leavein.jpg"
  },
  "chrono-liss": {
    "produit": "chrono-liss",
    "nom": "Kit Chrono Liss",
    "option": "",
    "prix": 4000,
    "img": "img/p-chrono.jpg"
  },
  "tissage-lisse-12": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "12″ · 25 cm",
    "prix": 9000,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-14": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "14″ · 35 cm",
    "prix": 10300,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-16": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "16″ · 40 cm",
    "prix": 10900,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-18": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "18″ · 45 cm",
    "prix": 12300,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-20": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "20″ · 50 cm",
    "prix": 14100,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-22": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "22″ · 55 cm",
    "prix": 19100,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-24": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "24″ · 60 cm",
    "prix": 20500,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-26": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "26″ · 65 cm",
    "prix": 22500,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-28": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "28″ · 70 cm",
    "prix": 24100,
    "img": "img/x-lisse.jpg"
  },
  "tissage-lisse-30": {
    "produit": "tissage-lisse",
    "nom": "Tissage lisse naturel",
    "option": "30″ · 75 cm",
    "prix": 25700,
    "img": "img/x-lisse.jpg"
  },
  "tissage-blond-ash-12": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 12″ · 25 cm",
    "prix": 11700,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-14": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 14″ · 35 cm",
    "prix": 13200,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-16": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 16″ · 40 cm",
    "prix": 14400,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-18": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 18″ · 45 cm",
    "prix": 16200,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-20": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 20″ · 50 cm",
    "prix": 19500,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-22": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 22″ · 55 cm",
    "prix": 21000,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-24": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 24″ · 60 cm",
    "prix": 23100,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-26": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 26″ · 65 cm",
    "prix": 26100,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-28": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 28″ · 70 cm",
    "prix": 26700,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-ash-30": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Ash Honey Caramel · 30″ · 75 cm",
    "prix": 28500,
    "img": "img/x-ash.jpg"
  },
  "tissage-blond-cashmere-12": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 12″ · 25 cm",
    "prix": 11700,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-14": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 14″ · 35 cm",
    "prix": 13200,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-16": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 16″ · 40 cm",
    "prix": 14400,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-18": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 18″ · 45 cm",
    "prix": 16200,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-20": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 20″ · 50 cm",
    "prix": 19500,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-22": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 22″ · 55 cm",
    "prix": 21000,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-24": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 24″ · 60 cm",
    "prix": 23100,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-26": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 26″ · 65 cm",
    "prix": 26100,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-28": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 28″ · 70 cm",
    "prix": 26700,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-cashmere-30": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Cashmere · 30″ · 75 cm",
    "prix": 28500,
    "img": "img/x-cashmere.jpg"
  },
  "tissage-blond-blond-10-12": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 12″ · 25 cm",
    "prix": 11700,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-14": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 14″ · 35 cm",
    "prix": 13200,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-16": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 16″ · 40 cm",
    "prix": 14400,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-18": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 18″ · 45 cm",
    "prix": 16200,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-20": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 20″ · 50 cm",
    "prix": 19500,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-22": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 22″ · 55 cm",
    "prix": 21000,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-24": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 24″ · 60 cm",
    "prix": 23100,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-26": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 26″ · 65 cm",
    "prix": 26100,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-28": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 28″ · 70 cm",
    "prix": 26700,
    "img": "img/x-blond10.jpg"
  },
  "tissage-blond-blond-10-30": {
    "produit": "tissage-blond",
    "nom": "Tissages blonds",
    "option": "Blond 1.0 · 30″ · 75 cm",
    "prix": 28500,
    "img": "img/x-blond10.jpg"
  },
  "tissage-wavy-20": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "20″ · 50 cm",
    "prix": 19500,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-wavy-22": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "22″ · 55 cm",
    "prix": 22400,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-wavy-24": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "24″ · 60 cm",
    "prix": 24400,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-wavy-26": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "26″ · 65 cm",
    "prix": 26100,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-wavy-28": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "28″ · 70 cm",
    "prix": 27400,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-wavy-30": {
    "produit": "tissage-wavy",
    "nom": "Wavy cambodgien Double Drawn",
    "option": "30″ · 75 cm",
    "prix": 28500,
    "img": "img/v-wavy-poster.jpg"
  },
  "tissage-deep-curly-16": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "16″ · 40 cm",
    "prix": 13500,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-18": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "18″ · 45 cm",
    "prix": 14400,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-20": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "20″ · 50 cm",
    "prix": 16500,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-22": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "22″ · 55 cm",
    "prix": 19500,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-24": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "24″ · 60 cm",
    "prix": 21000,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-26": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "26″ · 65 cm",
    "prix": 24900,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-28": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "28″ · 70 cm",
    "prix": 26400,
    "img": "img/v-curly-poster.jpg"
  },
  "tissage-deep-curly-30": {
    "produit": "tissage-deep-curly",
    "nom": "Deep Curly indien",
    "option": "30″ · 75 cm",
    "prix": 29400,
    "img": "img/v-curly-poster.jpg"
  },
  "tape-in-12": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "12″ · 25 cm",
    "prix": 13000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-14": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "14″ · 35 cm",
    "prix": 14000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-16": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "16″ · 40 cm",
    "prix": 15000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-18": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "18″ · 45 cm",
    "prix": 16500,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-20": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "20″ · 50 cm",
    "prix": 18000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-22": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "22″ · 55 cm",
    "prix": 19000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-24": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "24″ · 60 cm",
    "prix": 21500,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-26": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "26″ · 65 cm",
    "prix": 24000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-28": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "28″ · 70 cm",
    "prix": 26000,
    "img": "img/x-tapein.jpg"
  },
  "tape-in-30": {
    "produit": "tape-in",
    "nom": "Tape-in Natural Color",
    "option": "30″ · 75 cm",
    "prix": 27500,
    "img": "img/x-tapein.jpg"
  },
  "frontale-hd-lisse-13x6-16": {
    "produit": "frontale-hd-lisse",
    "nom": "Lace frontale HD lisse",
    "option": "13x6 · 16″",
    "prix": 19500,
    "img": "img/x-frontal-lisse.jpg"
  },
  "frontale-hd-lisse-13x6-20": {
    "produit": "frontale-hd-lisse",
    "nom": "Lace frontale HD lisse",
    "option": "13x6 · 20″",
    "prix": 22500,
    "img": "img/x-frontal-lisse.jpg"
  },
  "frontale-hd-lisse-13x4-22": {
    "produit": "frontale-hd-lisse",
    "nom": "Lace frontale HD lisse",
    "option": "13x4 · 22″",
    "prix": 19500,
    "img": "img/x-frontal-lisse.jpg"
  },
  "closure-hd-lisse-6x6-16": {
    "produit": "closure-hd-lisse",
    "nom": "Closure HD lisse",
    "option": "6x6 · 16″",
    "prix": 16500,
    "img": "img/x-closure-lisse.jpg"
  },
  "closure-hd-lisse-2x6-20": {
    "produit": "closure-hd-lisse",
    "nom": "Closure HD lisse",
    "option": "2x6 · 20″",
    "prix": 11500,
    "img": "img/x-closure-2x6.jpg"
  },
  "closure-hd-lisse-6x6-22": {
    "produit": "closure-hd-lisse",
    "nom": "Closure HD lisse",
    "option": "6x6 · 22″",
    "prix": 20500,
    "img": "img/x-closure-lisse.jpg"
  },
  "frontale-hd-wavy-13x6-20": {
    "produit": "frontale-hd-wavy",
    "nom": "Lace frontale HD Wavy",
    "option": "13x6 · 20″",
    "prix": 23500,
    "img": "img/x-frontal-wavy.jpg"
  },
  "frontale-hd-wavy-13x4-22": {
    "produit": "frontale-hd-wavy",
    "nom": "Lace frontale HD Wavy",
    "option": "13x4 · 22″",
    "prix": 20500,
    "img": "img/x-frontal-wavy.jpg"
  },
  "closure-hd-wavy-6x6-20": {
    "produit": "closure-hd-wavy",
    "nom": "Closure HD Wavy",
    "option": "6x6 · 20″",
    "prix": 19500,
    "img": "img/x-closure-wavy.jpg"
  },
  "closure-hd-wavy-6x6-22": {
    "produit": "closure-hd-wavy",
    "nom": "Closure HD Wavy",
    "option": "6x6 · 22″",
    "prix": 20500,
    "img": "img/x-closure-wavy.jpg"
  }
}/*FIN*/;

// Livraison Colissimo par zone : [jusqu'à 3 produits, au-delà de 3], en centimes.
// France : point retrait ou locker = 1 € de moins (grille de Philippe, 20/10/2026).
const ZONES = {
  FR: { nom: 'France', pays: ['FR', 'MC'], prix: [1200, 1700] },
  UE: { nom: 'Union européenne', pays: ['DE','AT','BE','BG','CY','HR','DK','ES','EE','FI','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','CZ','RO','SK','SI','SE'], prix: [2000, 3000] },
  CH: { nom: 'Suisse', pays: ['CH', 'LI'], prix: [3000, 4000] },
  ZC: { nom: 'États-Unis / Canada', pays: ['US', 'CA'], prix: [4000, 5000] },
};
const CHEVEUX = ['tissage-', 'tape-in', 'frontale-', 'closure-'];
const PREFIXE = 'rk-';   // identifiants des produits dans Stripe : rk-hydra-essence, rk-tissage-lisse…

const euros = c => (c / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function stripe(env, chemin, params, methode) {
  const options = { method: methode || (params ? 'POST' : 'GET'), headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY } };
  if (params) { options.headers['Content-Type'] = 'application/x-www-form-urlencoded'; options.body = params; }
  return fetch('https://api.stripe.com/v1/' + chemin, options).then(async r => ({ ok: r.ok, statut: r.status, json: await r.json() }));
}

// ---------- Produits et prix dans Stripe ----------
// Un produit Stripe par fiche du site, un prix par variante (longueur, nuance, format…).
// Chaque prix porte une « lookup key » égale à l'identifiant du panier : la caisse le retrouve sans rien stocker.
async function prixStripe(env, ids) {
  const trouves = {};
  for (let i = 0; i < ids.length; i += 10) {
    const q = new URLSearchParams({ active: 'true', limit: '100' });
    ids.slice(i, i + 10).forEach(id => q.append('lookup_keys[]', id));
    const r = await stripe(env, 'prices?' + q);
    if (r.ok) r.json.data.forEach(p => { trouves[p.lookup_key] = p; });
  }
  return trouves;
}

async function synchroniser(env, site) {
  const rapport = { produits_crees: 0, prix_crees: 0, prix_a_jour: 0, erreurs: [] };
  const fiches = {};
  for (const [id, a] of Object.entries(CATALOGUE)) (fiches[a.produit] ||= { nom: a.nom, img: a.img, ids: [] }).ids.push(id);
  const existants = await prixStripe(env, Object.keys(CATALOGUE));
  for (const [produit, f] of Object.entries(fiches)) {
    const pid = PREFIXE + produit;
    let r = await stripe(env, 'products/' + pid);
    const champs = new URLSearchParams({ name: f.nom, 'metadata[site]': 'maison-reine-k' });
    if (site && f.img) champs.set('images[0]', site + '/' + f.img);
    if (r.statut === 404) {
      champs.set('id', pid);
      r = await stripe(env, 'products', champs);
      if (r.ok) rapport.produits_crees++; else { rapport.erreurs.push(pid + ' : ' + r.json.error?.message); continue; }
    } else {
      await stripe(env, 'products/' + pid, champs);
    }
    for (const id of f.ids) {
      const a = CATALOGUE[id], p = existants[id];
      if (p && p.unit_amount === a.prix && p.product === pid) { rapport.prix_a_jour++; continue; }
      const nouveau = new URLSearchParams({ product: pid, currency: 'eur', unit_amount: String(a.prix), lookup_key: id, transfer_lookup_key: 'true' });
      if (a.option) nouveau.set('nickname', a.option);
      const c = await stripe(env, 'prices', nouveau);
      if (!c.ok) { rapport.erreurs.push(id + ' : ' + c.json.error?.message); continue; }
      rapport.prix_crees++;
      if (p) await stripe(env, 'prices/' + p.id, new URLSearchParams({ active: 'false' }));
    }
  }
  return rapport;
}

// Le webhook Stripe qui prévient la caisse à chaque paiement (créé une seule fois).
async function brancherWebhook(env, adresse) {
  const r = await stripe(env, 'webhook_endpoints?limit=100');
  if (r.ok && r.json.data.some(w => w.url === adresse && w.status === 'enabled')) return 'déjà branché';
  const p = new URLSearchParams({ url: adresse, description: 'Maison Reine K : e-mail de commande' });
  ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].forEach((e, i) => p.set(`enabled_events[${i}]`, e));
  const c = await stripe(env, 'webhook_endpoints', p);
  return c.ok ? 'branché' : 'erreur : ' + c.json.error?.message;
}

// ---------- E-mail de commande ----------
function emailCommande(s) {
  const livr = s.collected_information?.shipping_details || s.shipping_details || {};
  const adr = livr.address || s.customer_details?.address || {};
  const nom = livr.name || s.customer_details?.name || '';
  const article = l => l.description + (l.price?.nickname && !l.description.includes('(') ? ' (' + l.price.nickname + ')' : '');
  const lignes = s.line_items?.data || [];
  const meta = s.metadata || {};
  const champs = (s.custom_fields || []).map(c => `${c.label?.custom || c.key} : ${c.text?.value || ''}`);
  const adresse = [nom, adr.line1, adr.line2, `${adr.postal_code || ''} ${adr.city || ''}`.trim(), adr.state, adr.country].filter(Boolean);
  const cheveux = lignes.some(l => CHEVEUX.some(c => (l.price?.lookup_key || '').startsWith(c)));
  const numero = s.id.slice(-8).toUpperCase();
  const tr = (a, b) => `<tr><td style="padding:6px 12px 6px 0;color:#8a7c70">${a}</td><td style="padding:6px 0">${b}</td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2a211c;max-width:640px">
<h2 style="font-weight:normal;margin:0 0 4px">Nouvelle commande payée · n° ${numero}</h2>
<p style="margin:0 0 18px;color:#8a7c70">${new Date(s.created * 1000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} · ${euros(s.amount_total)} payés par carte</p>
<h3 style="font-weight:normal;border-bottom:1px solid #eee;padding-bottom:6px">Articles</h3>
<table style="border-collapse:collapse;width:100%">${lignes.map(l => `<tr><td style="padding:6px 0">${l.quantity} × ${echapper(article(l))}</td><td style="padding:6px 0;text-align:right">${euros(l.amount_total)}</td></tr>`).join('')}
<tr><td style="padding:6px 0;color:#8a7c70">Livraison : ${echapper(meta.livraison || '')}</td><td style="padding:6px 0;text-align:right">${euros(s.shipping_cost?.amount_total || 0)}</td></tr>
<tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #eee">Total payé</td><td style="padding:10px 0;text-align:right;font-weight:bold;border-top:1px solid #eee">${euros(s.amount_total)}</td></tr></table>
<h3 style="font-weight:normal;border-bottom:1px solid #eee;padding-bottom:6px">Cliente</h3>
<table style="border-collapse:collapse">${tr('Nom', echapper(nom))}${tr('E-mail', `<a href="mailto:${echapper(s.customer_details?.email)}">${echapper(s.customer_details?.email)}</a>`)}${tr('Téléphone', echapper(s.customer_details?.phone || ''))}</table>
<h3 style="font-weight:normal;border-bottom:1px solid #eee;padding-bottom:6px">Adresse de livraison</h3>
<p style="margin:0;line-height:1.6">${adresse.map(echapper).join('<br>')}</p>
${champs.length ? `<p style="margin:12px 0 0;line-height:1.6">${champs.map(echapper).join('<br>')}</p>` : ''}
${cheveux ? '<p style="margin:18px 0 0;padding:10px 14px;background:#f8f3ea">Commande de cheveux : préparation 4 à 15 jours ouvrés, commande définitive 48 h après validation.</p>' : ''}
<p style="margin:22px 0 0;font-size:13px;color:#8a7c70">Le paiement et tous les détails sont aussi dans Stripe (Paiements), référence ${echapper(s.payment_intent || s.id)}.</p></div>`;
  const texte = [`Nouvelle commande payée n° ${numero} : ${euros(s.amount_total)}`, '',
    ...lignes.map(l => `${l.quantity} × ${article(l)} : ${euros(l.amount_total)}`),
    `Livraison (${meta.livraison || ''}) : ${euros(s.shipping_cost?.amount_total || 0)}`, '',
    `Cliente : ${nom}`, `E-mail : ${s.customer_details?.email || ''}`, `Téléphone : ${s.customer_details?.phone || ''}`, '',
    'Adresse :', ...adresse, ...champs].join('\n');
  return { sujet: `Commande ${numero} · ${nom} · ${euros(s.amount_total)}`, html, texte, repondre_a: s.customer_details?.email || '' };
}

async function traiterEvenement(env, corps) {
  // On ne fait pas confiance au contenu reçu : on relit l'événement directement chez Stripe.
  let id;
  try { id = JSON.parse(corps).id; } catch { return 'illisible'; }
  if (!/^evt_[A-Za-z0-9]+$/.test(id || '')) return 'illisible';
  const ev = await stripe(env, 'events/' + id);
  if (!ev.ok) return 'inconnu';
  const type = ev.json.type;
  if (type !== 'checkout.session.completed' && type !== 'checkout.session.async_payment_succeeded') return 'ignoré';
  const sid = ev.json.data.object.id;
  const s = await stripe(env, `checkout/sessions/${sid}?expand[]=line_items.data.price`);
  if (!s.ok) return 'session introuvable';
  if (s.json.payment_status !== 'paid') return 'pas encore payé';
  if (!env.MAIL_URL) return 'MAIL_URL manquante';
  const r = await fetch(env.MAIL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailCommande(s.json)) });
  if (!r.ok) throw new Error('Envoi e-mail : ' + r.status);
  return 'e-mail envoyé';
}

// ---------- Paiement ----------
async function creerPaiement(env, site, demande) {
  const { articles, zone, mode } = demande;
  const z = ZONES[zone] || ZONES.FR;
  const relais = (zone || 'FR') === 'FR' && mode === 'relais';
  if (!Array.isArray(articles) || !articles.length || articles.length > 30) return [{ erreur: 'Panier vide' }, 400];
  for (const a of articles) {
    const q = Math.floor(Number(a.q));
    if (!CATALOGUE[a.id]) return [{ erreur: 'Produit inconnu : ' + a.id }, 400];
    if (!(q >= 1 && q <= 20)) return [{ erreur: 'Quantité invalide' }, 400];
  }
  const prix = await prixStripe(env, articles.map(a => a.id));

  const f = new URLSearchParams();
  f.set('mode', 'payment');
  f.set('locale', 'fr');
  f.set('success_url', site + '/boutique.html?commande=ok');
  f.set('cancel_url', site + '/boutique.html?commande=annulee');
  f.set('customer_creation', 'always');
  f.set('phone_number_collection[enabled]', 'true');
  f.set('billing_address_collection', 'auto');
  z.pays.forEach((p, i) => f.set(`shipping_address_collection[allowed_countries][${i}]`, p));
  f.set('payment_intent_data[description]', 'Commande Maison Reine K');

  articles.forEach((a, i) => {
    const produit = CATALOGUE[a.id], p = prix[a.id];
    f.set(`line_items[${i}][quantity]`, String(Math.floor(Number(a.q))));
    if (p && p.unit_amount === produit.prix) {
      f.set(`line_items[${i}][price]`, p.id);
    } else {
      // Prix pas encore créé dans Stripe : on l'envoie directement, au prix du catalogue.
      f.set(`line_items[${i}][price_data][currency]`, 'eur');
      f.set(`line_items[${i}][price_data][unit_amount]`, String(produit.prix));
      f.set(`line_items[${i}][price_data][product_data][name]`, produit.nom + (produit.option ? ' (' + produit.option + ')' : ''));
    }
  });

  // Frais de livraison : calculés ici, jamais envoyés par le site
  const nbProduits = articles.reduce((t, a) => t + Math.floor(Number(a.q)), 0);
  const frais = z.prix[nbProduits <= 3 ? 0 : 1] - (relais ? 100 : 0);
  const libelle = 'Colissimo suivi · ' + z.nom + (relais ? ' · point retrait ou locker' : ((zone || 'FR') === 'FR' ? ' · à domicile' : ''));
  f.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(frais));
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
  f.set('shipping_options[0][shipping_rate_data][display_name]', libelle);
  f.set('metadata[livraison]', libelle);
  f.set('metadata[articles]', articles.map(a => `${a.q}x ${a.id}`).join(', ').slice(0, 490));
  if (relais) {
    f.set('custom_fields[0][key]', 'point_retrait');
    f.set('custom_fields[0][label][type]', 'custom');
    f.set('custom_fields[0][label][custom]', 'Point retrait ou locker (nom et adresse)');
    f.set('custom_fields[0][type]', 'text');
  }
  const cheveux = articles.some(a => CHEVEUX.some(c => a.id.startsWith(c)));
  f.set('custom_text[shipping_address][message]', 'Vérifiez bien votre adresse et votre numéro de téléphone : votre colis part en Colissimo suivi.');
  f.set('custom_text[submit][message]', (cheveux ? 'Commande de cheveux : définitive 48 h après validation, préparée en 4 à 15 jours ouvrés. ' : '')
    + 'En payant, vous acceptez nos conditions de vente : ' + site + '/cgv.html');

  const r = await stripe(env, 'checkout/sessions', f);
  if (!r.ok) return [{ erreur: r.json.error?.message || 'Stripe a refusé la commande' }, 502];
  return [{ url: r.json.url }, 200];
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // SITE_URL peut contenir plusieurs adresses séparées par des virgules : on retient celle d'où vient la demande.
    const sites = (env.SITE_URL || '').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);
    const origine = request.headers.get('Origin') || '';
    const site = sites.find(x => new URL(x).origin === origine) || sites[0] || '';
    const cors = {
      'Access-Control-Allow-Origin': site ? new URL(site).origin : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const repondre = (corps, statut = 200) =>
      new Response(JSON.stringify(corps, null, 2), { status: statut, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!env.STRIPE_SECRET_KEY || !site) return repondre({ erreur: 'Caisse non configurée' }, 500);

    // Stripe prévient la caisse d'un paiement → e-mail de commande à Reine
    if (url.pathname === '/stripe' && request.method === 'POST') {
      try { return repondre({ resultat: await traiterEvenement(env, await request.text()) }); }
      catch (e) { return repondre({ erreur: e.message }, 500); }   // Stripe réessaiera plus tard
    }
    // Crée ou met à jour tous les produits dans Stripe, et branche le webhook. Sans risque : on peut l'ouvrir plusieurs fois.
    if (url.pathname === '/synchroniser') {
      const rapport = await synchroniser(env, site);
      rapport.webhook = await brancherWebhook(env, url.origin + '/stripe');
      rapport.mode = env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'réel' : 'test';
      rapport.e_mail_commandes = env.MAIL_URL ? 'branché' : 'MAIL_URL manquante';
      return repondre(rapport);
    }
    if (request.method !== 'POST') return repondre({ caisse: 'Maison Reine K', etat: 'en service' });

    let demande;
    try { demande = await request.json(); } catch { return repondre({ erreur: 'Panier illisible' }, 400); }
    const [corps, statut] = await creerPaiement(env, site, demande);
    return repondre(corps, statut);
  },
};
