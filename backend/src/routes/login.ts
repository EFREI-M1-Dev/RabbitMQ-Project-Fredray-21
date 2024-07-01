// Importe des modules externes
import consola from 'consola';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Défini l'URL de RabbitMQ, en utilisant une variable d'environnement si disponible, ou en se basant sur localhost par défaut
const rabbitmqUrl = process.env.RABBITMQ_URL || 'http://localhost:15672';

// Exporte la fonction login pour gérer les demandes de connexion utilisateur
export const login = async (req, res) => {
  try {
    // Extrait le nom d'utilisateur et le mot de passe du corps de la requête
    const { username, password } = req.body;

    // Vérifie si le nom d'utilisateur ou le mot de passe est manquant, et renvoie un statut 400 avec un message d'erreur si c'est le cas
    if (!username || !password) {
      return res.status(400).json({ error: "Nom d'utilisateur ou mot de passe manquant" });
    }

    // Configure les en-têtes pour la requête HTTP, y compris l'authentification Basic et le type de contenu
    const headers = {
      "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };

    // Fait une requête GET à l'API RabbitMQ pour vérifier les identifiants de l'utilisateur
    await axios.get(`${rabbitmqUrl}/api/whoami`, { headers });

    // Si réussi, renvoie un statut 200 avec un message de succès
    return res.status(200).json({ message: `Utilisateur ${username} connecté avec succès` });

  } catch (error: unknown) {
    // Journalise toutes les erreurs qui se produisent pendant le processus de connexion
    consola.error('Erreur lors de la connexion', error);

    // Vérifie si l'objet erreur contient une propriété response (indiquant une erreur HTTP)
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const errorResponse = (error as { response: { status: number, data?: any } }).response;
        const status = errorResponse.status;
        const errorMessage = errorResponse.data?.message || 'Erreur lors de la connexion';

        // Renvoie le statut et le message d'erreur de la réponse d'erreur
        res.status(status).json({ message: errorMessage, error });
    } else {
        // Si l'erreur ne contient pas de propriété response, renvoie un statut 500 avec un message d'erreur générique
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
  }
};
