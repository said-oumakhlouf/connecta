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
Le panier permet de commander le stock disponible, avec un maximum de 100 paires
par commande : 20 paires en stock autorisent 20 Solo ou 10 packs Duo.
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

## Administration

Ouvrir **http://localhost:3000/admin**, ou le lien Administration dans le pied de page.
Ajouter d'abord `ADMIN_PASSWORD` au `.env` du **backend** avec un mot de passe privé
de 16 à 256 caractères, puis redémarrer ce backend. Aucun secret admin ne doit être
placé dans le frontend, dans `NEXT_PUBLIC_API_URL` ou dans Git.

Après connexion, le **bilan mensuel** permet de choisir un mois et affiche le montant
des commandes, le nombre de commandes, les unités et le panier moyen, ainsi que
les montants en attente, confirmés et annulés. Les annulations sont exclues des totaux.
Le classement des produits utilise les quantités réelles et les prix/remises historiques,
calculés sur toutes les commandes du mois en heure de Paris, au-delà de la pagination.
Ces montants ne sont pas des paiements encaissés ni des bénéfices. Le bilan est actualisé
après confirmation ou annulation d’une commande.

Après connexion :

- **Commandes** : coordonnées des clients, date, statut, quantités, total et détail
  des prix/remises enregistrés. Les commandes sont paginées par groupes de 20.
- **Produits et stock** : état et stock de tous les produits. Saisir les unités
  réellement reçues puis cliquer Ajouter. Une saisie de 20 ajoute 20 unités au
  stock existant ; elle ne le remplace pas.
- **Actualiser** : recharge les commandes et le stock depuis la BDD.
- **Déconnexion** : invalide la session côté API et efface les données affichées.

La session reste uniquement en mémoire, expire au bout de huit heures et nécessite
une nouvelle connexion après rechargement de la page ou redémarrage de l'API.
L'interface admin n'affiche ni le panier ni la barre mobile de commande.
Les routes admin du backend vérifient la session avant de lire ou modifier des données.
Une commande en attente peut être confirmée ou annulée. Une commande confirmée
peut également être annulée. L’annulation demande une confirmation, devient
définitive et remet les articles en stock une seule fois. Le stock affiché est
actualisé après l’annulation. Confirmer ne valide pas un paiement.

Pour tester le réapprovisionnement, partir d'un produit actif à zéro, ajouter
20 unités dans l'admin, puis revenir à la boutique : le produit doit être disponible.
Une commande de deux unités laisse 18 en stock et apparaît dans l'admin après actualisation.
La confirmer conserve 18 unités ; l’annuler remet le stock à 20 et désactive les actions.

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
