// Adresse de base de l'API Tyradex (version 1)
const API_BASE = 'https://tyradex.app/api/v1';

/**
 * Récupère tous les Pokémon de la génération 1.
 * GET https://tyradex.app/api/v1/gen/1
 * @returns {Promise<Array>} la liste des Pokémon
 */
async function getPokemonsGeneration1() {
  const reponse = await fetch(`${API_BASE}/gen/1`);
  const donnees = await reponse.json();
  return donnees;
}
