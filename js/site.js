const h=document.getElementById('haut');
addEventListener('scroll',()=>h.classList.toggle('scrolled',scrollY>40),{passive:true});
const menu=document.getElementById('menu');
document.getElementById('burger').onclick=()=>menu.classList.toggle('ouvert');
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('ouvert'));
document.querySelectorAll('.onglets button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.onglets button').forEach(x=>x.classList.remove('actif'));
  document.querySelectorAll('.panneau').forEach(x=>x.classList.remove('actif'));
  b.classList.add('actif');document.getElementById(b.dataset.p).classList.add('actif');
});

// Comparateurs avant / après
document.querySelectorAll('[data-compare]').forEach(c=>{
  const apres=c.querySelector('.apres'), barre=c.querySelector('.barre'), poignee=c.querySelector('.poignee');
  const set=x=>{const r=c.getBoundingClientRect();let p=Math.min(1,Math.max(0,(x-r.left)/r.width));
    apres.style.clipPath=`inset(0 0 0 ${p*100}%)`;barre.style.left=poignee.style.left=(p*100)+'%';};
  let on=false;
  c.addEventListener('pointerdown',e=>{on=true;c.setPointerCapture(e.pointerId);set(e.clientX)});
  c.addEventListener('pointermove',e=>{if(on)set(e.clientX)});
  c.addEventListener('pointerup',()=>on=false);
  c.addEventListener('pointercancel',()=>on=false);
});
// Sélecteur de longueur
const TARIFS=[[10,150],[12,170],[14,190],[16,210],[18,230],[20,250],[22,350],[24,370],[26,390],[28,430],[30,470]];
const zone=document.getElementById('longueurs');
if(zone){
  TARIFS.forEach(([l,prix],i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=l+'″';
    if(i===0)b.classList.add('actif');
    b.onclick=()=>{
      zone.querySelectorAll('button').forEach(x=>x.classList.remove('actif'));b.classList.add('actif');
      document.getElementById('prix-val').textContent=prix+' €';
      bundle={l:l,prix:prix};
      document.getElementById('prix-info').textContent=`${l}″ · ${l}″ — lot de 2 bundles, double drawn`;
      document.getElementById('commander').href='https://wa.me/33661093864?text='+encodeURIComponent(`Bonjour Maison Reine K, je souhaite commander un lot de 2 bundles ${l}″ (${prix} €).`);
    };
    zone.appendChild(b);
  });
  document.getElementById('commander').href='https://wa.me/33661093864?text='+encodeURIComponent('Bonjour Maison Reine K, je souhaite commander un lot de 2 bundles 10″ (150 €).');
}

// ===== Panier =====
// Adresse de la caisse (Cloudflare Worker). Vide = mode démonstration, aucun paiement réel.
// Exemple : 'https://caisse-reine-k.MONCOMPTE.workers.dev'
const CAISSE_URL = '';
const WA = 'https://wa.me/33661093864';
const euro = n => n.toLocaleString('fr-FR') + ' €';
let panier = [];
try { panier = JSON.parse(localStorage.getItem('rk-panier') || '[]'); } catch(e) { panier = []; }
const sauver = () => { try { localStorage.setItem('rk-panier', JSON.stringify(panier)); } catch(e) {} };
const $ = id => document.getElementById(id);
// Livraison Colissimo : [jusqu'à 3 produits, au-delà de 3]. France : point retrait ou locker = 1 € de moins.
const LIVRAISON = {FR: [12, 17], UE: [20, 30], CH: [30, 40], ZC: [40, 50]};
const NOMS_ZONE = {FR: 'France', UE: 'Union européenne', CH: 'Suisse', ZC: 'États-Unis / Canada'};
let livraison = {zone: 'FR', mode: 'domicile'};
try { livraison = Object.assign(livraison, JSON.parse(localStorage.getItem('rk-livraison') || '{}')); } catch(e) {}
const fraisLivraison = nb => {
  const t = LIVRAISON[livraison.zone] || LIVRAISON.FR;
  return t[nb <= 3 ? 0 : 1] - (livraison.zone === 'FR' && livraison.mode === 'relais' ? 1 : 0);
};
const libelleLivraison = () => NOMS_ZONE[livraison.zone] + (livraison.zone === 'FR' ? (livraison.mode === 'relais' ? ', point retrait ou locker' : ', à domicile') : '');
const tiroir = $('tiroir'), voile = $('voile');
function ouvrirPanier(){ tiroir.classList.add('ouvert'); voile.classList.add('ouvert'); tiroir.setAttribute('aria-hidden','false'); }
function fermerPanier(){ tiroir.classList.remove('ouvert'); voile.classList.remove('ouvert'); tiroir.setAttribute('aria-hidden','true'); }
function ajouter(p){
  const ex = panier.find(x => x.id === p.id);
  if (ex) ex.q++; else panier.push({...p, q:1});
  sauver(); rendre();
  const b = $('ouvrir-panier'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
}
function rendre(){
  const nb = panier.reduce((a,x) => a + x.q, 0), total = panier.reduce((a,x) => a + x.q * x.prix, 0);
  $('nb-panier').textContent = nb; $('nb-panier').classList.toggle('plein', nb > 0);
  const m = $('nb-panier-m'); if (m) m.textContent = nb;
  $('total-panier').textContent = euro(total);
  const fl = fraisLivraison(nb);
  if ($('frais-livraison')) { $('frais-livraison').textContent = euro(fl); $('total-commande').textContent = euro(total + fl); }
  $('pied-panier').style.display = nb ? '' : 'none';
  const z = $('lignes');
  if (!nb) { z.innerHTML = '<div class="panier-vide"><p>Votre panier est vide.</p><a href="boutique.html" class="btn btn-sombre" data-fermer>Voir nos produits</a></div>'; return; }
  z.innerHTML = panier.map((x,i) => `<div class="ligne">
    ${x.img ? `<img src="${x.img}" alt="" class="${x.contenu ? 'contenu' : ''}">` : '<div class="sans-photo"></div>'}
    <div><h4>${x.nom}</h4><small>${x.v || ''}</small>
      <div class="qte"><button data-moins="${i}" aria-label="Moins">−</button><span>${x.q}</span><button data-plus="${i}" aria-label="Plus">+</button></div></div>
    <div class="droite"><b>${euro(x.prix * x.q)}</b><button class="suppr" data-suppr="${i}">Retirer</button></div>
  </div>`).join('');
  const txt = 'Bonjour Maison Reine K, je souhaite commander :\n' + panier.map(x => `• ${x.q} × ${x.nom}${x.v ? ' (' + x.v + ')' : ''} — ${euro(x.prix * x.q)}`).join('\n') + `\nLivraison (${libelleLivraison()}) : ${euro(fraisLivraison(nb))}\nTotal : ${euro(total + fraisLivraison(nb))}`;
  $('payer-wa').href = WA + '?text=' + encodeURIComponent(txt);
}
$('lignes').addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.plus !== undefined) panier[t.dataset.plus].q++;
  else if (t.dataset.moins !== undefined) { const x = panier[t.dataset.moins]; x.q--; if (x.q < 1) panier.splice(t.dataset.moins, 1); }
  else if (t.dataset.suppr !== undefined) panier.splice(t.dataset.suppr, 1);
  else if (t.dataset.fermer !== undefined) { fermerPanier(); return; }
  else return;
  sauver(); rendre();
});
$('ouvrir-panier').onclick = ouvrirPanier;
const om = $('ouvrir-panier-mobile'); if (om) om.onclick = e => { e.preventDefault(); ouvrirPanier(); };
$('fermer-panier').onclick = fermerPanier; voile.onclick = fermerPanier;
addEventListener('keydown', e => { if (e.key === 'Escape') fermerPanier(); });
document.querySelectorAll('[data-ajout]').forEach(b => b.onclick = () => {
  const d = b.dataset;
  ajouter({id:d.id, nom:d.nom, v:d.var, prix:+d.prix, img:d.img, contenu:!!d.contenu});
  const t = b.textContent; b.textContent = 'Ajouté ✓'; b.classList.add('ok');
  setTimeout(() => { b.textContent = t; b.classList.remove('ok'); }, 1300);
  ouvrirPanier();
});
// Bundle : la longueur vient du sélecteur
let bundle = {l:10, prix:150};
const ab = $('ajout-bundle');
if (ab) ab.onclick = () => { ajouter({id:'bundle-' + bundle.l, nom:'Mèches RAW · lot de 2 bundles', v:`${bundle.l}″ · ${bundle.l}″ double drawn`, prix:bundle.prix, img:'img/meches-raw.jpg'}); ouvrirPanier(); };
// Paiement
$('payer').onclick = () => {
  if (CAISSE_URL) { payerPourDeVrai(); return; }
  const total = panier.reduce((a,x) => a + x.q * x.prix, 0);
  $('pay-total').textContent = total.toLocaleString('fr-FR', {minimumFractionDigits:2}) + ' €';
  $('pay-items').innerHTML = panier.map(x => `<div class="pay-item"><span>${x.nom}<small>${x.v || ''} · Qté ${x.q}</small></span><span>${(x.prix * x.q).toLocaleString('fr-FR', {minimumFractionDigits:2})} €</span></div>`).join('');
  $('pay-form').style.display = ''; $('pay-merci').style.display = 'none';
  fermerPanier(); $('paiement').classList.add('ouvert'); scrollTo(0,0);
};
async function payerPourDeVrai(){
  const b = $('payer'), texte = b.innerHTML;
  b.disabled = true; b.textContent = 'Redirection vers le paiement…';
  try {
    // On n'envoie que les références et les quantités : les prix sont fixés par la caisse.
    const r = await fetch(CAISSE_URL, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({articles: panier.map(x => ({id:x.id, q:x.q})), zone: livraison.zone, mode: livraison.mode})});
    const d = await r.json();
    if (!r.ok || !d.url) throw new Error(d.erreur || 'Réponse inattendue');
    location.href = d.url;
  } catch(e) {
    b.disabled = false; b.innerHTML = texte;
    alert("Le paiement n'a pas pu démarrer. Réessayez ou commandez sur WhatsApp.\n(" + e.message + ")");
  }
}
// Retour depuis Stripe : ?commande=ok (payé) ou ?commande=annulee
const retour = new URLSearchParams(location.search).get('commande');
if (retour === 'ok') {
  panier = []; sauver();
  $('pay-form').style.display = 'none'; $('pay-merci').style.display = 'block';
  $('paiement').classList.add('ouvert');
  history.replaceState(null, '', location.pathname);
} else if (retour === 'annulee') {
  history.replaceState(null, '', location.pathname);
  setTimeout(ouvrirPanier, 400);
}
$('pay-retour').onclick = () => $('paiement').classList.remove('ouvert');
$('pay-ok').onclick = () => { $('pay-form').style.display = 'none'; $('pay-merci').style.display = 'block'; panier = []; sauver(); rendre(); };
$('pay-fin').onclick = () => $('paiement').classList.remove('ouvert');
rendre();
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('vu');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.rev').forEach(el=>io.observe(el));

// Sans caisse branchée, pas de paiement par carte (ni simulation) : commande WhatsApp uniquement.
if (!CAISSE_URL) { const pb = document.getElementById('payer'); if (pb) pb.style.display = 'none'; }
// Choix de la livraison dans le panier
(function(){
  const z = document.getElementById('zone-livraison'), m = document.getElementById('modes-fr');
  if (!z) return;
  const appliquer = () => {
    z.value = livraison.zone;
    m.style.display = livraison.zone === 'FR' ? '' : 'none';
    m.querySelectorAll('input').forEach(i => i.checked = i.value === livraison.mode);
    try { localStorage.setItem('rk-livraison', JSON.stringify(livraison)); } catch(e) {}
    rendre();
  };
  z.onchange = () => { livraison.zone = z.value; appliquer(); };
  m.querySelectorAll('input').forEach(i => i.onchange = () => { livraison.mode = i.value; appliquer(); });
  appliquer();
})();

// Fermetures : qualité et longueur, commande sur WhatsApp
(function(){
  const f = document.getElementById('fermeture'); if (!f) return;
  const etat = {q: 'RAW', l: '14″'};  // qualité unique : RAW
  const maj = () => {
    document.getElementById('fermeture-info').textContent = 'Fermeture ' + etat.q + ' · tulle HD · ' + etat.l;
    document.getElementById('fermeture-cmd').href = 'https://wa.me/33661093864?text=' + encodeURIComponent('Bonjour Maison Reine K, je souhaite commander une fermeture (closure) ' + etat.q + ', tulle HD, ' + etat.l + '. Quel est le prix ?');
  };
  f.querySelectorAll('[data-groupe]').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => {
    g.querySelectorAll('button').forEach(x => x.classList.remove('actif')); b.classList.add('actif');
    etat[g.dataset.groupe] = b.dataset.v; maj();
  }));
  maj();
})();
