// Importe des modules externes
import axios from 'axios';
import consola from 'consola';
import dotenv from 'dotenv';
dotenv.config();

// Défini l'URL de RabbitMQ, en utilisant une variable d'environnement si disponible, ou en se basant sur localhost par défaut
const rabbitmqUrl = process.env.RABBITMQ_URL || 'http://localhost:15672';
// Défini les identifiants de l'utilisateur admin pour RabbitMQ, en utilisant des variables d'environnement
const userAdmin = { username: process.env.RABBITMQ_USER, password: process.env.RABBITMQ_PASSWORD };

// Journalise les identifiants de l'utilisateur admin de RabbitMQ (à des fins de débogage)
console.log('URL de RabbitMQ:', userAdmin);

// Exporte la fonction register pour gérer les demandes d'inscription utilisateur
export const register = async (req, res) => {
    try {
        // Extrait le nom d'utilisateur et le mot de passe du corps de la requête
        const { username, password } = req.body;

        // Vérifie si le nom d'utilisateur ou le mot de passe est manquant, et renvoie un statut 400 avec un message d'erreur si c'est le cas
        if (!username || !password) {
            return res.status(400).json({ error: "Nom d'utilisateur ou mot de passe manquant" });
        }

        // Défini le corps de la requête pour la création de l'utilisateur
        const userBody = {
            password,
            tags: `management`,
        };

        // Configure les en-têtes pour la requête HTTP, y compris l'authentification Basic et le type de contenu
        const headers = {
            "Authorization": `Basic ${Buffer.from(Object.values(userAdmin).join(':')).toString('base64')}`,
            'Content-Type': 'application/json',
        };

        // Journalise les en-têtes utilisés pour la requête (à des fins de débogage)
        consola.info("Ajout de l'utilisateur", headers);

        // Fait une requête PUT à l'API RabbitMQ pour créer l'utilisateur
        const result = await axios.put(`${rabbitmqUrl}/api/users/${username}`, userBody, { headers });

        // Vérifie si la création de l'utilisateur n'a pas réussi, et renvoie le statut approprié et le message d'erreur
        if (result.status !== 201) {
            return res.status(result.status).json({ error: `Échec de l'ajout de l'utilisateur : ${result.data}` });
        }

        // Si réussi, renvoie un statut 201 avec un message de succès
        return res.status(201).json({ message: `Utilisateur ${username} ajouté avec succès` });

    } catch (error: unknown) {
        // Journalise toutes les erreurs qui se produisent pendant le processus d'inscription
        consola.error("Erreur lors de l'inscription", error);
        
        // Vérifie si l'objet erreur contient une propriété response (indiquant une erreur HTTP)
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const errorResponse = (error as { response: { status: number, data?: any } }).response;
            const status = errorResponse.status;
            const errorMessage = errorResponse.data?.message || "Erreur lors de l'inscription";
            
            // Renvoie le statut et le message d'erreur de la réponse d'erreur
            res.status(status).json({ message: errorMessage, error });
        } else {
            // Si l'erreur ne contient pas de propriété response, renvoie un statut 500 avec un message d'erreur générique
            res.status(500).json({ message: "Erreur lors de l'inscription", error });
        }
    }
};
