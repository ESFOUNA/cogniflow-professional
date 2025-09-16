// src/pages/DashboardPage.tsx
import './DashboardPage.css';

// On définit un type pour nos objets "Ritual" pour être clair et précis.
type Ritual = {
  id: number;
  name: string;
  description: string;
};

// Voici nos données "en dur". Plus tard, elles viendront de Supabase.
const mockRituals: Ritual[] = [
  {
    id: 1,
    name: '🚀 Morning Focus',
    description: 'Prepare the workspace for a deep work session on the main project.',
  },
  {
    id: 2,
    name: '📚 Learning Hour',
    description: 'Open all necessary resources to study a new technology.',
  },
  {
    id: 3,
    name: '✉️ Email Triage',
    description: 'A quick ritual to process the inbox and nothing else.',
  }
];

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Launch a Ritual</h1>
        <p>Choose a ritual to prepare your workspace and start a focus session.</p>
      </header>

      <div className="rituals-container">
        {/* On utilise .map() pour transformer notre tableau de données en une liste de composants JSX. */}
        {mockRituals.map((ritual) => (
          // La 'key' est très importante pour que React gère efficacement la liste.
          <div key={ritual.id} className="ritual-card" onClick={() => alert(`Launching ${ritual.name}...`)}>
            <h3>{ritual.name}</h3>
            <p>{ritual.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;