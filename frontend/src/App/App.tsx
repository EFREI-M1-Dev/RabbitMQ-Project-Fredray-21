import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Auth } from '../Auth/Auth';
import styles from './App.module.scss';

interface Message {
  message: string;
  userId: string;
}

const App = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const chatMsgRef = useRef<HTMLDivElement>(null);

  const [isLogin, setToogleForm] = useState<boolean>(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('username');

    if (storedUserId) {
      setUserId(storedUserId);
      const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, { query: { userId: storedUserId } });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('chat message', (msg) => {
        console.log('Received message from server:', msg);
        setMessages(prevMessages => [msg, ...prevMessages]); // Add new message at the start
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (chatMsgRef.current) {
      chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      if (socketRef.current) {
        const userId = localStorage.getItem('username');
        socketRef.current.emit('chat message', { message, userId });
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
            <div className={styles.header}>
              Utilisateurs connectés
            </div>
            <div className={styles.users}>
              {/* Display connected users */}
            </div>
            <div className={styles.footer}>
              <button className={styles.btn} onClick={() => {
                localStorage.removeItem('username');
                window.location.reload();
              }}>
                Se déconnecter
              </button>
            </div>
          </div>
          <div className={styles.chat}>
            <div className={styles.header}>
              Chat Room
            </div>
            <div className={styles.chatMsg} ref={chatMsgRef}>
              {messages.map((msg, index) => {
                const isMe = msg.userId === userId;
                const messageClass = isMe ? styles.message + " " + styles.myMessage : styles.message;
                return (
                  <div key={index} className={messageClass}>
                    <span>{msg.userId}</span>
                    <p>{msg.message}</p>
                  </div>
                );
              })}
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
