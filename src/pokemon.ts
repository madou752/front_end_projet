import { fetchPokemonDetails, fetchSpecies } from './services/api';
import { typeColors } from './utils/colors';
import type { PokemonTypeSlot, FlavorText } from './types/pokemon';
import './pokemon.css';

const getFavorites = (): number[] => {
  const saved = localStorage.getItem('pokemon_favorites');
  return saved ? JSON.parse(saved) : [];
};

const saveFavorites = (favorites: number[]) => {
  localStorage.setItem('pokemon_favorites', JSON.stringify(favorites));
};

const app = document.querySelector<HTMLDivElement>('#pokemon-app')!;
const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');

const getStatColor = (stat: number): string => {
  if (stat < 50) return '#ff4a4a';
  if (stat < 90) return '#ffa726';
  return '#9ccc65';
};

const init = async () => {
  if (!idParam) {
    app.innerHTML = '<h2>Aucun Pokémon spécifié.</h2><a href="/">Retour</a>';
    return;
  }

  try {
    app.innerHTML = '<div class="loader">Chargement...</div>';

    const id = parseInt(idParam, 10);
    let favoriteIds = getFavorites();
    let isFavorite = favoriteIds.includes(id);

    const [pokemon, species] = await Promise.all([
      fetchPokemonDetails(`${import.meta.env.VITE_BASE_URL}/pokemon/${id}`),
      fetchSpecies(`${import.meta.env.VITE_BASE_URL}/pokemon-species/${id}`),
    ]);

    const type1 = pokemon.types[0].type.name;
    const color = typeColors[type1] || '#777';

    const typesHtml = pokemon.types
      .map((t: PokemonTypeSlot) => {
        const typeColor = typeColors[t.type.name] || '#777';
        return `<span class="type-badge" style="background-color: ${typeColor};">${t.type.name}</span>`;
      })
      .join('');

    const statsHtml = pokemon.stats
      .map(
        (s) => `
      <div class="stat-row">
        <span class="stat-name">${s.stat.name.replace('-', ' ')}</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${Math.min(s.base_stat, 100)}%; background-color: ${getStatColor(s.base_stat)};"></div></div>
        <span class="stat-value">${s.base_stat}</span>
      </div>
    `
      )
      .join('');

    const desc =
      species.flavor_text_entries.find((f: FlavorText) => f.language.name === 'fr')?.flavor_text ||
      species.flavor_text_entries.find((f: FlavorText) => f.language.name === 'en')?.flavor_text ||
      'Aucune description.';

    const cleanDesc = desc.replace(/[\n\f\r]/g, ' ');

    const prevId = id > 1 ? id - 1 : null;
    const nextId = id + 1;

    const renderHeart = () =>
      isFavorite ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';

    const currentTheme = localStorage.getItem('theme') || 'light';
    const isDark = currentTheme === 'dark';
    if (isDark) document.body.classList.add('dark-mode');
    const themeIcon = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';

    app.innerHTML = `
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <h1><a href="/">Pokédoums</a></h1>
        <button id="theme-toggle" class="theme-btn">${themeIcon}</button>
      </header>
      <main class="pokemon-container">
        <nav class="breadcrumb">
          <a href="/">Accueil</a> &gt; <span>${pokemon.name}</span>
        </nav>
        
        <div class="detail-card" style="border-top: 10px solid ${color};">
          <div class="nav-buttons">
            ${prevId ? `<a href="/pokemon.html?id=${prevId}" class="nav-arrow">&laquo; N°${prevId.toString().padStart(3, '0')}</a>` : '<div></div>'}
            ${nextId ? `<a href="/pokemon.html?id=${nextId}" class="nav-arrow">N°${nextId.toString().padStart(3, '0')} &raquo;</a>` : '<div></div>'}
          </div>

          <div class="detail-header">
            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px;">
              <h1 style="margin: 0;">${pokemon.name} <span>#${pokemon.id.toString().padStart(3, '0')}</span></h1>
              <button id="detail-fav-btn" class="fav-btn" style="color: #ff4a4a; filter: none;">${renderHeart()}</button>
            </div>
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="main-img">
            <div class="types-container">
              ${typesHtml}
            </div>
          </div>
          <p class="description">${cleanDesc}</p>
          <div class="info-grid">
            <div class="info-box"><strong>Poids</strong><br>${pokemon.weight / 10} kg</div>
            <div class="info-box"><strong>Taille</strong><br>${pokemon.height / 10} m</div>
            <div class="info-box"><strong>Exp</strong><br>${pokemon.base_experience}</div>
          </div>
          <div class="stats-container"><h3>Statistiques</h3>${statsHtml}</div>
        </div>
      </main>
    `;

    const favBtn = document.getElementById('detail-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        isFavorite = !isFavorite;
        if (isFavorite) {
          favoriteIds.push(id);
        } else {
          favoriteIds = favoriteIds.filter((favId) => favId !== id);
        }
        saveFavorites(favoriteIds);
        favBtn.innerHTML = renderHeart();
      });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const darkActive = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', darkActive ? 'dark' : 'light');
        themeToggleBtn.innerHTML = darkActive
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
      });
    }
  } catch (error) {
    console.error('Erreur API :', error);
    app.innerHTML = '<h2>Erreur lors du chargement.</h2><a href="/">Retour</a>';
  }
};

init();
