import consola from 'consola';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const rabbitmqUrl = process.env.RABBITMQ_URL || 'http://localhost:15672';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const headers = {
      "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };

    await axios.get(`${rabbitmqUrl}/api/whoami`, { headers });

    return res.status(200).json({ message: `User ${username} logged in successfully` });


  } catch (error: unknown) {
    consola.error('Error logging in', error);
    
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const errorResponse = (error as { response: { status: number, data?: any } }).response;
        const status = errorResponse.status;
        const errorMessage = errorResponse.data?.message || 'Error logging in';
        
        res.status(status).json({ message: errorMessage, error });
    } else {
        res.status(500).json({ message: 'Error logging in', error });
    }
}
};