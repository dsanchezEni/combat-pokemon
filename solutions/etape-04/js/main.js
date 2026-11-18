// ---- État de l'application ----
let pokemonsCharges = [];        // tous les Pokémon de la génération 1
let filtreNom = '';
let filtreType = '';
const combattants = { joueur: null, adversaire: null };

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
    if (!carte) return;
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

  document.querySelector('#bouton-combat').addEventListener('click', () => {
    // Le vrai moteur de combat arrive à l'étape 5
    alert(`Le combat ${combattants.joueur.name.fr} vs ${combattants.adversaire.name.fr} arrive à l'étape 5 !`);
  });

  afficherPokemons();
  afficherArene();
}

/**
 * (Re)dessine la liste des cartes en appliquant les filtres actuels.
 */
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
      creerCartePokemon(
        pokemon,
        () => {},          // clic carte : géré par délégation ci-dessus
        choisirPokemon     // clic sur « Choisir »
      )
    );
  }
}

/**
 * Gère le choix d'un combattant :
 * 1er choix = le joueur, 2e choix = l'adversaire.
 */
function choisirPokemon(pokemon) {
  if (!combattants.joueur) {
    combattants.joueur = pokemon;
  } else if (!combattants.adversaire) {
    combattants.adversaire = pokemon;
  } else {
    // Les deux slots sont pleins : on remplace le joueur
    combattants.joueur = pokemon;
  }
  afficherArene();
}

/**
 * Met à jour l'affichage de l'arène et l'état du bouton de combat.
 */
function afficherArene() {
  const arene = document.querySelector('#arene');
  arene.hidden = false;

  remplirSlot(document.querySelector('#slot-joueur'), combattants.joueur);
  remplirSlot(document.querySelector('#slot-adversaire'), combattants.adversaire);

  const bouton = document.querySelector('#bouton-combat');
  bouton.disabled = !(combattants.joueur && combattants.adversaire);
}

main();
