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
5. `POST /payments/checkout` transmet les coordonnées, l'identifiant du produit,
   le nombre réel de paires et une clé de tentative. Le backend réserve le stock
   et calcule les prix avant de créer une session Stripe en mode test.
6. Le navigateur ouvre Stripe Checkout. `/paiement` vérifie ensuite le statut auprès
   du backend : seul un paiement vérifié par Stripe confirme la commande.
7. Une annulation expire d'abord la session Stripe puis restitue le stock. Une
   réservation abandonnée expire après environ 31 minutes ; le backend la libère
   au webhook ou lors de son contrôle périodique (toutes les 30 secondes).

Le total affiché inclut automatiquement l'offre Duo pour les quantités paires et
impaires : 1 = 35 €, 2 = 60 €, 3 = 95 €, 4 = 120 € avec les tarifs actuels.
Les prix et remises de la commande sont calculés par le backend.
Le panier permet de commander le stock disponible, avec un maximum de 100 paires
par commande : 20 paires en stock autorisent 20 Solo ou 10 packs Duo.
En cas de stock insuffisant ou de produit modifié, le panier est conservé et sa
disponibilité est actualisée. Une requête échouée n'est pas relancée automatiquement.
La validation est bloquée pendant l'envoi, le chargement et lorsque le stock est insuffisant.

**Cette intégration accepte uniquement les clés Stripe de test.** Aucune somme réelle
n'est débitée. Sans les clés de test et le webhook configurés côté backend, le
paiement est indisponible et aucun stock n'est réservé. Aucun email automatique
n'est envoyé par CONNECTA. Les frais de livraison et les remboursements restent
à développer avant une mise en vente réelle.

Une réponse réseau perdue peut être réessayée avec le même panier et les mêmes
coordonnées : la clé conservée dans l'onglet évite une seconde réservation.
La page `/paiement?retour=1` permet de reprendre ou d'annuler une session connue.
Voir [la configuration Stripe du backend](https://github.com/said-oumakhlouf/connecta-api#stripe-checkout--mode-test).

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
Les anciennes commandes sont identifiées « sans Stripe » et conservent les actions
manuelles. Les nouvelles commandes en attente affichent l'expiration de leur
réservation et peuvent être annulées après fermeture de leur session Stripe.
Une commande payée en test est confirmée automatiquement et ne peut plus être
annulée avec le bouton de remise en stock : il faudra un parcours de remboursement.

Pour tester le réapprovisionnement, ajouter 20 unités dans l'admin. Réserver deux
unités laisse 18 disponibles ; annuler la session Stripe restitue les deux unités
une seule fois, même si la demande d'annulation est répétée.

## Fichiers principaux

- `components/shop/ShopProvider.tsx` : produit distant, état du panier et création de commande.
- `components/shop/CartDialog.tsx` : formulaire et préparation du paiement.
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
