import { fetchPokemonList, fetchPokemonDetails } from './services/api';
import { createPokemonCard } from './components/card';
import type { Pokemon } from './types/pokemon';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <h1><a href="/" style="color: inherit; text-decoration: none;">Pokédoums</a></h1>
    <div id="stats-banner">Chargement...</div>
  </header>
  <main>
    <div id="pokemon-grid" class="grid"></div>
    <button id="load-more" style="display: none;">Voir plus</button>
  </main>
`;

const grid = document.querySelector<HTMLDivElement>('#pokemon-grid')!;
const statsBanner = document.querySelector<HTMLDivElement>('#stats-banner')!;
const loadMoreBtn = document.querySelector<HTMLButtonElement>('#load-more')!;

let currentOffset = 0;
const LIMIT = 20;
const loadedPokemons = new Map<number, Pokemon>();

const loadPokemons = async () => {
  try {
    statsBanner.textContent = 'Chargement...';
    const list = await fetchPokemonList(LIMIT, currentOffset);

    const detailsPromises = list.results.map((p) => fetchPokemonDetails(p.url));
    const pokemons = await Promise.all(detailsPromises);

    pokemons.forEach((p) => loadedPokemons.set(p.id, p));

    const cardsHtml = pokemons.map((p) => createPokemonCard(p)).join('');
    grid.innerHTML += cardsHtml;

    statsBanner.textContent = `${loadedPokemons.size} Pokémon affichés`;
    loadMoreBtn.style.display = 'block';
  } catch {
    statsBanner.textContent = 'Erreur lors du chargement.';
  }
};

grid.addEventListener('click', (e) => {
  const card = (e.target as HTMLElement).closest('.pokemon-card') as HTMLElement;
  if (card) {
    const id = card.dataset.id;
    if (id) {
      window.location.href = `/pokemon.html?id=${id}`;
    }
  }
});

loadMoreBtn.addEventListener('click', () => {
  currentOffset += LIMIT;
  loadPokemons();
});

loadPokemons();
