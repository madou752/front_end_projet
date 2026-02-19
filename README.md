# Pokédoums - Explorateur Pokémon Avancé

Pokédoums est une application web moderne construite avec **TypeScript** et **Vite**, permettant d'explorer l'univers Pokémon en utilisant la [PokeAPI](https://pokeapi.co/).

## Fonctionnalités Principales

- **Exploration Infinie** : Affichage des Pokémon sous forme de grille avec système de pagination ("Voir plus").
- **Recherche Intelligente** : Barre de recherche dynamique avec raccourci clavier (`Ctrl + K` ou `Cmd + K`).
- **Système de Favoris** : Possibilité de mettre en favoris vos Pokémon préférés avec persistance des données via `localStorage`.
- **Tri Avancé** : Classement par ID (ordre croissant/décroissant) ou par Nom (A-Z / Z-A).
- **Fiches Détails** : Consultations des statistiques, types, et descriptions (en français) pour chaque Pokémon.
- **Mode Comparaison** : Outil unique permettant de comparer deux Pokémon côte à côte avec calcul de moyenne de statistiques et indicateurs visuels de puissance.
- **Mode Sombre / Clair** : Interface adaptable pour un confort visuel optimal de jour comme de nuit.
- **Accessibilité (A11y)** : Navigation complète au clavier (Tab, Enter) et support des flèches directionnelles pour parcourir la liste.

## Stack Technique

- **Frontend** : TypeScript, HTML5, CSS3
- **Tooling** : Vite.js
- [cite_start]**API** : PokeAPI (v2) [cite: 1]
- **Icônes** : Font Awesome

## Structure du Projet

- **src/** : Contient les scripts TypeScript (main.ts, pokemon.ts, compare.ts).
- **public/** : Contient les assets statiques et les images.
- **index.html** : Point d'entrée principal de l'application.
- **pokemon.html** : Page de détails d'un Pokémon.
- **compare.html** : Page de comparaison entre deux Pokémon.

## Installation et Lancement

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/madou752/front_end_projet.git
   ```
2. Installer les dépendances :
    ```bash
    npm install
    ```
3. Lancer le projet :
    ```bash
    npm run build
    ```

## Auteur 
Mehdi Hammadou - Projet réalisé dans le cadre du module Front-End.