// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBRF9c9dXwbujt1Z9EHfLWj1V5Anws-vSo',
    authDomain: 'infortune-rpg-tools.firebaseapp.com',
    projectId: 'infortune-rpg-tools',
    storageBucket: 'infortune-rpg-tools.firebasestorage.app',
    messagingSenderId: '92115534601',
    appId: '1:92115534601:web:d082b69c17460c30b909d8',
    measurementId: 'G-QQ2ZVHXCVC',
  },
};

// Initialize Firebase
const app = initializeApp(environment.firebase);
const analytics = getAnalytics(app);
