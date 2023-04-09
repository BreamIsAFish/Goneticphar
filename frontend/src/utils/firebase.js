// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4O7LyqbFD7SACFVGD8rjwEWx_qPSalC4",
  authDomain: "cloud-final-81f62.firebaseapp.com",
  projectId: "cloud-final-81f62",
  storageBucket: "cloud-final-81f62.appspot.com",
  messagingSenderId: "226729555116",
  appId: "1:226729555116:web:4a21fd9ed5a041cf31db09",
  measurementId: "G-QYKCEVHSFE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

signInAnonymously(auth)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    // const errorCode = error.code;
    // console.log(errorCode);
    const errorMessage = error.message;
    console.log(errorMessage);
  });
