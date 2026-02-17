import { fetchPokemonDetails, fetchSpecies } from './services/api';
import { typeColors } from './utils/colors';
import './pokemon.css';

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

    const [pokemon, species] = await Promise.all([
      fetchPokemonDetails(`${import.meta.env.BASE_URL}/pokemon/${id}`),
      fetchSpecies(`${import.meta.env.BASE_URL}/pokemon-species/${id}`),
    ]);

    const type1 = pokemon.types[0].type.name;
    const color = typeColors[type1] || '#777';

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
      species.flavor_text_entries.find((f) => f.language.name === 'fr')?.flavor_text ||
      species.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text ||
      'Aucune description.';

    const prevId = id > 1 ? id - 1 : null;
    const nextId = id + 1;

    app.innerHTML = `
      <header>
        <h1><a href="/">Pokédex</a></h1>
      </header>
      <main class="pokemon-container">
        <nav class="breadcrumb">
          <a href="/">Accueil</a> &gt; <span>${pokemon.name}</span>
        </nav>
        
        <div class="nav-buttons">
          ${prevId ? `<a href="/pokemon.html?id=${prevId}" class="nav-arrow">&laquo; N°${prevId.toString().padStart(3, '0')}</a>` : '<div></div>'}
          ${nextId ? `<a href="/pokemon.html?id=${nextId}" class="nav-arrow">N°${nextId.toString().padStart(3, '0')} &raquo;</a>` : '<div></div>'}
        </div>

        <div class="detail-card" style="border-top: 10px solid ${color};">
          <div class="detail-header">
            <h1>${pokemon.name} <span>#${pokemon.id.toString().padStart(3, '0')}</span></h1>
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="main-img">
          </div>
          <p class="description">${desc.replace(/\\f|\\n|\f|\n/g, ' ')}</p>
          <div class="info-grid">
            <div class="info-box"><strong>Poids</strong><br>${pokemon.weight / 10} kg</div>
            <div class="info-box"><strong>Taille</strong><br>${pokemon.height / 10} m</div>
            <div class="info-box"><strong>Exp</strong><br>${pokemon.base_experience}</div>
          </div>
          <div class="stats-container"><h3>Statistiques</h3>${statsHtml}</div>
        </div>
      </main>
    `;
  } catch {
    app.innerHTML = '<h2>Erreur lors du chargement.</h2><a href="/">Retour</a>';
  }
};

init();
