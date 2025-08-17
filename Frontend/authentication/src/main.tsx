import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Home/Home';

import Login from './auth/Login.tsx'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeApp } from "firebase/app";
import Signup from './auth/Signup.tsx'
import AuthRoute from './AuthRoute.tsx'

const firebaseConfig = {
  apiKey: "AIzaSyB5jXKhxFaiP4eAM8w_IAOJR6gG7ijZDbk",
  authDomain: "mychat-794fb.firebaseapp.com",
  projectId: "mychat-794fb",
  storageBucket: "mychat-794fb.firebasestorage.app",
  messagingSenderId: "798826129568",
  appId: "1:798826129568:web:917ae6b16e98152213c1c5"
};

initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AuthRoute><App/></AuthRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Home" element={<AuthRoute><App/></AuthRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </React.StrictMode>
)
