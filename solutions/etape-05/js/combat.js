// ================= Moteur de combat =================

/**
 * Crée l'état d'un combattant à partir d'un Pokémon de l'API.
 * @param {Object} pokemon le Pokémon choisi
 * @returns {{pokemon: Object, pv: number, pvMax: number}}
 */
function creerCombattant(pokemon) {
  return {
    pokemon,
    pv: pokemon.stats.hp,      // les PV de départ = la stat "hp"
    pvMax: pokemon.stats.hp,
  };
}

/**
 * Retourne le multiplicateur de type de l'attaque :
 * on regarde dans les résistances du défenseur si le type de l'attaquant
 * y figure (ex : Électrik contre Eau -> multiplier 2).
 * @returns {number} 0.25, 0.5, 1 ou 2 (voire plus)
 */
function multiplicateurType(attaquant, defenseur) {
  const typeAttaque = attaquant.pokemon.types[0].name;
  const resistance = (defenseur.pokemon.resistances ?? []).find(
    (r) => r.name === typeAttaque
  );
  return resistance ? resistance.multiplier : 1;
}

/**
 * Calcule les dégâts d'une attaque (formule simplifiée pour le jeu) :
 *   dégâts = max(1, arrondi( (attaque / défense) * 10 * type * aléatoire ))
 * Le facteur aléatoire varie entre 0.85 et 1.
 */
function calculerDegats(attaquant, defenseur) {
  const attaque = attaquant.pokemon.stats.atk;
  const defense = defenseur.pokemon.stats.def || 1; // évite la division par 0
  const type = multiplicateurType(attaquant, defenseur);
  const aleatoire = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.round((attaque / defense) * 10 * type * aleatoire));
}

/**
 * Applique une attaque : retire les PV et retourne un message.
 */
function attaquer(attaquant, defenseur) {
  const degats = calculerDegats(attaquant, defenseur);
  defenseur.pv = Math.max(0, defenseur.pv - degats);

  const type = multiplicateurType(attaquant, defenseur);
  let message = `${attaquant.pokemon.name.fr} attaque ${defenseur.pokemon.name.fr} et inflige ${degats} dégâts !`;
  if (type > 1) message += ' C\'est super efficace !';
  if (type < 1 && type > 0) message += ' Ce n\'est pas très efficace...';
  if (defenseur.pv === 0) message += ` ${defenseur.pokemon.name.fr} est K.O. !`;
  return message;
}
