export const environment = {
  production: true,
  apiUrl: 'https://lamed-backend-957958728332.southamerica-east1.run.app', // TODO: Substituir pela URL real do Cloud Run após deploy
  firebase: {
    projectId: 'lamed-148',
    appId: '1:957958728332:web:54e2654652c944048729a9',
    storageBucket: 'lamed-148.firebasestorage.app',
    apiKey: 'AIzaSyA-O5OuinkLc_Jjh2H66SAMvASSMLjn-Ew', // Public Key (com restrições de domínio configuradas no GCP)
    authDomain: 'lamed-148.firebaseapp.com',
    messagingSenderId: '957958728332',
    measurementId: 'G-6XRD5FCRNY'
  }
};
