import { fetchPokemonDetails } from './services/api';
import { typeColors } from './utils/colors';
import type { Pokemon, PokemonStat } from './types/pokemon';
import './compare.css';

const getFavorites = (): number[] => {
  const saved = localStorage.getItem('pokemon_favorites');
  return saved ? JSON.parse(saved) : [];
};

const saveFavorites = (favorites: number[]) => {
  localStorage.setItem('pokemon_favorites', JSON.stringify(favorites));
};

const getStatColor = (stat: number): string => {
  if (stat < 50) return '#ff4a4a';
  if (stat < 90) return '#ffa726';
  return '#9ccc65';
};

const app = document.querySelector<HTMLDivElement>('#compare-app')!;
const urlParams = new URLSearchParams(window.location.search);
const id1Param = urlParams.get('id1');
const id2Param = urlParams.get('id2');

const init = async () => {
  if (!id1Param || !id2Param) {
    app.innerHTML = '<h2>Veuillez sélectionner deux Pokémon à comparer.</h2><a href="/">Retour</a>';
    return;
  }

  try {
    app.innerHTML = '<div class="loader">Chargement de la comparaison...</div>';

    const id1 = parseInt(id1Param, 10);
    const id2 = parseInt(id2Param, 10);
    let favoriteIds = getFavorites();

    const [pokemon1, pokemon2] = await Promise.all([
      fetchPokemonDetails(`${import.meta.env.VITE_BASE_URL}/pokemon/${id1}`),
      fetchPokemonDetails(`${import.meta.env.VITE_BASE_URL}/pokemon/${id2}`),
    ]);

    const calculateAverageStats = (stats: PokemonStat[]) => {
      const total = stats.reduce((sum, s) => sum + s.base_stat, 0);
      return total / stats.length;
    };

    const avg1 = calculateAverageStats(pokemon1.stats);
    const avg2 = calculateAverageStats(pokemon2.stats);

    let comparisonSymbol = '=';
    if (avg1 > avg2) comparisonSymbol = '>';
    if (avg1 < avg2) comparisonSymbol = '<';

    const generatePokemonCardHTML = (pokemon: Pokemon, avg: number) => {
      const type1 = pokemon.types[0].type.name;
      const color = typeColors[type1] || '#777';
      const isFav = favoriteIds.includes(pokemon.id);
      const heartIcon = isFav
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';

      const statsHtml = pokemon.stats
        .map((s: PokemonStat, index: number) => {
          const otherStat =
            pokemon === pokemon1
              ? pokemon2.stats[index].base_stat
              : pokemon1.stats[index].base_stat;
          let statColorClass = '';
          if (s.base_stat > otherStat) statColorClass = 'stat-higher';
          if (s.base_stat < otherStat) statColorClass = 'stat-lower';

          return `
          <div class="stat-row">
            <span class="stat-name">${s.stat.name.replace('-', ' ')}</span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill" style="width: ${Math.min(s.base_stat, 100)}%; background-color: ${getStatColor(s.base_stat)};"></div>
            </div>
            <span class="stat-value ${statColorClass}">${s.base_stat}</span>
          </div>
        `;
        })
        .join('');

      return `
        <div class="detail-card" style="border-top: 10px solid ${color};">
          <div class="detail-header">
            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px;">
              <h1>${pokemon.name} <span>#${pokemon.id.toString().padStart(3, '0')}</span></h1>
              <button class="fav-btn compare-fav-btn" data-id="${pokemon.id}" style="color: #ff4a4a;">${heartIcon}</button>
            </div>
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="main-img">
          </div>
          <div class="stats-container">
            <h3>Statistiques</h3>
            ${statsHtml}
            <div class="average-stat">
              Moyenne : ${avg.toFixed(1)}
            </div>
          </div>
        </div>
      `;
    };

    const currentTheme = localStorage.getItem('theme') || 'light';
    const isDark = currentTheme === 'dark';
    if (isDark) document.body.classList.add('dark-mode');
    const themeIcon = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';

    app.innerHTML = `
      <header style="display: flex; justify-content: space-between; align-items: center; padding: 16px;">
        <h1><a href="/" style="color: inherit; text-decoration: none;">Pokédoums</a></h1>
        <button id="theme-toggle" class="theme-btn">${themeIcon}</button>
      </header>
      <main class="compare-container">
        <nav class="breadcrumb">
          <a href="/">Accueil</a> &gt; <span>Comparaison</span>
        </nav>
        
        <div class="compare-grid">
          ${generatePokemonCardHTML(pokemon1, avg1)}
          
          <div class="compare-symbol">
            ${comparisonSymbol}
          </div>
          
          ${generatePokemonCardHTML(pokemon2, avg2)}
        </div>
      </main>
    `;

    document.querySelectorAll('.compare-fav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const id = parseInt(target.dataset.id!, 10);
        let isFav = favoriteIds.includes(id);

        isFav = !isFav;
        if (isFav) {
          favoriteIds.push(id);
        } else {
          favoriteIds = favoriteIds.filter((favId) => favId !== id);
        }
        saveFavorites(favoriteIds);
        target.innerHTML = isFav
          ? '<i class="fa-solid fa-heart"></i>'
          : '<i class="fa-regular fa-heart"></i>';
      });
    });

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
    app.innerHTML = '<h2>Erreur lors du chargement de la comparaison.</h2><a href="/">Retour</a>';
  }
};

init();
