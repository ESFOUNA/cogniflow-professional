// src/App.tsx

import { useState, useEffect } from 'react';
import AuthPage from "./pages/AuthPage";
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Le composant Dashboard pour les utilisateurs connectés
function Dashboard({ session }: { session: Session }) {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Welcome, you are logged in!</h1>
      <p>Votre email est : {session.user.email}</p>
      <button 
        onClick={() => supabase.auth.signOut()}
        style={{ padding: '10px', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  );
}

// Le composant pour les utilisateurs non connectés
function LandingPage() {
  return <AuthPage />;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{color: 'white', padding: '20px'}}>Loading...</div>;
  }

  return (
    <div>
      {session ? <Dashboard session={session} /> : <LandingPage />}
    </div>
  );
}

export default App;