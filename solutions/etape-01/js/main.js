// Point d'entrée : s'exécute quand la page est chargée
async function main() {
  // 1. On récupère les éléments HTML dans lesquels on va écrire
  const chargement = document.querySelector('#chargement');
  const liste = document.querySelector('#liste-pokemon');

  try {
    // 2. On appelle l'API (getPokemonsGeneration1 est définie dans api.js)
    const pokemons = await getPokemonsGeneration1();

    // 3. On met à jour la page
    chargement.textContent = `${pokemons.length} Pokémon chargés !`;

    // 4. Pour chaque Pokémon, on crée un <li> dans la liste
    for (const pokemon of pokemons) {
      const li = document.createElement('li');
      li.textContent = `#${pokemon.pokedex_id} - ${pokemon.name.fr}`;
      liste.appendChild(li);
    }
  } catch (erreur) {
    // Si l'API ne répond pas (offline, erreur réseau...)
    chargement.textContent = "Impossible de charger les Pokémon. Vérifiez votre connexion.";
    console.error(erreur);
  }
}

main();
