// Importe des modules externes
import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import consola from 'consola';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import amqp from 'amqplib/callback_api';
import { login, register } from './routes';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Crée une application Express
const app = express();
const server = http.createServer(app);

// Configure un serveur Socket.IO avec la configuration CORS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Définit le port et l'intervalle de réessai pour la connexion à RabbitMQ
const PORT = process.env.PORT || 5000;
const INTERVAL_RETRY = 5000;

// Journalise le message de démarrage du serveur
consola.info('Démarrage du serveur...', { port: PORT });

// Configuration des middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes pour l'inscription et la connexion des utilisateurs
app.post('/register', register);
app.post('/login', login);

// Définit le nom de l'échange RabbitMQ
export const EXCHANGE_APP = 'exchange_app';

// Dictionnaire pour stocker les consommateurs actifs par utilisateur
const activeConsumers = new Map();
// Dictionnaire pour stocker les utilisateurs connectés
const connectedUsers = new Map();

// Fonction pour se connecter à RabbitMQ
const connectToRabbitMQ = () => {
    amqp.connect(`amqp://localhost`, (error0, connection) => {
        if (error0) {
            // Réessaie la connexion après un délai en cas d'erreur
            return setTimeout(connectToRabbitMQ, INTERVAL_RETRY);
        }

        // Crée un canal (channel) dans la connexion RabbitMQ
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            // Déclare un échange durable
            channel.assertExchange(EXCHANGE_APP, 'fanout', { durable: true });

            // Gère les nouvelles connexions client via Socket.IO
            io.on('connection', (socket) => {
                consola.info('Client connecté');

                // Extrait l'ID utilisateur (userId) de la requête de poignée de main du socket
                const userId = socket.handshake.query.userId;
                connectedUsers.set(socket.id, userId);
                // Émet une mise à jour à tous les clients avec la liste des utilisateurs connectés
                io.emit('update users', Array.from(connectedUsers.values()));

                // Définit une file d'attente unique pour l'utilisateur
                const userQueue = `queue_${userId}`;
                channel.assertQueue(userQueue, { durable: true });
                channel.bindQueue(userQueue, EXCHANGE_APP, '');

                // Consomme les messages de la file d'attente de l'utilisateur
                channel.consume(
                    userQueue,
                    (message) => {
                        if (!message || message.content.toString().trim() === '') return;
                        const msgContent = JSON.parse(message.content.toString());
                        consola.info(`Message consommé depuis RabbitMQ: ${msgContent.userId} - ${msgContent.message}`);
                        // Émet le message vers le client
                        socket.emit('chat message', msgContent);
                    },
                    { noAck: true },
                    (error2, { consumerTag }) => {
                        if (error2) {
                            throw error2;
                        }
                        activeConsumers.set(userId, consumerTag);
                        consola.info(`Consommateur créé pour l'utilisateur ${userId}`);
                    }
                );

                // Gère les messages de chat entrants depuis le client
                socket.on('chat message', (msg) => {
                    consola.info(`Message reçu du client: ${msg.userId} - ${msg.message}`);
                    // Publie le message vers l'échange RabbitMQ
                    channel.publish(EXCHANGE_APP, '', Buffer.from(JSON.stringify(msg)), { persistent: true });
                    consola.info(`Message envoyé à RabbitMQ: ${msg.userId} - ${msg.message}`);
                });

                // Gère la déconnexion du client
                socket.on('disconnect', () => {
                    consola.info('Client déconnecté');

                    const consumerTag = activeConsumers.get(userId);
                    if (consumerTag) {
                        // Annule le consommateur s'il existe
                        channel.cancel(consumerTag, (error3) => {
                            if (error3) {
                                throw error3;
                            }
                            activeConsumers.delete(userId);
                        });
                    }

                    // Supprime l'utilisateur de la liste des utilisateurs connectés
                    connectedUsers.delete(socket.id);
                    // Émet une mise à jour à tous les clients avec la liste des utilisateurs connectés
                    io.emit('update users', Array.from(connectedUsers.values()));
                });
            });

            consola.success('Connecté à RabbitMQ');
        });
    });
};

// Lance la connexion RabbitMQ
connectToRabbitMQ();

// Lance le serveur et écoute sur le port défini
server.listen(PORT, () => {
    consola.success(`Serveur démarré sur le port ${PORT}`);
});
