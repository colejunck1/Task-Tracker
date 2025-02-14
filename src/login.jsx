// src/login.jsx
import { useState } from 'react';
import { supabase } from './supabaseClient';

function Login() {
  console.log("Login component rendered");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Error signing in:", error);
      setErrorMsg(error.message);
    } else {
      console.log("Successfully signed in:", data);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '1rem', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      backgroundColor: '#fff', 
      color: '#000' 
    }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
          required
        />
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
