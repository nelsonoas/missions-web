# Missions — site web installable

Affiche les missions synchronisées par le dépôt privé `protectas-planning` :
accueil (prochaine mission, heures), planning du mois, fiche mission, heures et salaire estimé.
Fait avec React, Tailwind CSS et des composants shadcn/ui.

Ce dépôt ne contient **aucune donnée** : le site lit `data/missions.json` dans le dépôt privé
avec le jeton GitHub enregistré sur ton téléphone.

## Publication

Chaque modification poussée sur `main` est publiée automatiquement par
`.github/workflows/deploy.yml` sur https://nelsonoas.github.io/missions-web/

## Travailler sur ton PC

```
npm install
npm run dev      # aperçu local sur http://localhost:5173
npm run build    # vérifie que tout compile
```

## Fichiers

- `src/pages/` : Accueil, Planning, Mission, Heures, Réglages
- `src/components/ui/` : composants shadcn/ui (Card, Button, Badge, Input, Label, Separator)
- `src/lib/data.js` : lecture GitHub, cache local, calculs (heures, salaire)
- `src/lib/store.jsx` : état partagé
- `src/index.css` : couleurs (clair et sombre)
