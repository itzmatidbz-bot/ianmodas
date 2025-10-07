// Reemplaza estos valores con los de tu proyecto en Supabase
const SUPABASE_URL = "https://pjiowpqycroahjfypzug.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaW93cHF5Y3JvYWhqZnlwenVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTEyNzYsImV4cCI6MjA3NDcyNzI3Nn0.kctijgjRwnXBJQMlZ3vZ1KUvDf4k8zYlCnwUZpQ0Cb0";

// Crear una única instancia del cliente de Supabase
const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
