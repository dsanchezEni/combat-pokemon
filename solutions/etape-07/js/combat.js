// ================= Moteur de combat (version orientée objet) =================

/**
 * Un Combattant du jeu : encapsule le Pokémon de l'API et ses PV restants.
 */
export class Combattant {
  /**
   * @param {Object} pokemon le Pokémon choisi (données Tyradex)
   */
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.pvMax = pokemon.stats.hp;
    this.pv = pokemon.stats.hp;
  }

  /** @returns {boolean} true si le combattant est encore debout */
  estEnVie() {
    return this.pv > 0;
  }

  /**
   * Multiplicateur de type : on consulte les résistances du défenseur.
   * @param {Combattant} defenseur
   * @returns {number}
   */
  multiplicateurTypeContre(defenseur) {
    const typeAttaque = this.pokemon.types[0].name;
    const resistance = (defenseur.pokemon.resistances ?? []).find(
      (r) => r.name === typeAttaque
    );
    return resistance ? resistance.multiplier : 1;
  }

  /**
   * Calcule les dégâts infligés à un défenseur (formule simplifiée) :
   *   dégâts = max(1, arrondi( (attaque / défense) * 10 * type * aléatoire ))
   * @param {Combattant} defenseur
   * @returns {number} les dégâts
   */
  calculerDegatsContre(defenseur) {
    const attaque = this.pokemon.stats.atk;
    const defense = defenseur.pokemon.stats.def || 1; // évite la division par 0
    const type = this.multiplicateurTypeContre(defenseur);
    const aleatoire = 0.85 + Math.random() * 0.15;
    return Math.max(1, Math.round((attaque / defense) * 10 * type * aleatoire));
  }

  /**
   * Attaque un défenseur : retire ses PV et retourne le message du journal.
   * @param {Combattant} defenseur
   * @returns {string} le message à afficher dans le journal
   */
  attaquer(defenseur) {
    const degats = this.calculerDegatsContre(defenseur);
    defenseur.pv = Math.max(0, defenseur.pv - degats);

    const type = this.multiplicateurTypeContre(defenseur);
    let message = `${this.pokemon.name.fr} attaque ${defenseur.pokemon.name.fr} et inflige ${degats} dégâts !`;
    if (type > 1) message += " C'est super efficace !";
    if (type < 1 && type > 0) message += " Ce n'est pas très efficace...";
    if (!defenseur.estEnVie()) message += ` ${defenseur.pokemon.name.fr} est K.O. !`;
    return message;
  }
}
