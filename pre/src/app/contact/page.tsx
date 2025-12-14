
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Thanks for reaching out. We will respond as soon as possible.');
    setShowToast(true);
    setEmail('');
    setMessage('');
    setTimeout(() => setShowToast(false), 3000);
  };

  const isFormValid = email && message;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage('Copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  const contactInfo = [
    { label: 'Email', value: 'precisionacademicw@gmail.com' },
    { label: 'Email', value: 'miraclemarkj@gmail.com' },
    { label: 'Phone', value: '+2347012897573' },
  ];

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
      <header style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem' }}>
          &#9776;
        </button>
      </header>
      <main style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          Precision Academic World
        </h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', width: '400px' }}>
          <label htmlFor="email" style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem' }}>Email Address</label>
          <input
            type="email"
            id="email"
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
          <label htmlFor="message" style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem' }}>How can we help?</label>
          <textarea
            id="message"
            placeholder="I’d like to know how Precision Academic World can help me with…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              backgroundColor: '#333',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              width: '100%',
              minHeight: '150px',
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
            Submit &gt;
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

      <footer style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p>These are my contact information:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contactInfo.map((item, index) => (
            <li key={index} style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>{item.value}</span>
              <button
                onClick={() => copyToClipboard(item.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                📋
              </button>
            </li>
          ))}
        </ul>
      </footer>

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
