import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import consola from 'consola';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import amqp from 'amqplib/callback_api';
import { login, register } from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5000;

consola.info('Starting server...', { port: PORT });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.post('/register', register);
app.post('/login', login);

export const EXCHANGE_APP = 'exchange_app';

// Dictionary to store active consumers per user
const activeConsumers = new Map();

const connectToRabbitMQ = () => {
    amqp.connect(`amqp://localhost`, (error0, connection) => {
        if (error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            channel.assertExchange(EXCHANGE_APP, 'fanout', { durable: true });

            io.on('connection', (socket) => {
                consola.info('Client connected');

                const userId = socket.handshake.query.userId;
                const userQueue = `queue_${userId}`;
                // const userRoutingKey = `key_${userId}`;

                // Assert user's queue
                channel.assertQueue(userQueue, { durable: true });
                channel.bindQueue(userQueue, EXCHANGE_APP, '');

                // Create consumer for user's queue
                channel.consume(
                    userQueue,
                    (message) => {
                        if (!message || message.content.toString().trim() === '') return;
                        const msgContent = message.content.toString();
                        consola.info(`Consumed message from RabbitMQ: ${msgContent}`);
                        socket.emit('chat message', msgContent);
                    },
                    { noAck: true },
                    (error2, { consumerTag }) => {
                        if (error2) {
                            throw error2;
                        }
                        activeConsumers.set(userId, consumerTag);
                        consola.info(`Consumer created for user ${userId}`);
                    }
                );


                socket.on('chat message', (msg) => {
                    consola.info(`Received message from client: ${msg}`);
                    channel.publish(EXCHANGE_APP, '', Buffer.from(msg), { persistent: true });
                    consola.info(`Sent message to RabbitMQ: ${msg}`);
                });

                socket.on('disconnect', () => {
                    consola.info('Client disconnected');

                    const consumerTag = activeConsumers.get(userId);
                    if (consumerTag) {
                        channel.cancel(consumerTag, (error3) => {
                            if (error3) {
                                throw error3;
                            }
                            activeConsumers.delete(userId);
                        });
                    }
                });
            });

            consola.success('Connected to RabbitMQ');
        });
    });
};

connectToRabbitMQ();

server.listen(PORT, () => {
    consola.success(`Server started on port ${PORT}`);
});


//TODO:
// - FAIRE LE FRONT=
// - Ajouter une BDD pour les utilisateurs
// - Ajouter une BDD pour les messages