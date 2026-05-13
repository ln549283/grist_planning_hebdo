# Grist Planning Widget

Widget personnalisé Grist pour afficher un planning hebdomadaire du lundi au samedi.

## Colonnes attendues

| Nom dans le widget | Type Grist attendu |
|---|---|
| Formation | Text |
| Jour | Choice |
| Heure | Choice |

Valeurs attendues pour `Jour` :

- Lundi
- Mardi
- Mercredi
- Jeudi
- Vendredi
- Samedi

Valeurs attendues pour `Heure` :

- Matin
- Après-midi

## Installation via GitHub Pages

1. Créer un dépôt GitHub.
2. Ajouter les fichiers `index.html`, `style.css`, `app.js`.
3. Aller dans `Settings > Pages`.
4. Source : `Deploy from a branch`.
5. Branch : `main`.
6. Folder : `/root`.
7. Utiliser l’URL générée dans Grist comme widget personnalisé.

Exemple :

```txt
https://votre-utilisateur.github.io/grist-planning-widget/
