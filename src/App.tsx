import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import AuthPage from "./pages/AuthPage";
import AppLayout from "./layout/AppLayout";
import ResetPasswordPage from './pages/ResetPasswordPage';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

type AppView = 'auth' | 'app' | 'resetPassword';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('auth');

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        setCurrentView('app');
      }
      setLoading(false);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // C'est la logique la plus fiable
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('resetPassword');
      } else if (event === 'SIGNED_IN') {
        setCurrentView('app');
      } else if (event === 'SIGNED_OUT') {
        setCurrentView('auth');
      }
    });

    // On écoute l'événement de Rust, qui va déclencher l'événement Supabase ci-dessus
    const unlisten = listen('deep-link-received', (event) => {
      const url = new URL(event.payload as string);
      const hash = new URLSearchParams(url.hash.substring(1));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');

      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    });

    return () => {
      subscription?.unsubscribe();
      unlisten.then(f => f());
    };
  }, []);

  if (loading) {
    return <div style={{backgroundColor: '#0A0A0F', height: '100vh', color: 'white', display: 'grid', placeContent: 'center'}}>Loading...</div>;
  }
  
  switch(currentView) {
    case 'app':
      return <AppLayout />;
    case 'resetPassword':
      return <ResetPasswordPage onPasswordUpdated={() => setCurrentView('app')} />;
    case 'auth':
    default:
      return <AuthPage />;
  }
}
export default App;