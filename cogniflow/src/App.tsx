// src/App.tsx

import { useState, useEffect } from 'react';
import AuthPage from "./pages/AuthPage";
import AppLayout from "./layout/AppLayout"; // On importe le layout
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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
    return <div style={{backgroundColor: 'var(--bg-deep-space)', height: '100vh'}} />;
  }

  // Si l'utilisateur est connecté, on affiche le Layout avec la barre de navigation
  // Sinon, on affiche la page d'authentification
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {session ? <AppLayout /> : <AuthPage />}
    </div>
  );
}

export default App;