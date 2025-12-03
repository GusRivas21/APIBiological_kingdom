export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Endpoints de la API
export const apiEndpoints = {
  kingdom: `${API_URL}/api/kingdom`,
  taxonomy: `${API_URL}/api/taxonomy`,
  habitat: `${API_URL}/api/habitat`,
  specie: `${API_URL}/api/specie`,
  humanRisk: `${API_URL}/api/human_risk`,
};

// Helper para hacer peticiones GET
export const fetchFromAPI = async (endpoint: string) => {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Error al obtener los datos: ${response.status}`);
  }
  return response.json();
};