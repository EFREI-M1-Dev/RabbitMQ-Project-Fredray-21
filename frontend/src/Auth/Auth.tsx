import axios from "axios";
import { useState } from "react";
import styles from './Auth.module.scss';

export const Auth = (props:
    {
        isLogin: boolean;
        toogleForm: (isLogin: boolean) => void;
    }
) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_SOCKET_SERVER_URL}/login`, { username, password });
            if (response.status === 200) {
                localStorage.setItem('username', username);
                setError('');
                window.location.reload();
            }
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const errorResponse = (error as { response: { status: number } }).response;
                if (errorResponse.status === 401) {
                    setError('Invalid credentials');
                }
            } else {
                setError('An error occurred');
            }
            console.error('Login failed', error);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_SOCKET_SERVER_URL}/register`, { username, password });
            if (response.status === 201) {
                localStorage.setItem('username', username);
                setError('');
                window.location.reload();
            }
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const errorResponse = (error as { response: { status: number } }).response;
                if (errorResponse.status === 409) {
                    setError('User already exists');
                }
            } else {
                setError('An error occurred');
            }
            console.error('Register failed', error);
        }
    }


    if (props.isLogin) {
        return (
            <form onSubmit={handleLogin} className={styles.form}>
                <h1>Login</h1>
                {error && <p className={styles.error}>{error}</p>}
                <input
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit" className={styles.btn}>Login</button>
                <button type="button" className={styles.btn + " " + styles.secondary} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.toogleForm(false);
                }}>Switch to Register</button>
            </form>
        )
    } else {
        return (
            <form onSubmit={handleRegister} className={styles.form}>
                <h1>Register</h1>
                {error && <p className={styles.error}>{error}</p>}
                <input
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
                <button type="submit" className={styles.btn}>Register</button>
                <button type="button" className={styles.btn + " " + styles.secondary} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.toogleForm(true);
                }}>Switch to Login</button>
            </form>
        )
    }
}
