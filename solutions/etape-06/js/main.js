// ---- État de l'application ----
let pokemonsCharges = [];
let filtreNom = '';
let filtreType = '';
const combattants = { joueur: null, adversaire: null };

// État du combat en cours
let combat = null; // { joueur, adversaire, termine }

// ---- Point d'entrée ----
async function main() {
  const chargement = document.querySelector('#chargement');

  try {
    pokemonsCharges = await getPokemonsGeneration1();
    chargement.textContent = `${pokemonsCharges.length} Pokémon chargés !`;
  } catch (erreur) {
    chargement.textContent = "Impossible de charger les Pokémon. Vérifiez votre connexion.";
    console.error(erreur);
    return;
  }

  remplirSelectTypes(document.querySelector('#filtre-type'), pokemonsCharges);

  // ---- Événements ----
  document.querySelector('#recherche').addEventListener('input', (event) => {
    filtreNom = event.target.value.toLowerCase();
    afficherPokemons();
  });

  document.querySelector('#filtre-type').addEventListener('change', (event) => {
    filtreType = event.target.value;
    afficherPokemons();
  });

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

  document.querySelector('#bouton-combat').addEventListener('click', lancerCombat);
  document.querySelector('#bouton-attaquer').addEventListener('click', tourDuJoueur);
  document.querySelector('#bouton-rejouer').addEventListener('click', rejouer);
  document.querySelector('#bouton-changer').addEventListener('click', changerDePokemon);

  afficherPokemons();
  afficherArene();
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
    joueur: creerCombattant(combattants.joueur),
    adversaire: creerCombattant(combattants.adversaire),
    termine: false,
  };

  // On remet à zéro l'affichage du combat précédent
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

/**
 * Un tour de jeu : le joueur attaque, puis l'adversaire riposte
 * automatiquement après un court délai.
 */
function tourDuJoueur() {
  if (!combat || combat.termine) return;

  const bouton = document.querySelector('#bouton-attaquer');
  bouton.disabled = true;

  // Le joueur attaque
  const messageJoueur = attaquer(combat.joueur, combat.adversaire);
  ajouterJournal(messageJoueur);
  animerTouche(document.querySelector('#combat-adversaire'));
  mettreAJourPv(document.querySelector('#combat-adversaire'), combat.adversaire);

  if (verifierFin()) return;

  // L'adversaire riposte après 800 ms
  setTimeout(() => {
    if (combat.termine) return;
    const messageAdversaire = attaquer(combat.adversaire, combat.joueur);
    ajouterJournal(messageAdversaire);
    animerTouche(document.querySelector('#combat-joueur'));
    mettreAJourPv(document.querySelector('#combat-joueur'), combat.joueur);

    if (!verifierFin()) {
      bouton.disabled = false; // au joueur de rejouer
    }
  }, 800);
}

/**
 * Vérifie si un combattant est K.O. et termine le combat si besoin.
 * @returns {boolean} true si le combat est terminé
 */
function verifierFin() {
  if (combat.adversaire.pv <= 0) {
    combat.termine = true;
    afficherFin(`Victoire ! ${combat.joueur.pokemon.name.fr} a battu ${combat.adversaire.pokemon.name.fr} !`);
    return true;
  }
  if (combat.joueur.pv <= 0) {
    combat.termine = true;
    afficherFin(`Défaite... ${combat.adversaire.pokemon.name.fr} a battu ${combat.joueur.pokemon.name.fr}.`);
    return true;
  }
  return false;
}

/**
 * Relance un combat avec les mêmes Pokémon (PV remis à fond).
 */
function rejouer() {
  lancerCombat();
}

/**
 * Retourne à l'écran de sélection des combattants.
 */
function changerDePokemon() {
  combat = null;
  combattants.joueur = null;
  combattants.adversaire = null;
  document.querySelector('#combat').hidden = true;
  afficherArene();
  document.querySelector('#arene').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Petite animation quand un Pokémon est touché.
 */
function animerTouche(slot) {
  slot.classList.remove('touche');
  // void slot.offsetWidth force le navigateur à recalculer -> l'animation repart
  void slot.offsetWidth;
  slot.classList.add('touche');
}

main();
