import type { Pokemon } from '../types/pokemon';
import { typeColors } from '../utils/colors';

export const createPokemonCard = (pokemon: Pokemon, isFavorite: boolean = false): string => {
  const type1 = pokemon.types[0].type.name;
  const type2 = pokemon.types[1]?.type.name;

  const color1 = typeColors[type1] || '#777';
  const color2 = type2 ? typeColors[type2] : color1;

  const background = type2 ? `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)` : color1;
  const heartClass = isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  const favLabel = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';

  return `
    <div class="pokemon-card" style="background: ${background};" data-id="${pokemon.id}" tabindex="0" role="button" aria-label="Voir les détails de ${pokemon.name}">
      <div class="card-header">
        <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
        <h2 class="pokemon-name">${pokemon.name}</h2>
        <button class="fav-btn" aria-label="${favLabel}" tabindex="0"><i class="${heartClass}"></i></button>
      </div>
      <div class="card-image-container">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon-image" loading="lazy" />
      </div>
      <div class="card-types">
        <span class="type-badge" style="background-color: ${color1}; filter: brightness(0.8);">${type1}</span>
        ${type2 ? `<span class="type-badge" style="background-color: ${color2}; filter: brightness(0.8);">${type2}</span>` : ''}
      </div>
    </div>
  `;
};
