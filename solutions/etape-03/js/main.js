// ---- État de l'application (les données en mémoire) ----
let pokemonsCharges = [];   // tous les Pokémon de la génération 1
let filtreNom = '';          // texte tapé dans la recherche
let filtreType = '';         // type sélectionné dans le <select>

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

  // Remplissage du filtre par type à partir des données reçues
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

  // Clic sur une carte -> fiche détaillée dans la modale
  document.querySelector('#liste-pokemon').addEventListener('click', async (event) => {
    const carte = event.target.closest('.carte');
    if (!carte) return;
    const fiche = await getPokemon(carte.dataset.pokedexId);
    const modale = document.querySelector('#modale');
    const conteneur = document.querySelector('#fiche-detail');
    conteneur.innerHTML = ''; // on vide l'ancienne fiche
    conteneur.appendChild(creerFicheDetaillee(fiche));
    modale.hidden = false;
  });

  // Fermeture de la modale
  document.querySelector('#fermer-modale').addEventListener('click', () => {
    document.querySelector('#modale').hidden = true;
  });
  document.querySelector('#modale').addEventListener('click', (event) => {
    if (event.target.id === 'modale') {
      event.target.hidden = true;
    }
  });

  afficherPokemons();
}

/**
 * (Re)dessine la liste des cartes en appliquant les filtres actuels.
 */
function afficherPokemons() {
  const conteneur = document.querySelector('#liste-pokemon');
  conteneur.innerHTML = ''; // on vide avant de redessiner

  const filtres = pokemonsCharges.filter((pokemon) => {
    const nomOk = pokemon.name.fr.toLowerCase().includes(filtreNom);
    const typeOk = filtreType === '' || pokemon.types.some((t) => t.name === filtreType);
    return nomOk && typeOk;
  });

  document.querySelector('#aucun-resultat').hidden = filtres.length > 0;

  for (const pokemon of filtres) {
    // On passe une fonction vide ici : le clic est géré par délégation (voir main)
    conteneur.appendChild(creerCartePokemon(pokemon, () => {}));
  }
}

main();
