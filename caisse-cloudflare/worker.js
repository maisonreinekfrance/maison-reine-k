// Caisse Maison Reine K — Cloudflare Worker
// Reçoit le panier du site, vérifie les prix, crée la page de paiement Stripe.
//
// À régler dans Cloudflare (Settings > Variables and Secrets) :
//   STRIPE_SECRET_KEY  (Secret)  clé secrète Stripe : sk_test_... pour tester, sk_live_... en réel
//   SITE_URL           (Text)    adresse du site, sans / final. Plusieurs adresses possibles, séparées par des virgules.

// Prix en centimes. C'est ICI que les prix font foi : le site ne peut pas les modifier.
// Généré automatiquement depuis _outils/catalogue.py (même identifiants que le panier du site).
const CATALOGUE = /*CATALOGUE*/{
  "hydra-essence": {
    "nom": "Hydra Essence (Kit shampoing + masque)",
    "prix": 4000
  },
  "hydra-essence-shampoing": {
    "nom": "Hydra Essence (Shampoing seul)",
    "prix": 1800
  },
  "hydra-essence-masque": {
    "nom": "Hydra Essence (Masque seul)",
    "prix": 2700
  },
  "nutri-essence": {
    "nom": "Nutri Essence (Kit shampoing + masque)",
    "prix": 4000
  },
  "nutri-essence-shampoing": {
    "nom": "Nutri Essence (Shampoing seul)",
    "prix": 1800
  },
  "nutri-essence-masque": {
    "nom": "Nutri Essence (Masque seul)",
    "prix": 2700
  },
  "scalp-detox": {
    "nom": "Scalp Detox",
    "prix": 2500
  },
  "serum-elixir": {
    "nom": "Sérum Élixir",
    "prix": 2500
  },
  "leave-in": {
    "nom": "Leave-in Kéra-Monoï",
    "prix": 2500
  },
  "chrono-liss": {
    "nom": "Kit Chrono Liss",
    "prix": 4000
  },
  "tissage-lisse-12": {
    "nom": "Tissage lisse naturel (12″ · 25 cm)",
    "prix": 9000
  },
  "tissage-lisse-14": {
    "nom": "Tissage lisse naturel (14″ · 35 cm)",
    "prix": 10300
  },
  "tissage-lisse-16": {
    "nom": "Tissage lisse naturel (16″ · 40 cm)",
    "prix": 10900
  },
  "tissage-lisse-18": {
    "nom": "Tissage lisse naturel (18″ · 45 cm)",
    "prix": 12300
  },
  "tissage-lisse-20": {
    "nom": "Tissage lisse naturel (20″ · 50 cm)",
    "prix": 14100
  },
  "tissage-lisse-22": {
    "nom": "Tissage lisse naturel (22″ · 55 cm)",
    "prix": 19100
  },
  "tissage-lisse-24": {
    "nom": "Tissage lisse naturel (24″ · 60 cm)",
    "prix": 20500
  },
  "tissage-lisse-26": {
    "nom": "Tissage lisse naturel (26″ · 65 cm)",
    "prix": 22500
  },
  "tissage-lisse-28": {
    "nom": "Tissage lisse naturel (28″ · 70 cm)",
    "prix": 24100
  },
  "tissage-lisse-30": {
    "nom": "Tissage lisse naturel (30″ · 75 cm)",
    "prix": 25700
  },
  "tissage-blond-ash-12": {
    "nom": "Tissages blonds (Ash Honey Caramel · 12″ · 25 cm)",
    "prix": 11700
  },
  "tissage-blond-ash-14": {
    "nom": "Tissages blonds (Ash Honey Caramel · 14″ · 35 cm)",
    "prix": 13200
  },
  "tissage-blond-ash-16": {
    "nom": "Tissages blonds (Ash Honey Caramel · 16″ · 40 cm)",
    "prix": 14400
  },
  "tissage-blond-ash-18": {
    "nom": "Tissages blonds (Ash Honey Caramel · 18″ · 45 cm)",
    "prix": 16200
  },
  "tissage-blond-ash-20": {
    "nom": "Tissages blonds (Ash Honey Caramel · 20″ · 50 cm)",
    "prix": 19500
  },
  "tissage-blond-ash-22": {
    "nom": "Tissages blonds (Ash Honey Caramel · 22″ · 55 cm)",
    "prix": 21000
  },
  "tissage-blond-ash-24": {
    "nom": "Tissages blonds (Ash Honey Caramel · 24″ · 60 cm)",
    "prix": 23100
  },
  "tissage-blond-ash-26": {
    "nom": "Tissages blonds (Ash Honey Caramel · 26″ · 65 cm)",
    "prix": 26100
  },
  "tissage-blond-ash-28": {
    "nom": "Tissages blonds (Ash Honey Caramel · 28″ · 70 cm)",
    "prix": 26700
  },
  "tissage-blond-ash-30": {
    "nom": "Tissages blonds (Ash Honey Caramel · 30″ · 75 cm)",
    "prix": 28500
  },
  "tissage-blond-cashmere-12": {
    "nom": "Tissages blonds (Cashmere · 12″ · 25 cm)",
    "prix": 11700
  },
  "tissage-blond-cashmere-14": {
    "nom": "Tissages blonds (Cashmere · 14″ · 35 cm)",
    "prix": 13200
  },
  "tissage-blond-cashmere-16": {
    "nom": "Tissages blonds (Cashmere · 16″ · 40 cm)",
    "prix": 14400
  },
  "tissage-blond-cashmere-18": {
    "nom": "Tissages blonds (Cashmere · 18″ · 45 cm)",
    "prix": 16200
  },
  "tissage-blond-cashmere-20": {
    "nom": "Tissages blonds (Cashmere · 20″ · 50 cm)",
    "prix": 19500
  },
  "tissage-blond-cashmere-22": {
    "nom": "Tissages blonds (Cashmere · 22″ · 55 cm)",
    "prix": 21000
  },
  "tissage-blond-cashmere-24": {
    "nom": "Tissages blonds (Cashmere · 24″ · 60 cm)",
    "prix": 23100
  },
  "tissage-blond-cashmere-26": {
    "nom": "Tissages blonds (Cashmere · 26″ · 65 cm)",
    "prix": 26100
  },
  "tissage-blond-cashmere-28": {
    "nom": "Tissages blonds (Cashmere · 28″ · 70 cm)",
    "prix": 26700
  },
  "tissage-blond-cashmere-30": {
    "nom": "Tissages blonds (Cashmere · 30″ · 75 cm)",
    "prix": 28500
  },
  "tissage-blond-blond-10-12": {
    "nom": "Tissages blonds (Blond 1.0 · 12″ · 25 cm)",
    "prix": 11700
  },
  "tissage-blond-blond-10-14": {
    "nom": "Tissages blonds (Blond 1.0 · 14″ · 35 cm)",
    "prix": 13200
  },
  "tissage-blond-blond-10-16": {
    "nom": "Tissages blonds (Blond 1.0 · 16″ · 40 cm)",
    "prix": 14400
  },
  "tissage-blond-blond-10-18": {
    "nom": "Tissages blonds (Blond 1.0 · 18″ · 45 cm)",
    "prix": 16200
  },
  "tissage-blond-blond-10-20": {
    "nom": "Tissages blonds (Blond 1.0 · 20″ · 50 cm)",
    "prix": 19500
  },
  "tissage-blond-blond-10-22": {
    "nom": "Tissages blonds (Blond 1.0 · 22″ · 55 cm)",
    "prix": 21000
  },
  "tissage-blond-blond-10-24": {
    "nom": "Tissages blonds (Blond 1.0 · 24″ · 60 cm)",
    "prix": 23100
  },
  "tissage-blond-blond-10-26": {
    "nom": "Tissages blonds (Blond 1.0 · 26″ · 65 cm)",
    "prix": 26100
  },
  "tissage-blond-blond-10-28": {
    "nom": "Tissages blonds (Blond 1.0 · 28″ · 70 cm)",
    "prix": 26700
  },
  "tissage-blond-blond-10-30": {
    "nom": "Tissages blonds (Blond 1.0 · 30″ · 75 cm)",
    "prix": 28500
  },
  "tissage-wavy-20": {
    "nom": "Wavy cambodgien Double Drawn (20″ · 50 cm)",
    "prix": 19500
  },
  "tissage-wavy-22": {
    "nom": "Wavy cambodgien Double Drawn (22″ · 55 cm)",
    "prix": 22400
  },
  "tissage-wavy-24": {
    "nom": "Wavy cambodgien Double Drawn (24″ · 60 cm)",
    "prix": 24400
  },
  "tissage-wavy-26": {
    "nom": "Wavy cambodgien Double Drawn (26″ · 65 cm)",
    "prix": 26100
  },
  "tissage-wavy-28": {
    "nom": "Wavy cambodgien Double Drawn (28″ · 70 cm)",
    "prix": 27400
  },
  "tissage-wavy-30": {
    "nom": "Wavy cambodgien Double Drawn (30″ · 75 cm)",
    "prix": 28500
  },
  "tissage-deep-curly-16": {
    "nom": "Deep Curly indien (16″ · 40 cm)",
    "prix": 13500
  },
  "tissage-deep-curly-18": {
    "nom": "Deep Curly indien (18″ · 45 cm)",
    "prix": 14400
  },
  "tissage-deep-curly-20": {
    "nom": "Deep Curly indien (20″ · 50 cm)",
    "prix": 16500
  },
  "tissage-deep-curly-22": {
    "nom": "Deep Curly indien (22″ · 55 cm)",
    "prix": 19500
  },
  "tissage-deep-curly-24": {
    "nom": "Deep Curly indien (24″ · 60 cm)",
    "prix": 21000
  },
  "tissage-deep-curly-26": {
    "nom": "Deep Curly indien (26″ · 65 cm)",
    "prix": 24900
  },
  "tissage-deep-curly-28": {
    "nom": "Deep Curly indien (28″ · 70 cm)",
    "prix": 26400
  },
  "tissage-deep-curly-30": {
    "nom": "Deep Curly indien (30″ · 75 cm)",
    "prix": 29400
  },
  "tape-in-12": {
    "nom": "Tape-in Natural Color (12″ · 25 cm)",
    "prix": 13000
  },
  "tape-in-14": {
    "nom": "Tape-in Natural Color (14″ · 35 cm)",
    "prix": 14000
  },
  "tape-in-16": {
    "nom": "Tape-in Natural Color (16″ · 40 cm)",
    "prix": 15000
  },
  "tape-in-18": {
    "nom": "Tape-in Natural Color (18″ · 45 cm)",
    "prix": 16500
  },
  "tape-in-20": {
    "nom": "Tape-in Natural Color (20″ · 50 cm)",
    "prix": 18000
  },
  "tape-in-22": {
    "nom": "Tape-in Natural Color (22″ · 55 cm)",
    "prix": 19000
  },
  "tape-in-24": {
    "nom": "Tape-in Natural Color (24″ · 60 cm)",
    "prix": 21500
  },
  "tape-in-26": {
    "nom": "Tape-in Natural Color (26″ · 65 cm)",
    "prix": 24000
  },
  "tape-in-28": {
    "nom": "Tape-in Natural Color (28″ · 70 cm)",
    "prix": 26000
  },
  "tape-in-30": {
    "nom": "Tape-in Natural Color (30″ · 75 cm)",
    "prix": 27500
  },
  "frontale-hd-lisse-13x6-16": {
    "nom": "Lace frontale HD lisse (13x6 · 16″)",
    "prix": 19500
  },
  "frontale-hd-lisse-13x6-20": {
    "nom": "Lace frontale HD lisse (13x6 · 20″)",
    "prix": 22500
  },
  "frontale-hd-lisse-13x4-22": {
    "nom": "Lace frontale HD lisse (13x4 · 22″)",
    "prix": 19500
  },
  "closure-hd-lisse-6x6-16": {
    "nom": "Closure HD lisse (6x6 · 16″)",
    "prix": 16500
  },
  "closure-hd-lisse-2x6-20": {
    "nom": "Closure HD lisse (2x6 · 20″)",
    "prix": 11500
  },
  "closure-hd-lisse-6x6-22": {
    "nom": "Closure HD lisse (6x6 · 22″)",
    "prix": 20500
  },
  "frontale-hd-wavy-13x6-20": {
    "nom": "Lace frontale HD Wavy (13x6 · 20″)",
    "prix": 23500
  },
  "frontale-hd-wavy-13x4-22": {
    "nom": "Lace frontale HD Wavy (13x4 · 22″)",
    "prix": 20500
  },
  "closure-hd-wavy-6x6-20": {
    "nom": "Closure HD Wavy (6x6 · 20″)",
    "prix": 19500
  },
  "closure-hd-wavy-6x6-22": {
    "nom": "Closure HD Wavy (6x6 · 22″)",
    "prix": 20500
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

export default {
  async fetch(request, env) {
    // SITE_URL peut contenir plusieurs adresses séparées par des virgules : on retient celle d'où vient la demande.
    const sites = (env.SITE_URL || '').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);
    const origine = request.headers.get('Origin') || '';
    const site = sites.find(x => new URL(x).origin === origine) || sites[0] || '';
    const origineSite = site ? new URL(site).origin : '*';
    const cors = {
      'Access-Control-Allow-Origin': origineSite,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    const repondre = (corps, statut = 200) =>
      new Response(JSON.stringify(corps), { status: statut, headers: { 'Content-Type': 'application/json', ...cors } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return repondre({ erreur: 'Méthode non autorisée' }, 405);
    if (!env.STRIPE_SECRET_KEY || !site) return repondre({ erreur: 'Caisse non configurée' }, 500);

    let articles, zone, mode;
    try { ({ articles, zone, mode } = await request.json()); } catch { return repondre({ erreur: 'Panier illisible' }, 400); }
    const z = ZONES[zone] || ZONES.FR;
    const relais = (zone || 'FR') === 'FR' && mode === 'relais';
    if (!Array.isArray(articles) || !articles.length || articles.length > 30) return repondre({ erreur: 'Panier vide' }, 400);

    // Construction de la commande à partir du catalogue (jamais des prix envoyés par le site)
    const f = new URLSearchParams();
    f.set('mode', 'payment');
    f.set('locale', 'fr');
    f.set('success_url', site + '/boutique.html?commande=ok');
    f.set('cancel_url', site + '/boutique.html?commande=annulee');
    f.set('phone_number_collection[enabled]', 'true');
    z.pays.forEach((p, i) => f.set(`shipping_address_collection[allowed_countries][${i}]`, p));

    let i = 0;
    for (const a of articles) {
      const produit = CATALOGUE[a.id];
      const q = Math.floor(Number(a.q));
      if (!produit) return repondre({ erreur: 'Produit inconnu : ' + a.id }, 400);
      if (!(q >= 1 && q <= 20)) return repondre({ erreur: 'Quantité invalide' }, 400);
      f.set(`line_items[${i}][quantity]`, String(q));
      f.set(`line_items[${i}][price_data][currency]`, 'eur');
      f.set(`line_items[${i}][price_data][unit_amount]`, String(produit.prix));
      f.set(`line_items[${i}][price_data][product_data][name]`, produit.nom);
      i++;
    }

    // Frais de livraison : calculés ici, jamais envoyés par le site
    const nbProduits = articles.reduce((t, a) => t + Math.floor(Number(a.q)), 0);
    const frais = z.prix[nbProduits <= 3 ? 0 : 1] - (relais ? 100 : 0);
    f.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    f.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(frais));
    f.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
    f.set('shipping_options[0][shipping_rate_data][display_name]', 'Colissimo · ' + z.nom + (relais ? ' · point retrait ou locker' : (zone === 'FR' || !zone ? ' · à domicile' : '')));
    if (relais) {
      f.set('custom_fields[0][key]', 'point_retrait');
      f.set('custom_fields[0][label][type]', 'custom');
      f.set('custom_fields[0][label][custom]', 'Point retrait ou locker choisi (nom et adresse)');
      f.set('custom_fields[0][type]', 'text');
    }

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: f,
    });
    const session = await r.json();
    if (!r.ok) return repondre({ erreur: session.error?.message || 'Stripe a refusé la commande' }, 502);
    return repondre({ url: session.url });
  },
};
