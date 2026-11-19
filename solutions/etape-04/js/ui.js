/**
 * Fabrique une carte (élément HTML) pour un Pokémon.
 * @param {Object} pokemon un Pokémon renvoyé par l'API
 * @param {Function} onClicCarte appelé au clic sur la carte (fiche détaillée)
 * @param {Function} onClicChoisir appelé au clic sur le bouton « Choisir »
 * @returns {HTMLElement} la carte prête à être ajoutée au DOM
 */
function creerCartePokemon(pokemon, onClicCarte, onClicChoisir) {
  const carte = document.createElement('article');
  carte.classList.add('carte');
  carte.dataset.pokedexId = pokemon.pokedex_id;

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

  // Bouton « Choisir » : stopPropagation pour ne PAS ouvrir la fiche
  const bouton = document.createElement('button');
  bouton.textContent = 'Choisir';
  bouton.addEventListener('click', (event) => {
    event.stopPropagation();
    onClicChoisir(pokemon);
  });
  carte.appendChild(bouton);

  carte.addEventListener('click', () => onClicCarte(pokemon));

  return carte;
}

/**
 * Remplit le <select> des types à partir des Pokémon déjà chargés.
 */
function remplirSelectTypes(select, pokemons) {
  const types = new Set();
  for (const pokemon of pokemons) {
    for (const type of pokemon.types) {
      types.add(type.name);
    }
  }
  for (const nomType of [...types].sort()) {
    const option = document.createElement('option');
    option.value = nomType;
    option.textContent = nomType;
    select.appendChild(option);
  }
}

/**
 * Construit le contenu HTML de la fiche détaillée d'un Pokémon.
 */
function creerFicheDetaillee(pokemon) {
  const fiche = document.createElement('div');
  fiche.classList.add('fiche');
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

/**
 * Affiche un Pokémon dans un slot de l'arène (ou un placeholder).
 * @param {HTMLElement} slot l'élément #slot-joueur ou #slot-adversaire
 * @param {Object|null} pokemon le Pokémon choisi, ou null
 */
function remplirSlot(slot, pokemon) {
  slot.innerHTML = '';
  const titre = document.createElement('h3');
  slot.appendChild(titre);

  if (!pokemon) {
    slot.classList.remove('rempli');
    titre.textContent = slot.id === 'slot-joueur' ? 'Votre Pokémon' : 'Adversaire';
    const vide = document.createElement('p');
    vide.classList.add('vide');
    vide.textContent = 'Aucun Pokémon choisi';
    slot.appendChild(vide);
    return;
  }

  slot.classList.add('rempli');
  titre.textContent = pokemon.name.fr;
  const image = document.createElement('img');
  image.src = pokemon.sprites.regular;
  image.alt = `Sprite de ${pokemon.name.fr}`;
  slot.appendChild(image);
}
