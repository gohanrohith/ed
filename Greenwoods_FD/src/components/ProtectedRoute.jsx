// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken'); // Or any method to check auth

  if (!authToken) {
    // If there's no auth token, redirect to login page
    return <Navigate to="/" />;
  }

  return children; // If there's an auth token, render the child components (e.g., Dashboard)
};

export default ProtectedRoute;
