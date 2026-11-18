// Adresse de base de l'API Tyradex (version 1)
const API_BASE = 'https://tyradex.app/api/v1';

/**
 * Récupère tous les Pokémon de la génération 1.
 * GET https://tyradex.app/api/v1/gen/1/pokemon
 * @returns {Promise<Array>} la liste des Pokémon
 */
async function getPokemonsGeneration1() {
  const reponse = await fetch(`${API_BASE}/gen/1/pokemon`);
  const donnees = await reponse.json();
  return donnees;
}

/**
 * Récupère la fiche détaillée d'un Pokémon (stats, talents, résistances...).
 * GET https://tyradex.app/api/v1/pokemon/{id}
 * @param {number} id le numéro Pokédex du Pokémon
 * @returns {Promise<Object>} la fiche du Pokémon
 */
async function getPokemon(id) {
  const reponse = await fetch(`${API_BASE}/pokemon/${id}`);
  const donnees = await reponse.json();
  return donnees;
}
