# CONNECTA — frontend

Landing page et panier Next.js + TypeScript + Tailwind CSS, connectés au backend `connecta-api`.

## Développement local

Le backend doit être lancé dans son dossier avec `npm run start:dev` sur le port 3001.

Dans ce dossier frontend :

```bash
npm ci
npm run dev
```

Ouvrir **http://localhost:3000**. En développement, l'API utilisée par défaut est
**http://localhost:3001**. Pour choisir une autre API, copier `.env.example` vers
`.env.local`, adapter `NEXT_PUBLIC_API_URL` puis redémarrer le frontend.

Le backend autorise les requêtes du navigateur depuis `localhost:3000` et
`127.0.0.1:3000` par défaut. Si le frontend utilise un autre port ou domaine,
ajouter son origine exacte à `CORS_ORIGINS` dans le backend et redémarrer celui-ci.

## Parcours de commande

1. Le site récupère `GET /products/hoco-ew75` : identifiant, prix, offre Duo et stock.
2. Les prix de la landing page, de la fiche produit et du panier sont actualisés.
3. Le client choisit Solo ou Duo et le nombre de paires/packs.
4. Le formulaire demande son nom complet et son email.
5. `POST /orders` transmet uniquement ces coordonnées, l'identifiant du produit et
   le nombre réel de paires : un pack Duo correspond à deux unités.
6. La confirmation affiche le numéro de commande, le total renvoyé par l'API et
   le statut « En attente ». Le panier est vidé et le stock est actualisé.

Le total affiché inclut automatiquement l'offre Duo pour les quantités paires et
impaires : 1 = 35 €, 2 = 60 €, 3 = 95 €, 4 = 120 € avec les tarifs actuels.
Les prix et remises de la commande sont calculés par le backend.
En cas de stock insuffisant ou de produit modifié, le panier est conservé et sa
disponibilité est actualisée. Une requête échouée n'est pas relancée automatiquement.
La validation est bloquée pendant l'envoi, le chargement et lorsque le stock est insuffisant.

**Une validation crée une vraie commande et retire le stock en base.**
Aucun paiement ni email automatique n'est envoyé. Le paiement et la livraison
restent à connecter.

## Configuration de production

Définir `NEXT_PUBLIC_API_URL` avec l'adresse HTTPS du backend **avant le build**.
Cette adresse est publique et ne doit contenir aucun secret. Elle est intégrée
au JavaScript généré : changer sa valeur nécessite un nouveau build.
Sans adresse configurée en production, l'enregistrement des commandes est indisponible.
Renseigner aussi l'origine HTTPS du frontend dans `CORS_ORIGINS` côté backend.

`npm run build` génère un site statique dans `out/`.
Pour le développement utiliser `npm run dev` ; `npm start` n'est pas adapté à cet export statique.

## Fichiers principaux

- `components/shop/ShopProvider.tsx` : produit distant, état du panier et création de commande.
- `components/shop/CartDialog.tsx` : formulaire, erreurs et confirmation.
- `lib/shop-api.ts` : appels HTTP typés et validation des réponses.
- `lib/shop-pricing.ts` : estimation du total en centimes et affichage en euros.
- `data/offers.ts` : contenu des offres et prix de présentation avant le chargement de l'API.
- `components/product/AnimatedProduct.tsx` : boîtier animé.

## Vérifications

```bash
npm run typecheck
npm test
npm run build
```

Les tests vérifient le calcul Solo/Duo, les données envoyées et les réponses
d'erreur sans créer de commandes réelles. GitHub Actions exécute ces tests et le build.
Pour vérifier le parcours complet sur votre ordinateur, laisser le backend tourner,
ouvrir le site, choisir le Duo, renseigner un nom et un email de test, puis valider.
Le total confirmé doit être de 60 € et le stock doit diminuer de deux unités.
