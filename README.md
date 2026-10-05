# CONNECTA — démarrage dans VS Code

Prérequis : Node.js 22 LTS ou 24 LTS avec npm.

1. Décompresser cette archive.
2. Dans VS Code, ouvrir le dossier `connecta` (celui contenant `package.json`).
3. Ouvrir Terminal > Nouveau terminal.
4. Exécuter `npm ci`, puis `npm run dev`.
5. Ouvrir http://localhost:3000 dans le navigateur.

Les modifications sont mises à jour automatiquement. Pour arrêter le serveur : Ctrl+C dans le terminal.

## Fichiers principaux
- app/page.tsx : landing page et panier simulé.
- app/globals.css : styles responsive et animations.
- components/AnimatedProduct.tsx : boîtier animé.
- components/ProductVisual.tsx : visuels provisoires.

## Vérifications
`npm run typecheck`
`npm run build`

`npm run build` génère un site statique dans `out`. Pour le développement, utiliser `npm run dev` (pas `npm start`, incompatible avec cet export statique).

Aucune clé API, aucun backend, aucun paiement requis. Le panier est une démonstration. Les visuels produit sont provisoires.
