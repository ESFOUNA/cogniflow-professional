// src/App.tsx

import { useState, useEffect } from 'react';
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage"; // On importe la nouvelle page
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
    // Un simple écran de chargement
    return <div style={{backgroundColor: '#0A0A0F', height: '100vh'}} />;
  }

  // La logique est la même, mais on affiche un composant différent.
  return (
    <div>
      {!session ? <AuthPage /> : <DashboardPage />}
    </div>
  );
}

export default App;