import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const App = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const socketRef = useRef<any>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('username');

        if (storedUserId) {
            setUserId(storedUserId);
            const socket = io(SOCKET_SERVER_URL, { query: { userId: storedUserId } });
            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Connected to server');
            });

            socket.on('chat message', (msg) => {
                console.log('Received message FRONT:', msg);
                setMessages(prevMessages => [...prevMessages, msg]);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Logging', username, password);
        try {
            const response = await axios.post(`${SOCKET_SERVER_URL}/login`, { username, password });
            if (response.status === 200) {
                localStorage.setItem('username', username);
                setUserId(username);
                window.location.reload();
            }
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim()) {
            if (socketRef.current) {
                socketRef.current.emit('chat message', message);
                setMessage('');
            } else {
                console.error('Socket connection not established');
            }
        }
    };

    return (
        <div>
            {!userId ? (
                <div>
                    <h1>Login</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                </div>
            ) : (
                <>
                    <h1>Chat App</h1>
                    <form onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message"
                        />
                        <button type="submit">Send</button>
                    </form>
                    <div>
                        <h2>Messages:</h2>
                        {messages.map((msg, index) => (
                            <div key={index}>{msg}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
