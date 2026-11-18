/**
 * Fabrique une carte (élément HTML) pour un Pokémon.
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
    <p class="categorie">${pokemon.categorie ?? ''}</p>
    <ul class="types">
      ${pokemon.types.map(t => `<li>${t.name}</li>`).join('')}
    </ul>
    <p>Taille : ${pokemon.height ?? '?'} — Poids : ${pokemon.weight ?? '?'}</p>
    <p>Talent : ${pokemon.talent ?? '?'}</p>
    <h3>Statistiques</h3>
    <ul class="stats">
      <li><span>PV</span><span>${pokemon.stats.hp}</span></li>
      <li><span>Attaque</span><span>${pokemon.stats.atk}</span></li>
      <li><span>Défense</span><span>${pokemon.stats.def}</span></li>
      <li><span>Vitesse</span><span>${pokemon.stats.vit}</span></li>
      <li><span>Attaque spéciale</span><span>${pokemon.stats.atkspe}</span></li>
      <li><span>Défense spéciale</span><span>${pokemon.stats.defspe}</span></li>
    </ul>
  `;
  return fiche;
}

/**
 * Affiche un Pokémon dans un slot de la sélection.
 */
function remplirSlot(slot, pokemon) {
  slot.innerHTML = '';
  const titre = document.createElement('h3');
  titre.textContent = slot.id === 'slot-joueur' ? 'Votre Pokémon' : 'Adversaire';
  slot.appendChild(titre);

  if (!pokemon) {
    slot.classList.remove('rempli');
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

/**
 * Construit l'affichage d'un combattant dans l'arène de combat
 * (image + nom + barre de PV).
 * @param {HTMLElement} slot élément #combat-joueur ou #combat-adversaire
 * @param {Object} combattant objet créé par creerCombattant()
 */
function remplirCombattant(slot, combattant) {
  slot.innerHTML = '';
  slot.classList.add('rempli');

  const nom = document.createElement('h3');
  nom.textContent = combattant.pokemon.name.fr;
  slot.appendChild(nom);

  const image = document.createElement('img');
  image.src = combattant.pokemon.sprites.regular;
  image.alt = `Sprite de ${combattant.pokemon.name.fr}`;
  slot.appendChild(image);

  // Barre de PV : un conteneur + un remplissage dont on anime la largeur
  const barre = document.createElement('div');
  barre.classList.add('barre-pv');
  const remplissage = document.createElement('div');
  remplissage.classList.add('barre-remplissage');
  barre.appendChild(remplissage);
  slot.appendChild(barre);

  const textePv = document.createElement('p');
  textePv.classList.add('texte-pv');
  slot.appendChild(textePv);

  mettreAJourPv(slot, combattant);
}

/**
 * Met à jour la barre de PV et le texte d'un combattant.
 * La couleur change selon les PV restants.
 */
function mettreAJourPv(slot, combattant) {
  const pourcentage = (combattant.pv / combattant.pvMax) * 100;
  const remplissage = slot.querySelector('.barre-remplissage');
  remplissage.style.width = `${pourcentage}%`;

  remplissage.classList.remove('pv-haut', 'pv-moyen', 'pv-bas');
  if (pourcentage > 50) remplissage.classList.add('pv-haut');
  else if (pourcentage > 25) remplissage.classList.add('pv-moyen');
  else remplissage.classList.add('pv-bas');

  slot.querySelector('.texte-pv').textContent =
    `PV : ${combattant.pv} / ${combattant.pvMax}`;
}
