import React from 'react';

export default function SplashScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#4F46E5',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        📚
      </div>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '0.5rem',
        margin: 0
      }}>
        Student Portal
      </h1>
      <p style={{
        fontSize: '1rem',
        opacity: 0.9,
        margin: 0
      }}>
        Loading your dashboard...
      </p>
    </div>
  );
}
