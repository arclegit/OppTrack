import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SavedOpportunities from "./components/SavedOpportunities";
import Dashboard from "./components/Dashboard";

const API_URL = "http://localhost:5000/api";

function App() {
  const [currentView, setCurrentView] = useState("discover");

  const [selectedOpportunity, setSelectedOpportunity] =
    useState(null);

  const [savedOpportunities, setSavedOpportunities] =
    useState([]);

  const [applications, setApplications] = useState([]);
  

  // Load saved opportunities from PostgreSQL
  useEffect(() => {
    const loadSavedOpportunities = async () => {
      try {
        const response = await fetch(
          `${API_URL}/saved-opportunities`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch saved opportunities"
          );
        }

        const data = await response.json();

        setSavedOpportunities(data);
      } catch (error) {
        console.error(
          "Error loading saved opportunities:",
          error
        );
      }
    };

    loadSavedOpportunities();
  }, []);

  // Load applications from PostgreSQL
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await fetch(
          `${API_URL}/applications`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch applications"
          );
        }

        const data = await response.json();

        const formattedApplications = data.map(
          (application) => ({
            id: application.id,
            opportunityId:
              application.opportunityId,
            status: application.status,
            appliedDate:
              application.appliedDate || null,
            notes: application.notes || "",
            followUpDate:
              application.followUpDate || null
          })
        );

        setApplications(formattedApplications);
      } catch (error) {
        console.error(
          "Error loading applications:",
          error
        );
      }
    };

    loadApplications();
  }, []);

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCurrentView("discover");
  };

  // Create application
  const handleTrackApplication = async (opportunity) => {
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

    try {
      const response = await fetch(
        `${API_URL}/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newApplication)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create application"
        );
      }

      const formattedApplication = {
        id: data.id,
        opportunityId:
          data.opportunityId,
        status: data.status,
        appliedDate:
          data.appliedDate || null,
        notes: data.notes || "",
        followUpDate:
          data.followUpDate || null
      };

      setApplications((previousApplications) => [
        ...previousApplications,
        formattedApplication
      ]);
    } catch (error) {
      console.error(
        "Error creating application:",
        error
      );
    }
  };

  // Update an application
  const updateApplication = async (
    application,
    changes
  ) => {
    const updatedApplication = {
      status: application.status,
      appliedDate: application.appliedDate,
      notes: application.notes,
      followUpDate: application.followUpDate,
      ...changes
    };

    try {
      const response = await fetch(
        `${API_URL}/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            updatedApplication
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update application"
        );
      }

      const formattedApplication = {
        id: data.id,
        opportunityId:
          data.opportunityId,
        status: data.status,
        appliedDate:
          data.appliedDate || null,
        notes: data.notes || "",
        followUpDate:
          data.followUpDate || null
      };

      setApplications((previousApplications) =>
        previousApplications.map(
          (currentApplication) =>
            currentApplication.id ===
            formattedApplication.id
              ? formattedApplication
              : currentApplication
        )
      );
    } catch (error) {
      console.error(
        "Error updating application:",
        error
      );
    }
  };

  // Change application status
  const handleApplicationStatusChange = async (
    opportunityId,
    newStatus
  ) => {
    const application = applications.find(
      (item) =>
        item.opportunityId === opportunityId
    );

    if (!application) {
      return;
    }

    let appliedDate =
      application.appliedDate;

    if (
      newStatus === "Applied" &&
      !application.appliedDate
    ) {
      const today = new Date();

      appliedDate =
        today.getFullYear() +
        "-" +
        String(
          today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
          today.getDate()
        ).padStart(2, "0");
    }

    await updateApplication(
      application,
      {
        status: newStatus,
        appliedDate
      }
    );
  };

  // Update application details
  const handleApplicationUpdate = async (
    opportunityId,
    field,
    value
  ) => {
    const application = applications.find(
      (item) =>
        item.opportunityId === opportunityId
    );

    if (!application) {
      return;
    }

    await updateApplication(
      application,
      {
        [field]: value
      }
    );
  };

  // Stop tracking application
  const handleStopTracking = async (
    opportunityId
  ) => {
    const application = applications.find(
      (item) =>
        item.opportunityId === opportunityId
    );

    if (!application) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/applications/${application.id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete application"
        );
      }

      setApplications((previousApplications) =>
        previousApplications.filter(
          (currentApplication) =>
            currentApplication.id !==
            application.id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting application:",
        error
      );
    }
  };

  // Save an opportunity
  const handleSaveOpportunity = async (
    opportunity
  ) => {
    const alreadySaved = savedOpportunities.some(
      (saved) =>
        saved.id === opportunity.id
    );

    if (alreadySaved) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/saved-opportunities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            opportunityId: opportunity.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save opportunity"
        );
      }

      setSavedOpportunities(
        (previousSavedOpportunities) => [
          ...previousSavedOpportunities,
          opportunity
        ]
      );
    } catch (error) {
      console.error(
        "Error saving opportunity:",
        error
      );
    }
  };

  // Remove a saved opportunity
  const handleRemoveSavedOpportunity = async (
    opportunity
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/saved-opportunities/${opportunity.id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to remove saved opportunity"
        );
      }

      setSavedOpportunities(
        (previousSavedOpportunities) =>
          previousSavedOpportunities.filter(
            (saved) =>
              saved.id !== opportunity.id
          )
      );
    } catch (error) {
      console.error(
        "Error removing saved opportunity:",
        error
      );
    }
  };

  // Save or unsave an opportunity
  const handleSaveToggle = async (
    opportunity
  ) => {
    const alreadySaved = savedOpportunities.some(
      (saved) =>
        saved.id === opportunity.id
    );

    if (alreadySaved) {
      await handleRemoveSavedOpportunity(
        opportunity
      );
    } else {
      await handleSaveOpportunity(
        opportunity
      );
    }
  };

  return (
    <div>
      <Navbar onNavigate={setCurrentView} />

      {currentView === "discover" && (
        <HomePage
          savedOpportunities={
            savedOpportunities
          }
          selectedOpportunity={
            selectedOpportunity
          }
          setSelectedOpportunity={
            setSelectedOpportunity
          }
          onSaveOpportunity={
            handleSaveToggle
          }
        />
      )}

      {currentView === "saved" && (
        <SavedOpportunities
          savedOpportunities={
            savedOpportunities
          }
          applications={applications}
          onView={handleViewOpportunity}
          onTrackApplication={
            handleTrackApplication
          }
          onApplicationStatusChange={
            handleApplicationStatusChange
          }
          onApplicationUpdate={
            handleApplicationUpdate
          }
          onStopTracking={
            handleStopTracking
          }
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard
          savedOpportunities={
            savedOpportunities
          }
          applications={applications}
        />
      )}
    </div>
  );
}

export default App;