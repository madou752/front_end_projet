import type { Pokemon, PokemonListResponse, PokemonSpecies, EvolutionChain } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit: number = 20, offset: number = 0): Promise<PokemonListResponse> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Erreur API');
  return (await response.json()) as PokemonListResponse;
};

export const fetchPokemonDetails = async (url: string): Promise<Pokemon> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur API');
  return (await response.json()) as Pokemon;
};

export const fetchSpecies = async (url: string): Promise<PokemonSpecies> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur API');
  return (await response.json()) as PokemonSpecies;
};

export const fetchEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur API');
  return (await response.json()) as EvolutionChain;
};