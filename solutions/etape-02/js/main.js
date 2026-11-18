// Point d'entrée : s'exécute quand la page est chargée
async function main() {
  const chargement = document.querySelector('#chargement');
  const conteneur = document.querySelector('#liste-pokemon');

  try {
    const pokemons = await getPokemonsGeneration1();
    chargement.textContent = `${pokemons.length} Pokémon chargés !`;

    for (const pokemon of pokemons) {
      conteneur.appendChild(creerCartePokemon(pokemon));
    }
  } catch (erreur) {
    chargement.textContent = "Impossible de charger les Pokémon. Vérifiez votre connexion.";
    console.error(erreur);
  }
}

/**
 * Fabrique une carte (élément HTML) pour un Pokémon.
 * @param {Object} pokemon un Pokémon renvoyé par l'API
 * @returns {HTMLElement} la carte prête à être ajoutée au DOM
 */
function creerCartePokemon(pokemon) {
  // Carte racine
  const carte = document.createElement('article');
  carte.classList.add('carte');

  // Image du Pokémon (sprite "regular" fourni par l'API)
  const image = document.createElement('img');
  image.src = pokemon.sprites.regular;
  image.alt = `Sprite de ${pokemon.name.fr}`;
  carte.appendChild(image);

  // Numéro dans le Pokédex
  const numero = document.createElement('p');
  numero.classList.add('numero');
  numero.textContent = `N°${pokemon.pokedex_id}`;
  carte.appendChild(numero);

  // Nom français
  const nom = document.createElement('h3');
  nom.classList.add('nom');
  nom.textContent = pokemon.name.fr;
  carte.appendChild(nom);

  // Liste des types (un Pokémon peut en avoir 1 ou 2)
  const listeTypes = document.createElement('ul');
  listeTypes.classList.add('types');
  for (const type of pokemon.types) {
    const li = document.createElement('li');
    li.textContent = type.name;
    listeTypes.appendChild(li);
  }
  carte.appendChild(listeTypes);

  return carte;
}

main();
