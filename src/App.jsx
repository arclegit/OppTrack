import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SavedOpportunities from "./components/SavedOpportunities";
import Dashboard from "./components/Dashboard";

function App() {
  const [currentView, setCurrentView] = useState("discover");

  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const [savedOpportunities, setSavedOpportunities] = useState(() => {
    const saved = localStorage.getItem("oppTrackSavedOpportunities");

    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "oppTrackSavedOpportunities",
      JSON.stringify(savedOpportunities)
    );
  }, [savedOpportunities]);

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCurrentView("discover");
  };

  return (
    <div>
      <Navbar onNavigate={setCurrentView} />

      {currentView === "discover" && (
        <HomePage
          savedOpportunities={savedOpportunities}
          setSavedOpportunities={setSavedOpportunities}
          selectedOpportunity={selectedOpportunity}
          setSelectedOpportunity={setSelectedOpportunity}
        />
      )}

      {currentView === "saved" && (
        <SavedOpportunities
          savedOpportunities={savedOpportunities}
          onView={handleViewOpportunity}
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard
          savedOpportunities={savedOpportunities}
        />
      )}
    </div>
  );
}

export default App;