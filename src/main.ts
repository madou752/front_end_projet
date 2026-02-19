import { fetchPokemonList, fetchPokemonDetails } from './services/api';
import { createPokemonCard } from './components/card';
import type { Pokemon } from './types/pokemon';
import './style.css';

const getFavorites = (): number[] => {
  const saved = localStorage.getItem('pokemon_favorites');
  return saved ? JSON.parse(saved) : [];
};

const saveFavorites = (favorites: number[]) => {
  localStorage.setItem('pokemon_favorites', JSON.stringify(favorites));
};

let currentOffset = 0;
const LIMIT = 20;
const loadedPokemons = new Map<number, Pokemon>();
let favoriteIds: number[] = getFavorites();
let showOnlyFavorites = false;
let currentSort = 'id-asc';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <h1><a href="/" style="color: inherit; text-decoration: none;">Pokédoums</a></h1>
    <div class="controls">
      <button id="toggle-favs">Voir Favoris (<span>${favoriteIds.length}</span>)</button>
      <select id="sort-select">
        <option value="id-asc">Numéro Croissant</option>
        <option value="id-desc">Numéro Décroissant</option>
        <option value="name-asc">Nom (A-Z)</option>
        <option value="name-desc">Nom (Z-A)</option>
      </select>
    </div>
    <div id="stats-banner"></div>
  </header>
  <main>
    <div id="pokemon-grid" class="grid"></div>
    <button id="load-more" style="display: none;">Voir plus</button>
  </main>
`;

const grid = document.querySelector<HTMLDivElement>('#pokemon-grid')!;
const statsBanner = document.querySelector<HTMLDivElement>('#stats-banner')!;
const loadMoreBtn = document.querySelector<HTMLButtonElement>('#load-more')!;
const toggleFavsBtn = document.querySelector<HTMLButtonElement>('#toggle-favs')!;
const sortSelect = document.querySelector<HTMLSelectElement>('#sort-select')!;
const favCountSpan = toggleFavsBtn.querySelector('span')!;

const updateStats = () => {
  statsBanner.textContent = `${loadedPokemons.size} Pokémon chargés | ${favoriteIds.length} favoris`;
  favCountSpan.textContent = favoriteIds.length.toString();
};

const renderSkeletons = (count: number) => {
  const skeletons = Array(count).fill('<div class="skeleton-card"></div>').join('');
  if (currentOffset === 0) {
    grid.innerHTML = skeletons;
  } else {
    grid.innerHTML += skeletons;
  }
};

const renderPokemons = () => {
  let pokemonsToRender = Array.from(loadedPokemons.values());
  if (showOnlyFavorites) {
    pokemonsToRender = pokemonsToRender.filter(p => favoriteIds.includes(p.id));
  }

  pokemonsToRender.sort((a, b) => {
    if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
    if (currentSort === 'name-desc') return b.name.localeCompare(a.name);
    if (currentSort === 'id-desc') return b.id - a.id;
    return a.id - b.id;
  });

  const cardsHtml = pokemonsToRender.map((p) => createPokemonCard(p, favoriteIds.includes(p.id))).join('');
  grid.innerHTML = cardsHtml;
  loadMoreBtn.style.display = showOnlyFavorites ? 'none' : 'block';
};

const loadPokemons = async () => {
  try {
    statsBanner.textContent = 'Chargement en cours...';
    loadMoreBtn.disabled = true;
    
    renderSkeletons(LIMIT);

    const list = await fetchPokemonList(LIMIT, currentOffset);
    const detailsPromises = list.results.map((p: any) => fetchPokemonDetails(p.url));
    const pokemons = await Promise.all(detailsPromises);

    pokemons.forEach((p) => loadedPokemons.set(p.id, p));

    updateStats();
    renderPokemons();
    
    loadMoreBtn.disabled = false;
  } catch {
    statsBanner.innerHTML = '<span style="color: red;">Erreur lors du chargement.</span> <button id="retry-btn">Réessayer</button>';
    document.getElementById('retry-btn')?.addEventListener('click', loadPokemons);
  }
};

grid.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const card = target.closest('.pokemon-card') as HTMLElement;
  
  if (!card) return;
  
  const idStr = card.dataset.id;
  if (!idStr) return;
  const id = parseInt(idStr, 10);

  if (target.closest('.fav-btn')) {
    e.stopPropagation(); 
    if (favoriteIds.includes(id)) {
      favoriteIds = favoriteIds.filter(favId => favId !== id);
    } else {
      favoriteIds.push(id);
    }
    saveFavorites(favoriteIds);
    updateStats();
    renderPokemons();
    return;
  }

  window.location.href = `/pokemon.html?id=${id}`;
});

loadMoreBtn.addEventListener('click', () => {
  currentOffset += LIMIT;
  loadPokemons();
});

toggleFavsBtn.addEventListener('click', () => {
  showOnlyFavorites = !showOnlyFavorites;
  toggleFavsBtn.style.fontWeight = showOnlyFavorites ? 'bold' : 'normal';
  renderPokemons();
});

sortSelect.addEventListener('change', (e) => {
  currentSort = (e.target as HTMLSelectElement).value;
  renderPokemons();
});

loadPokemons();