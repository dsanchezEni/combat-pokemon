/**
 * Fabrique une carte (élément HTML) pour un Pokémon.
 * @param {Object} pokemon un Pokémon renvoyé par l'API
 * @param {Function} onClic callback appelé quand on clique sur la carte
 * @returns {HTMLElement} la carte prête à être ajoutée au DOM
 */
function creerCartePokemon(pokemon, onClic) {
  const carte = document.createElement('article');
  carte.classList.add('carte');

  const image = document.createElement('img');
  image.src = pokemon.sprites.regular;
  image.alt = `Sprite de ${pokemon.name.fr}`;
  carte.appendChild(image);

  const numero = document.createElement('p');
  numero.classList.add('numero');
  numero.textContent = `N°${pokemon.pokedex_id}`;
  carte.appendChild(numero);

  const nom = document.createElement('h3');
  nom.classList.add('nom');
  nom.textContent = pokemon.name.fr;
  carte.appendChild(nom);

  const listeTypes = document.createElement('ul');
  listeTypes.classList.add('types');
  for (const type of pokemon.types) {
    const li = document.createElement('li');
    li.textContent = type.name;
    listeTypes.appendChild(li);
  }
  carte.appendChild(listeTypes);

  // On stocke l'identifiant du Pokémon sur la carte elle-même
  carte.dataset.pokedexId = pokemon.pokedex_id;

  // Événement clic : on délègue au callback fourni par main.js
  carte.addEventListener('click', () => onClic(pokemon));

  return carte;
}

/**
 * Remplit le <select> des types à partir des Pokémon déjà chargés
 * (on dédoublonne avec un Set).
 * @param {HTMLSelectElement} select l'élément <select> à remplir
 * @param {Array} pokemons la liste complète des Pokémon
 */
function remplirSelectTypes(select, pokemons) {
  const types = new Set();
  for (const pokemon of pokemons) {
    for (const type of pokemon.types) {
      types.add(type.name);
    }
  }
  // Tri alphabétique pour un affichage propre
  for (const nomType of [...types].sort()) {
    const option = document.createElement('option');
    option.value = nomType;
    option.textContent = nomType;
    select.appendChild(option);
  }
}

/**
 * Construit le contenu HTML de la fiche détaillée d'un Pokémon.
 * @param {Object} pokemon la fiche complète (endpoint /pokemon/{id})
 * @returns {HTMLElement}
 */
function creerFicheDetaillee(pokemon) {
  const fiche = document.createElement('div');
  fiche.classList.add('fiche');

  // On construit le HTML avec un template literal (chaîne multi-lignes)
  fiche.innerHTML = `
    <h2>N°${pokemon.pokedex_id} ${pokemon.name.fr}</h2>
    <img src="${pokemon.sprites.regular}" alt="Sprite de ${pokemon.name.fr}">
    <p class="categorie">${pokemon.category ?? ''}</p>
    <ul class="types">
      ${pokemon.types.map(t => `<li>${t.name}</li>`).join('')}
    </ul>
    <p>Taille : ${pokemon.height ?? '?'} — Poids : ${pokemon.weight ?? '?'}</p>
    <p>Talents : ${(pokemon.talents ?? []).map(t => t.name).join(', ')}</p>
    <h3>Statistiques</h3>
    <ul class="stats">
      <li><span>PV</span><span>${pokemon.stats.hp}</span></li>
      <li><span>Attaque</span><span>${pokemon.stats.atk}</span></li>
      <li><span>Défense</span><span>${pokemon.stats.def}</span></li>
      <li><span>Vitesse</span><span>${pokemon.stats.vit}</span></li>
      <li><span>Attaque spéciale</span><span>${pokemon.stats.spe_atk}</span></li>
      <li><span>Défense spéciale</span><span>${pokemon.stats.spe_def}</span></li>
    </ul>
  `;
  return fiche;
}
