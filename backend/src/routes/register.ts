import axios from 'axios';
import consola from 'consola';
import dotenv from 'dotenv';
dotenv.config();

const rabbitmqUrl = process.env.RABBITMQ_URL || 'http://localhost:15672';
const userAdmin = { username: process.env.RABBITMQ_USER, password: process.env.RABBITMQ_PASSWORD };

console.log('RabbitMQ URL:', userAdmin);

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        const userBody = {
            password,
            tags: `management`,
        };

        const headers = {
            "Authorization": `Basic ${Buffer.from(Object.values(userAdmin).join(':')).toString('base64')}`,
            'Content-Type': 'application/json',
        };

        consola.info('Adding user', headers);

        const result = await axios.put(`${rabbitmqUrl}/api/users/${username}`, userBody, { headers });

        if (result.status !== 201) {
            return res.status(result.status).json({ error: `Failed to add user: ${result.data}` });
        }

        return res.status(201).json({ message: `User ${username} added successfully` });

    } catch (error) {
        consola.error('Error registering user', error);
        return res.status(error.response.status).json({ error: `Failed to add user: ${error.response.data}` });
    }
};