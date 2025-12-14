"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Sign-up successful!');
    setShowToast(true);
    setEmail('');
    setPassword('');
    setTimeout(() => setShowToast(false), 3000);
  };

  const isFormValid = email && password;

  return (
    <div style={{
      backgroundColor: 'black',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <main style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          Create your account
        </h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', width: '300px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              backgroundColor: '#333',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              width: '100%',
              marginBottom: '1rem',
            }}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              backgroundColor: '#333',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              width: '100%',
              marginBottom: '1rem',
            }}
          />
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              backgroundColor: isFormValid ? 'green' : '#333',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              width: '100%',
            }}
          >
            Submit
          </button>
        </form>
        <Link href="/">
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginTop: '1rem',
          }}>
            &lt; Back to Home
          </button>
        </Link>
      </main>

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          backgroundColor: 'green',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '0.5rem',
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
