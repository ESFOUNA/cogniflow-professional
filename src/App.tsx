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

  // Fonction pour traiter les URLs de deep link
  const handleDeepLink = (urlString: string) => {
    try {
      const url = new URL(urlString);
      const hashParams = new URLSearchParams(url.hash.substring(1));
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (accessToken && refreshToken) {
        // Stocker les tokens et définir la session
        supabase.auth.setSession({ 
          access_token: accessToken, 
          refresh_token: refreshToken 
        }).then(({ data, error }) => {
          if (!error && data.session) {
            // Si le type est "recovery", cela signifie que c'est un lien de réinitialisation de mot de passe
            if (type === 'recovery') {
              setCurrentView('resetPassword');
            }
          }
        });
      }
    } catch (e) {
      console.error('Error parsing deep link:', e);
    }
  };

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
        if (session && !session.user.email_confirmed_at) {
          // Si l'email n'est pas confirmé, rester sur auth
          setCurrentView('auth');
        } else {
          setCurrentView('app');
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentView('auth');
      }
    });

    // Écouter les deep linksvenus de Rust
    const unlisten = listen<string>('deep-link-received', (event) => {
      handleDeepLink(event.payload);
    });

    // Vérifier également l'URL au démarrage de l'application (pour macOS)
    // Lancer l'analyse des arguments de ligne de commande
    const checkStartupUrl = async () => {
      // Sur certaines plateformes, l'URL peut être passée en argument
      const args = await import('@tauri-apps/api/path');
      // Cette partie dépend de la plateforme
    };

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