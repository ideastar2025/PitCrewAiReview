import React from 'react'
import Login from '../components/Login'
import AuthCallback from '../pages/AuthCallback'
import Dashboard from '../pages/Dashboard'

const AuthRoutes = () => {
  return [
    {
        path: '/',
        element: <Login />,

    },
    {
        path: '/auth/callback',
        element: <AuthCallback />
    },
    {                                               
        path: '/dashboard',
        element: <Dashboard />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/auth/callback',
        element: <AuthCallback />
    }
  ];
}

export default AuthRoutes