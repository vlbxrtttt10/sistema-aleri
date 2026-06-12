import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13.5px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid transparent',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                borderColor: '#bbf7d0',
              },
              iconTheme: {
                primary: '#af2154',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                borderColor: '#fecaca',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              style: {
                background: '#eff6ff',
                color: '#1e40af',
                borderColor: '#bfdbfe',
              },
              iconTheme: {
                primary: '#af2154',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
