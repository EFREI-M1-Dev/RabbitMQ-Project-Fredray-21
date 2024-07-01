### RabbitMQ Project - Guide d'Utilisation

Ce guide vous explique comment configurer et démarrer l'application RabbitMQ Project.  
Suivez les étapes ci-dessous pour installer RabbitMQ, démarrer l'application backend et frontend.

---

### Clonage du Répertoire

Clonez le repository depuis GitHub :

```bash
git clone https://github.com/EFREI-M1-Dev/RabbitMQ-Project-Fredray-21.git
```

Aller dans le dossier rabbitmq:
```bash
cd RabbitMQ-Project-Fredray-21/backend/src/rabbitmq
```

Construire l'image
```bash
docker build -t my-rabbitmq-image .
```

Exécuter Docker
```bash
docker run -d --name my-rabbitmq-container -p 5672:5672 -p 15672:15672 my-rabbitmq-image
```



## Gestion
- http://localhost:15672/


## Utilisateur par défaut
- Nom d'utilisateur: `guest`
- Mot de passe: `guest`


## Default Port
- 5672


# Démarrer le frontend
- http://localhost:4173/
```bash
cd frontend
npm install
npm run start:prod
```


# Démarrer le backend
```bash
cd backend
npm install
npm run start:prod
```

## Note :
Les fichiers `.env` ont été poussés sur le dépôt pour simplifier le rendu.
Il est évident qu'il est préférable d'éviter de faire cela dans les projets.


# Illustrations :

## 3 clients connecter qui chat
![illustration](https://github.com/EFREI-M1-Dev/RabbitMQ-Project-Fredray-21/blob/main/illustrationReadme/illustration.png?raw=true)

## Inscription et gestion d'erreurs
![inscription](https://github.com/EFREI-M1-Dev/RabbitMQ-Project-Fredray-21/blob/main/illustrationReadme/inscription.png?raw=true)

## Connexion
![connexion](https://github.com/EFREI-M1-Dev/RabbitMQ-Project-Fredray-21/blob/main/illustrationReadme/connexion.png?raw=true)

## Logs des actions
![logs](https://github.com/EFREI-M1-Dev/RabbitMQ-Project-Fredray-21/blob/main/illustrationReadme/log.png?raw=true)




# Rapport de Conception : Architecture du Système
## Introduction
Ce rapport présente l'architecture du système pour une application basée sur React et Node.js, utilisant Socket.IO pour la communication en temps réel et RabbitMQ pour la gestion des messages asynchrones. L'objectif principal est de fournir une plateforme de chat permettant aux utilisateurs de s'authentifier, de s'inscrire, et d'échanger des messages en direct.

## Architecture Générale
L'architecture de l'application est divisée en deux principales parties : le frontend (client) développé en React et le backend (serveur) développé en Node.js.

## Frontend (React)
Voici les composants clés du frontend :

**App Component :** Composant principal responsable du rendu global de l'application. Il inclut la gestion de l'état des messages, des utilisateurs connectés, et des interactions utilisateur comme l'envoi de messages et la gestion de l'authentification.

**Auth Component :** Gère le formulaire d'authentification et d'inscription. Il utilise Axios pour les requêtes HTTP vers le backend, vérifie les identifiants saisis, et stocke les informations d'utilisateur dans localStorage.

**Styling :** Les styles sont gérés à l'aide de Sass (scss) et le module de styles Auth.module.scss est utilisé pour les styles spécifiques au composant Auth.

## Backend (Node.js)
Il utilise Express comme framework web et Socket.IO pour la gestion des connexions en temps réel.

**Express Server :** Le serveur Express fournit des routes pour l'authentification (`/login`, `/register`) et sert les fichiers statiques.

**Socket.IO Server :** Gère les connexions WebSocket pour la communication bidirectionnelle entre le client et le serveur. Il permet l'échange de messages en temps réel et la mise à jour des utilisateurs connectés.

**RabbitMQ Integration :** Utilisé pour la gestion des messages asynchrones entre les utilisateurs. Chaque utilisateur a une file d'attente dédiée où les messages sont stockés et consommés en fonction des connexions WebSocket actives.

## Communication
La communication entre le frontend et le backend se fait principalement via des requêtes HTTP pour l'authentification et des WebSocket via Socket.IO pour la messagerie en temps réel. 

**Voici les principales interactions :**

**Authentification :** Le frontend envoie les identifiants d'utilisateur au backend via Axios. Le backend vérifie les informations et renvoie une réponse appropriée.

**Messagerie en Temps Réel :** Une fois authentifié, le frontend établit une connexion WebSocket avec le serveur via Socket.IO. Les messages sont envoyés au backend via cette connexion et sont diffusés à tous les utilisateurs connectés.

**Gestion des Utilisateurs :** Le backend maintient une liste des utilisateurs connectés et met à jour cette liste en temps réel grâce à Socket.IO.

## Sécurité
La sécurité de l'application est prise en compte à plusieurs niveaux :

**Authentification :** Les informations d'identification sont vérifiées côté serveur pour éviter les accès non autorisés.

**Protection des Données :** Les messages transitant via WebSocket sont sécurisés en utilisant des connexions chiffrées (HTTPS) et des pratiques de sécurité recommandées pour la gestion des données sensibles.

## Améliorations Futures
Pour améliorer l'application, plusieurs points peuvent être envisagés :

**Gestion des Erreurs :** Améliorer la gestion des erreurs pour une meilleure expérience utilisateur et une détection proactive des problèmes.

**Optimisation des Performances :** Optimiser le code pour des performances accrues, notamment en termes de rapidité de chargement et de réactivité.

**Extensions Fonctionnelles :** Ajouter des fonctionnalités telles que la gestion de salons de discussion, la possibilité d'envoyer des fichiers, ou des fonctionnalités de modération.

# Conclusion
En résumé, l'architecture du système présentée permet de fournir une plateforme robuste et évolutive pour un système de chat en temps réel. En utilisant des technologies modernes comme React, Node.js, Socket.IO et RabbitMQ, l'application offre une expérience utilisateur fluide et interactive tout en répondant aux exigences de sécurité et de performance.

Ce rapport établit les bases nécessaires pour le développement et l'extension futures de l'application de chat.
