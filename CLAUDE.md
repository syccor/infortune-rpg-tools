# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Outils de campagne pour un JDR maison (« Les Infortunées »), en français : gestion de personnages, combat, tournoi et plusieurs calculateurs de règles. Les règles de jeu appartiennent à Assast ; l'UI et les libellés sont en français (accents obligatoires).

Angular 20 (standalone components, signals), Firebase (Auth Google + Firestore via `@angular/fire`), SCSS.

## Commandes

Node vient de nvm et n'est pas toujours dans le `PATH` d'un shell non interactif : `export PATH="$HOME/.nvm/versions/node/v24.2.0/bin:$PATH"` avant d'appeler `npx`/`ng`.

- `npm start` : serveur de dev (http://localhost:4200)
- `npx ng build` : build de production (les budgets sont dans `angular.json`)
- `npm test` : tests Karma (`ng test`) ; un seul fichier : `npx ng test --include='**/characters.component.spec.ts'`
- `npm run deploy` : build avec `--base-href=/infortune-rpg-tools/` puis publication GitHub Pages (`angular-cli-ghpages`)
- `npm run deploy:rules` : déploie `firestore.rules`

Les scripts `seed:*` de `package.json` pointent vers `firebase/seeds/`, qui n'existe pas dans le dépôt.

## Architecture

- **Routage par `#`** : `provideRouter(routes, withHashLocation())`. Les URL sont de la forme `/#/furtivite` ; sans `#`, on retombe sur l'accueil (nécessaire pour GitHub Pages).
- **Alias de chemins** (`tsconfig.json`) : `@features/*`, `@pages/*`, `@core/*`, `@services/*`, `@models/*`, `@utils/*`, `@shared/*`. Les imports de composants de `features/` dans `app.routes.ts` passent par `@features/…`.
- **`src/app/features/`** : calculateurs autonomes sans backend (majorations de dégâts, XP de reroll, dégâts de zone, furtivité). Chacun est un composant standalone avec son état en signals et sa logique de calcul dans la classe.
- **`src/app/pages/`** : pages routées liées aux données (personnages, combat, rerolls, tournoi, cambuse, administration, calcul PV).
- **`src/app/core/`** : `services/` (accès Firestore), `models/`, `guards/`, `utils/` (logique de règles pure : `character-calculator`, `combat-calculator`, `pet-calculator`, `tournament-simulator`, `company-buff.utils`).
- **Authentification et rôles** : `AuthService.appUser$` combine l'état Firebase Auth et le document `users/{uid}`. Les rôles `dev` et `mj` donnent accès à Cambuse et Administration (`adminGuard`) ; `authGuard` exige d'être connecté. Le menu latéral (`app.component.html`) masque les liens selon le même rôle ; les routes doivent donc être protégées par un guard en plus.
- **Données de référence** : `GameDataService` charge les référentiels depuis Firestore (classes, races, grades…) et y ajoute des entrées codées en dur (`additionalRaces`, par exemple Troll Amani et Gobelin). Ajouter une race ou un référentiel passe par ce service et par `core/models/reference.model.ts`.
- **Règles Firestore** (`firestore.rules`) : tout utilisateur connecté peut lire et écrire `users`, `characters`, `company` et `activeBuff` ; les référentiels sont en lecture seule.

## Conventions

- Style visuel des outils : thème sombre, mêmes cartes et couleurs que les calculateurs existants (voir les `.scss` de `features/`). Un résultat important est affiché dans un bloc résumé visible en haut à droite.
- Menu : liens regroupés en sous-menus `<details class="nav-group">` (Compagnie Infortune, Sans-Couronne, Admin). Un nouvel outil se déclare dans `app.routes.ts` et dans le bon groupe de `app.component.html`.
- Prettier : 100 colonnes, guillemets simples.
