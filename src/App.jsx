// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './login';
import Dashboard from './Dashboard';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the current session using the new getSession() API (for Supabase v2)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
