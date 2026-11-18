// Module principal : importe les autres modules ES6
import { getPokemonsGeneration1, getPokemon, viderCache } from './api.js';
import {
  creerCartePokemon, remplirSelectTypes, creerFicheDetaillee,
  remplirSlot, remplirCombattant, mettreAJourPv, ajouterJournal, afficherFin,
} from './ui.js';
import { Combattant } from './combat.js';

// ---- État de l'application ----
let pokemonsCharges = [];
let filtreNom = '';
let filtreType = '';
const combattants = { joueur: null, adversaire: null };
let combat = null; // { joueur: Combattant, adversaire: Combattant, termine }

// ---- Point d'entrée ----
async function main() {
  await chargerPokemons();

  remplirSelectTypes(document.querySelector('#filtre-type'), pokemonsCharges);
  afficherPokemons();
  afficherArene();
  installerEvenements();
}

/**
 * Charge la liste des Pokémon (avec gestion d'erreur + bouton « Réessayer »).
 */
async function chargerPokemons(forcerRechargement = false) {
  const chargement = document.querySelector('#chargement');
  const zoneErreur = document.querySelector('#erreur');

  chargement.hidden = false;
  zoneErreur.hidden = true;
  chargement.textContent = 'Chargement des Pokémon en cours...';

  try {
    pokemonsCharges = await getPokemonsGeneration1(forcerRechargement);
    chargement.textContent = `${pokemonsCharges.length} Pokémon chargés !`;
  } catch (erreur) {
    chargement.textContent = '';
    document.querySelector('#message-erreur').textContent =
      "Impossible de charger les Pokémon. Vérifiez votre connexion.";
    zoneErreur.hidden = false;
    console.error(erreur);
  }
}

/**
 * Installe tous les écouteurs d'événements de la page.
 */
function installerEvenements() {
  // Recherche avec debounce : on attend 250 ms après la dernière frappe
  let minuteur = null;
  document.querySelector('#recherche').addEventListener('input', (event) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      filtreNom = event.target.value.toLowerCase();
      afficherPokemons();
    }, 250);
  });

  document.querySelector('#filtre-type').addEventListener('change', (event) => {
    filtreType = event.target.value;
    afficherPokemons();
  });

  // Délégation d'événements sur la liste des cartes
  document.querySelector('#liste-pokemon').addEventListener('click', async (event) => {
    const carte = event.target.closest('.carte');
    if (!carte || event.target.closest('button')) return;
    const fiche = await getPokemon(carte.dataset.pokedexId);
    const modale = document.querySelector('#modale');
    const conteneur = document.querySelector('#fiche-detail');
    conteneur.innerHTML = '';
    conteneur.appendChild(creerFicheDetaillee(fiche));
    modale.hidden = false;
  });

  document.querySelector('#fermer-modale').addEventListener('click', () => {
    document.querySelector('#modale').hidden = true;
  });
  document.querySelector('#modale').addEventListener('click', (event) => {
    if (event.target.id === 'modale') event.target.hidden = true;
  });

  document.querySelector('#bouton-recharger').addEventListener('click', async () => {
    viderCache();
    await chargerPokemons(true);
    remplirSelectTypes(document.querySelector('#filtre-type'), pokemonsCharges);
    afficherPokemons();
  });

  document.querySelector('#bouton-reessayer').addEventListener('click', () => chargerPokemons(true));

  document.querySelector('#bouton-combat').addEventListener('click', lancerCombat);
  document.querySelector('#bouton-attaquer').addEventListener('click', tourDuJoueur);
  document.querySelector('#bouton-rejouer').addEventListener('click', lancerCombat);
  document.querySelector('#bouton-changer').addEventListener('click', changerDePokemon);
}

function afficherPokemons() {
  const conteneur = document.querySelector('#liste-pokemon');
  conteneur.innerHTML = '';

  const filtres = pokemonsCharges.filter((pokemon) => {
    const nomOk = pokemon.name.fr.toLowerCase().includes(filtreNom);
    const typeOk = filtreType === '' || pokemon.types.some((t) => t.name === filtreType);
    return nomOk && typeOk;
  });

  document.querySelector('#aucun-resultat').hidden = filtres.length > 0;

  for (const pokemon of filtres) {
    conteneur.appendChild(
      creerCartePokemon(pokemon, () => {}, choisirPokemon)
    );
  }
}

function choisirPokemon(pokemon) {
  if (!combattants.joueur) combattants.joueur = pokemon;
  else if (!combattants.adversaire) combattants.adversaire = pokemon;
  else combattants.joueur = pokemon;
  afficherArene();
}

function afficherArene() {
  document.querySelector('#arene').hidden = false;
  remplirSlot(document.querySelector('#slot-joueur'), combattants.joueur);
  remplirSlot(document.querySelector('#slot-adversaire'), combattants.adversaire);
  document.querySelector('#bouton-combat').disabled =
    !(combattants.joueur && combattants.adversaire);
}

// ---- Combat ----

function lancerCombat() {
  combat = {
    joueur: new Combattant(combattants.joueur),
    adversaire: new Combattant(combattants.adversaire),
    termine: false,
  };

  document.querySelector('#journal').innerHTML = '';
  document.querySelector('#fin-combat').hidden = true;
  const bouton = document.querySelector('#bouton-attaquer');
  bouton.disabled = false;
  bouton.textContent = 'Attaquer !';

  document.querySelector('#combat').hidden = false;
  remplirCombattant(document.querySelector('#combat-joueur'), combat.joueur);
  remplirCombattant(document.querySelector('#combat-adversaire'), combat.adversaire);

  ajouterJournal(`Le combat commence : ${combat.joueur.pokemon.name.fr} contre ${combat.adversaire.pokemon.name.fr} !`);
  document.querySelector('#combat').scrollIntoView({ behavior: 'smooth' });
}

function tourDuJoueur() {
  if (!combat || combat.termine) return;

  const bouton = document.querySelector('#bouton-attaquer');
  bouton.disabled = true;

  const messageJoueur = combat.joueur.attaquer(combat.adversaire);
  ajouterJournal(messageJoueur);
  animerTouche(document.querySelector('#combat-adversaire'));
  mettreAJourPv(document.querySelector('#combat-adversaire'), combat.adversaire);

  if (verifierFin()) return;

  setTimeout(() => {
    if (combat.termine) return;
    const messageAdversaire = combat.adversaire.attaquer(combat.joueur);
    ajouterJournal(messageAdversaire);
    animerTouche(document.querySelector('#combat-joueur'));
    mettreAJourPv(document.querySelector('#combat-joueur'), combat.joueur);

    if (!verifierFin()) {
      bouton.disabled = false;
    }
  }, 800);
}

function verifierFin() {
  if (!combat.adversaire.estEnVie()) {
    combat.termine = true;
    afficherFin(`Victoire ! ${combat.joueur.pokemon.name.fr} a battu ${combat.adversaire.pokemon.name.fr} !`);
    return true;
  }
  if (!combat.joueur.estEnVie()) {
    combat.termine = true;
    afficherFin(`Défaite... ${combat.adversaire.pokemon.name.fr} a battu ${combat.joueur.pokemon.name.fr}.`);
    return true;
  }
  return false;
}

function changerDePokemon() {
  combat = null;
  combattants.joueur = null;
  combattants.adversaire = null;
  document.querySelector('#combat').hidden = true;
  afficherArene();
  document.querySelector('#arene').scrollIntoView({ behavior: 'smooth' });
}

function animerTouche(slot) {
  slot.classList.remove('touche');
  void slot.offsetWidth; // force le recalcul pour relancer l'animation CSS
  slot.classList.add('touche');
}

main();
