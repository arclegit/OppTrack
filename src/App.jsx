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

  const [applications, setApplications] = useState(() => {
    const savedApplications = localStorage.getItem(
      "oppTrackApplications"
    );

    return savedApplications ? JSON.parse(savedApplications) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "oppTrackSavedOpportunities",
      JSON.stringify(savedOpportunities)
    );
  }, [savedOpportunities]);

  useEffect(() => {
    localStorage.setItem(
      "oppTrackApplications",
      JSON.stringify(applications)
    );
  }, [applications]);

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCurrentView("discover");
  };

  const handleTrackApplication = (opportunity) => {
    const alreadyTracked = applications.some(
      (application) =>
        application.opportunityId === opportunity.id
    );

    if (alreadyTracked) {
      return;
    }

    const newApplication = {
      opportunityId: opportunity.id,
      status: "Interested",
      appliedDate: null,
      notes: "",
      followUpDate: null
    };

    setApplications([
      ...applications,
      newApplication
    ]);
  };

  const handleApplicationStatusChange = (
    opportunityId,
    newStatus
  ) => {
    setApplications(
      applications.map((application) => {
        if (application.opportunityId !== opportunityId) {
          return application;
        }

        const updatedApplication = {
          ...application,
          status: newStatus
        };

        if (
          newStatus === "Applied" &&
          application.appliedDate === null
        ) {
          const today = new Date();

          const todayString =
            today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0");

          updatedApplication.appliedDate = todayString;
        }

        return updatedApplication;
      })
    );
  };

  const handleApplicationUpdate = (
    opportunityId,
    field,
    value
  ) => {
    setApplications(
      applications.map((application) =>
        application.opportunityId === opportunityId
          ? {
              ...application,
              [field]: value
            }
          : application
      )
    );
  };

  const handleStopTracking = (opportunityId) => {
    setApplications(
      applications.filter(
        (application) =>
          application.opportunityId !== opportunityId
      )
    );
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
          applications={applications}
          onView={handleViewOpportunity}
          onTrackApplication={handleTrackApplication}
          onApplicationStatusChange={
            handleApplicationStatusChange
          }
          onApplicationUpdate={handleApplicationUpdate}
          onStopTracking={handleStopTracking}
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard
          savedOpportunities={savedOpportunities}
          applications={applications}
        />
      )}
    </div>
  );
}

export default App;