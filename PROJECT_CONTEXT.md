# CONNECTA — contexte court pour ChatGPT Work

## Projet
- Frontend e-commerce pour les écouteurs Hoco EW75, connecté à `said-oumakhlouf/connecta-api`.
- Stack : Next.js 15, React 19, TypeScript, Tailwind CSS 4 ; export statique en production.
- Offre présentée : Solo 35 €, Duo 60 €. Les tarifs réels, remises et stocks proviennent de l'API (montants en centimes).

## État constaté dans le dépôt
- Catalogue/stock distant : `GET /products/hoco-ew75` ; panier Solo/Duo, limite de 10 unités.
- Le code de `lib/shop-api.ts` utilise encore `POST /orders` (ancien parcours sans paiement).
- Le backend possède aussi des routes Stripe et membres : ne pas supposer qu'elles sont déjà intégrées au frontend sans vérifier le code.
- Fichiers utiles : `components/shop/ShopProvider.tsx`, `components/shop/CartDialog.tsx`, `lib/shop-api.ts`, `lib/shop-pricing.ts`, `data/offers.ts`.
- Variables : `NEXT_PUBLIC_API_URL` pour l'adresse publique de l'API ; jamais de secret dans `NEXT_PUBLIC_*`.

## Commandes
- Local : `npm run dev` (backend généralement sur le port 3001).
- Vérification ciblée : `npm run typecheck`, `npm test` ; `npm run build` si nécessaire.

## Consignes Work
- Une fonctionnalité par tâche ; lire d'abord ce fichier puis les fichiers strictement concernés.
- Ne pas analyser/refactoriser tout le dépôt ni modifier le backend sans nécessité.
- Préserver le panier, les calculs d'unités et les erreurs de stock ; vérifier l'API réelle avant toute intégration.
- Finir par : fichiers changés, tests exécutés, limites et prochaine étape (5 lignes maximum).
- Actualiser ce résumé uniquement lorsqu'une évolution importante est effectivement livrée.
