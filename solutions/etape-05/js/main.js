// ---- État de l'application ----
let pokemonsCharges = [];
let filtreNom = '';
let filtreType = '';
const combattants = { joueur: null, adversaire: null };

// État du combat en cours
let combat = null; // { joueur: {...}, adversaire: {...}, termine: false }

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

  document.querySelector('#combat').hidden = false;
  remplirCombattant(document.querySelector('#combat-joueur'), combat.joueur);
  remplirCombattant(document.querySelector('#combat-adversaire'), combat.adversaire);
  document.querySelector('#combat').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Un tour de jeu : le joueur attaque, puis l'adversaire riposte
 * automatiquement après un court délai (setTimeout).
 */
function tourDuJoueur() {
  if (!combat || combat.termine) return;

  const bouton = document.querySelector('#bouton-attaquer');
  bouton.disabled = true;

  // Le joueur attaque
  attaquer(combat.joueur, combat.adversaire);
  mettreAJourPv(document.querySelector('#combat-adversaire'), combat.adversaire);

  if (combat.adversaire.pv <= 0) {
    combat.termine = true;
    bouton.textContent = 'Combat terminé';
    return;
  }

  // L'adversaire riposte après 800 ms
  setTimeout(() => {
    if (combat.termine) return;
    attaquer(combat.adversaire, combat.joueur);
    mettreAJourPv(document.querySelector('#combat-joueur'), combat.joueur);

    if (combat.joueur.pv <= 0) {
      combat.termine = true;
      bouton.textContent = 'Combat terminé';
    } else {
      bouton.disabled = false; // au joueur de rejouer
    }
  }, 800);
}

main();
