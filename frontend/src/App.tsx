import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Auth } from './auth';
import styles from './App.module.scss'

const SOCKET_SERVER_URL = 'http://localhost:5000';

const App = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const [isLogin, setToogleForm] = useState<boolean>(true);

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
        console.log('Received message from server:', msg);
        setMessages(prevMessages => [...prevMessages, msg]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);


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
    <div className={styles.body}>
      {!userId ? (<Auth isLogin={isLogin} toogleForm={setToogleForm} />) : (

        <div className={styles.main}>
          <div className={styles.listUsers}>
            <div className={styles.header} >
              Utilisateurs connectés
            </div>

            <div className={styles.users}>

            </div>

            <div className={styles.footer} >
              <button className={styles.btn} onClick={() => {
                localStorage.removeItem('username');
                window.location.reload();
              }}>
                Se déconnecter
              </button>
            </div>
          </div>

          <div className={styles.chat}>
            <div className={styles.header} >
              Chat Room
            </div>
            <div className={styles.chat}>
              {messages.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>

            <form onSubmit={sendMessage} className={styles.footer}>
              <input
                className={styles.input}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
              />
                <button type="submit" className={styles.btn}>Send</button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default App;