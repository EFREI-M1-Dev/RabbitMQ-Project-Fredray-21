// Importe des modules externes
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App/App.tsx';
import './main.scss'

// Crée un élément racine pour rendre l'application React dans le DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  // Utilise React.StrictMode pour activer des vérifications et des avertissements supplémentaires pour l'application
  <React.StrictMode>
    {/* Rend le composant App comme racine de l'application React */}
    <App />
  </React.StrictMode>,
)
