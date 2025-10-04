// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// On récupère les clés depuis les variables d'environnement.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On crée et exporte le client Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)