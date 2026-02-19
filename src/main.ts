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
let isCompareMode = false;
let compareSelection: number[] = [];

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto;">
      <h1><a href="/" style="color: inherit; text-decoration: none;">Pokédoums</a></h1>
      <button id="theme-toggle"></button>
    </div>
    <div class="controls">
      <input type="text" id="search-input" placeholder="Rechercher..." />
      <button id="compare-btn">Comparer</button>
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
const themeToggleBtn = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const favCountSpan = toggleFavsBtn.querySelector('span')!;
const searchInput = document.querySelector<HTMLInputElement>('#search-input')!;
const compareBtn = document.querySelector<HTMLButtonElement>('#compare-btn')!;

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
} else {
  themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
});

const updateStats = () => {
  statsBanner.textContent = `${loadedPokemons.size} Pokémon chargés | ${favoriteIds.length} favoris`;
  favCountSpan.textContent = favoriteIds.length.toString();
  if (isCompareMode) {
    compareBtn.textContent = `Annuler (Sélectionnés : ${compareSelection.length}/2)`;
    compareBtn.style.backgroundColor = '#ffcc00';
    compareBtn.style.color = '#333';
  } else {
    compareBtn.textContent = 'Comparer';
    compareBtn.style.backgroundColor = '';
    compareBtn.style.color = '';
  }
};

compareBtn.addEventListener('click', () => {
  isCompareMode = !isCompareMode;
  compareSelection = [];
  updateStats();
  document.querySelectorAll('.pokemon-card').forEach((card) => {
    card.classList.toggle('compare-mode-active', isCompareMode);
    card.classList.remove('selected-for-compare');
  });
});

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
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm) {
    pokemonsToRender = pokemonsToRender.filter((p) => p.name.toLowerCase().includes(searchTerm));
  }

  if (showOnlyFavorites) {
    pokemonsToRender = pokemonsToRender.filter((p) => favoriteIds.includes(p.id));
  }

  pokemonsToRender.sort((a, b) => {
    if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
    if (currentSort === 'name-desc') return b.name.localeCompare(a.name);
    if (currentSort === 'id-desc') return b.id - a.id;
    return a.id - b.id;
  });

  const cardsHtml = pokemonsToRender
    .map((p) => createPokemonCard(p, favoriteIds.includes(p.id)))
    .join('');
  grid.innerHTML = cardsHtml;
  loadMoreBtn.style.display = showOnlyFavorites || searchTerm ? 'none' : 'block';

  if (isCompareMode) {
    document.querySelectorAll('.pokemon-card').forEach((card) => {
      card.classList.add('compare-mode-active');
      const id = parseInt((card as HTMLElement).dataset.id!, 10);
      if (compareSelection.includes(id)) {
        card.classList.add('selected-for-compare');
      }
    });
  }
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
    statsBanner.innerHTML =
      '<span style="color: red;">Erreur lors du chargement.</span> <button id="retry-btn">Réessayer</button>';
    document.getElementById('retry-btn')?.addEventListener('click', loadPokemons);
  }
};

const handleCardInteraction = (target: HTMLElement, e: Event) => {
  const card = target.closest('.pokemon-card') as HTMLElement;
  if (!card) return;

  const idStr = card.dataset.id;
  if (!idStr) return;
  const id = parseInt(idStr, 10);

  if (target.closest('.fav-btn')) {
    e.stopPropagation();
    if (favoriteIds.includes(id)) {
      favoriteIds = favoriteIds.filter((favId) => favId !== id);
    } else {
      favoriteIds.push(id);
    }
    saveFavorites(favoriteIds);
    updateStats();
    renderPokemons();
    return;
  }

  if (isCompareMode) {
    const index = compareSelection.indexOf(id);
    if (index > -1) {
      compareSelection.splice(index, 1);
      card.classList.remove('selected-for-compare');
    } else if (compareSelection.length < 2) {
      compareSelection.push(id);
      card.classList.add('selected-for-compare');
    }

    updateStats();

    if (compareSelection.length === 2) {
      window.location.href = `/compare.html?id1=${compareSelection[0]}&id2=${compareSelection[1]}`;
    }
    return;
  }

  window.location.href = `/pokemon.html?id=${id}`;
};

grid.addEventListener('click', (e) => {
  handleCardInteraction(e.target as HTMLElement, e);
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
  }
});

searchInput.addEventListener('input', () => {
  renderPokemons();
});

grid.addEventListener('keydown', (e) => {
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.pokemon-card'));
  const currentIndex = cards.indexOf(document.activeElement as HTMLElement);

  if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault();
    if (cards.length === 0) return;

    let nextIndex = currentIndex !== -1 ? currentIndex : 0;

    if (currentIndex !== -1) {
      const gridStyle = window.getComputedStyle(grid);
      const columns = gridStyle.gridTemplateColumns.split(' ').length;

      if (e.key === 'ArrowRight') nextIndex = Math.min(currentIndex + 1, cards.length - 1);
      if (e.key === 'ArrowLeft') nextIndex = Math.max(currentIndex - 1, 0);
      if (e.key === 'ArrowDown') nextIndex = Math.min(currentIndex + columns, cards.length - 1);
      if (e.key === 'ArrowUp') nextIndex = Math.max(currentIndex - columns, 0);
    }

    cards[nextIndex].focus();
  }

  if (e.key === 'Enter') {
    handleCardInteraction(e.target as HTMLElement, e);
  }
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
