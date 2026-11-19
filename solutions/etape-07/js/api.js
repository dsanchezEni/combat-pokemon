// Adresse de base de l'API Tyradex (version 1)
const API_BASE = 'https://tyradex.app/api/v1';

// Clé utilisée pour le cache dans localStorage
const CLE_CACHE = 'pokedex-gen1-v1';

/**
 * Récupère tous les Pokémon de la génération 1, avec mise en cache
 * dans localStorage (recommandé par la politique d'utilisation de Tyradex).
 * GET https://tyradex.app/api/v1/gen/1
 * @param {boolean} forcerRechargement true pour ignorer le cache
 * @returns {Promise<Array>} la liste des Pokémon
 */
export async function getPokemonsGeneration1(forcerRechargement = false) {
  if (!forcerRechargement) {
    const cache = localStorage.getItem(CLE_CACHE);
    if (cache) {
      console.log('Pokédex chargé depuis le cache localStorage');
      return JSON.parse(cache);
    }
  }

  const reponse = await fetch(`${API_BASE}/gen/1`);
  // fetch ne lève pas d'erreur sur un 404/500 : il faut vérifier reponse.ok
  if (!reponse.ok) {
    throw new Error(`Erreur HTTP ${reponse.status} en appelant l'API Tyradex`);
  }
  const donnees = await reponse.json();

  localStorage.setItem(CLE_CACHE, JSON.stringify(donnees));
  return donnees;
}

/**
 * Vide le cache localStorage (utilisé par le bouton « Recharger »).
 */
export function viderCache() {
  localStorage.removeItem(CLE_CACHE);
}

/**
 * Récupère la fiche détaillée d'un Pokémon.
 * GET https://tyradex.app/api/v1/pokemon/{id}
 * @param {number} id le numéro Pokédex du Pokémon
 * @returns {Promise<Object>} la fiche du Pokémon
 */
export async function getPokemon(id) {
  const reponse = await fetch(`${API_BASE}/pokemon/${id}`);
  if (!reponse.ok) {
    throw new Error(`Erreur HTTP ${reponse.status} pour le Pokémon n°${id}`);
  }
  return await reponse.json();
}
