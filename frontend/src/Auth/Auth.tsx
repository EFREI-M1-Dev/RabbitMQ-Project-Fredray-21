// Importe des modules externes
import axios from "axios";
import { useState } from "react";
import styles from './Auth.module.scss';

// Définit le composant Auth, qui prend des props pour déterminer si le formulaire est en mode de connexion et une fonction pour basculer le mode du formulaire
export const Auth = (props: { isLogin: boolean; toogleForm: (isLogin: boolean) => void; }) => {
    // Définit les variables d'état pour le nom d'utilisateur, le mot de passe, le mot de passe de confirmation et les messages d'erreur
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Gère la soumission du formulaire de connexion
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Effectue une requête POST vers le point de terminaison de connexion avec le nom d'utilisateur et le mot de passe
            const response = await axios.post(`${import.meta.env.VITE_SOCKET_SERVER_URL}/login`, { username, password });
            if (response.status === 200) {
                // Si la connexion réussit, stocke le nom d'utilisateur dans localStorage, efface les erreurs, et recharge la page
                localStorage.setItem('username', username);
                setError('');
                window.location.reload();
            }
        } catch (error) {
            // Gère les erreurs lors de la connexion
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const errorResponse = (error as { response: { status: number } }).response;
                if (errorResponse.status === 401) {
                    setError('Identifiants invalides');
                }
            } else {
                setError('Une erreur est survenue');
            }
            console.error('Échec de la connexion', error);
        }
    };

    // Gère la soumission du formulaire d'inscription
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // Vérifie si les mots de passe correspondent, et définit une erreur s'ils ne correspondent pas
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        try {
            // Effectue une requête POST vers le point de terminaison d'inscription avec le nom d'utilisateur et le mot de passe
            const response = await axios.post(`${import.meta.env.VITE_SOCKET_SERVER_URL}/register`, { username, password });
            if (response.status === 201) {
                // Si l'inscription réussit, stocke le nom d'utilisateur dans localStorage, efface les erreurs, et recharge la page
                localStorage.setItem('username', username);
                setError('');
                window.location.reload();
            }
        } catch (error) {
            // Gère les erreurs lors de l'inscription
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const errorResponse = (error as { response: { status: number } }).response;
                if (errorResponse.status === 409) {
                    setError('Utilisateur existe déjà');
                }
            } else {
                setError('Une erreur est survenue');
            }
            console.error('Échec de l\'inscription', error);
        }
    }

    // Rend le formulaire de connexion si la prop isLogin est true
    if (props.isLogin) {
        return (
            <form onSubmit={handleLogin} className={styles.form}>
                <h1>Connexion</h1>
                {error && <p className={styles.error}>{error}</p>}
                <input
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                />
                <button type="submit" className={styles.btn}>Connexion</button>
                <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.toogleForm(false);
                }}>Passer à l'inscription</button>
            </form>
        )
    } else {
        // Rend le formulaire d'inscription si la prop isLogin est false
        return (
            <form onSubmit={handleRegister} className={styles.form}>
                <h1>Inscription</h1>
                {error && <p className={styles.error}>{error}</p>}
                <input
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    required
                />
                <button type="submit" className={styles.btn}>Inscription</button>
                <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.toogleForm(true);
                }}>Passer à la connexion</button>
            </form>
        )
    }
}
