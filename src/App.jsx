import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SavedOpportunities from "./components/SavedOpportunities";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import API_URL from "./config/api";


function App() {

  // ==================================================
  // Navigation state
  // ==================================================

  const [currentView, setCurrentView] =
    useState("discover");


  // ==================================================
  // Authentication state
  // ==================================================

  const [currentUser, setCurrentUser] =
    useState(null);


  const [authLoading, setAuthLoading] =
    useState(true);


  const [authView, setAuthView] =
    useState("login");


  // ==================================================
  // Opportunity state
  // ==================================================

  const [selectedOpportunity, setSelectedOpportunity] =
    useState(null);


  const [savedOpportunities, setSavedOpportunities] =
    useState([]);


  // ==================================================
  // Application state
  // ==================================================

  const [applications, setApplications] =
    useState([]);


  // ==================================================
  // Check current authentication session
  // ==================================================

  useEffect(() => {

    const loadCurrentUser =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/auth/me`,
              {
                credentials:
                  "include"
              }
            );


          if (!response.ok) {

            setCurrentUser(null);

            return;
          }


          const data =
            await response.json();


          setCurrentUser(
            data.user
          );


        } catch (error) {

          console.error(
            "Error checking authentication:",
            error
          );


          setCurrentUser(null);


        } finally {

          setAuthLoading(false);
        }
      };


    loadCurrentUser();

  }, []);


  // ==================================================
  // Load saved opportunities
  //
  // IMPORTANT:
  // Only do this after authentication is known.
  // ==================================================

  useEffect(() => {

    if (
      authLoading ||
      !currentUser
    ) {
      return;
    }


    const loadSavedOpportunities =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/saved-opportunities`,
              {
                credentials:
                  "include"
              }
            );


          if (!response.ok) {

            throw new Error(
              "Failed to fetch saved opportunities"
            );
          }


          const data =
            await response.json();


          setSavedOpportunities(
            data
          );


        } catch (error) {

          console.error(
            "Error loading saved opportunities:",
            error
          );
        }
      };


    loadSavedOpportunities();

  }, [
    authLoading,
    currentUser
  ]);


  // ==================================================
  // Load applications
  //
  // IMPORTANT:
  // Only do this after authentication is known.
  // ==================================================

  useEffect(() => {

    if (
      authLoading ||
      !currentUser
    ) {
      return;
    }


    const loadApplications =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/applications`,
              {
                credentials:
                  "include"
              }
            );


          if (!response.ok) {

            throw new Error(
              "Failed to fetch applications"
            );
          }


          const data =
            await response.json();


          const formattedApplications =
            data.map(
              (application) => ({

                id:
                  application.id,

                opportunityId:
                  application.opportunityId,

                status:
                  application.status,

                appliedDate:
                  application.appliedDate ||
                  null,

                notes:
                  application.notes ||
                  "",

                followUpDate:
                  application.followUpDate ||
                  null

              })
            );


          setApplications(
            formattedApplications
          );


        } catch (error) {

          console.error(
            "Error loading applications:",
            error
          );
        }
      };


    loadApplications();

  }, [
    authLoading,
    currentUser
  ]);


  // ==================================================
  // Handle successful login
  // ==================================================

  const handleLogin =
    (user) => {

      setCurrentUser(
        user
      );

      setCurrentView(
        "discover"
      );
    };


  // ==================================================
  // Handle successful registration
  // ==================================================

  const handleRegister =
    () => {

      setAuthView(
        "login"
      );
    };


  // ==================================================
  // Handle logout
  // ==================================================

  const handleLogout =
    async () => {

      try {

        const response =
          await fetch(
            `${API_URL}/auth/logout`,
            {
              method:
                "POST",

              credentials:
                "include"
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to log out"
          );
        }


      } catch (error) {

        console.error(
          "Error logging out:",
          error
        );

      } finally {

        // Clear frontend authentication state
        setCurrentUser(null);

        // Clear user-specific frontend data
        setSavedOpportunities([]);

        setApplications([]);

        setSelectedOpportunity(null);

        // Return to Discover/login flow
        setCurrentView(
          "discover"
        );

        setAuthView(
          "login"
        );
      }
    };


  // ==================================================
  // Wait until authentication is checked
  // ==================================================

  if (authLoading) {

    return (
      <div>
        Checking authentication...
      </div>
    );
  }


  // ==================================================
  // Show Login/Register if not authenticated
  // ==================================================

  if (!currentUser) {

    if (
      authView ===
      "register"
    ) {

      return (
        <Register

          onRegister={
            handleRegister
          }

          onShowLogin={() => {
            setAuthView(
              "login"
            );
          }}

        />
      );
    }


    return (
      <Login

        onLogin={
          handleLogin
        }

        onShowRegister={() => {
          setAuthView(
            "register"
          );
        }}

      />
    );
  }


  // ==================================================
  // View an opportunity
  // ==================================================

  const handleViewOpportunity =
    (opportunity) => {

      setSelectedOpportunity(
        opportunity
      );

      setCurrentView(
        "discover"
      );
    };


  // ==================================================
  // Create application
  // ==================================================

  const handleTrackApplication =
    async (opportunity) => {

      const alreadyTracked =
        applications.some(
          (application) =>
            application.opportunityId ===
            opportunity.id
        );


      if (alreadyTracked) {
        return;
      }


      const newApplication = {

        opportunityId:
          opportunity.id,

        status:
          "Interested",

        appliedDate:
          null,

        notes:
          "",

        followUpDate:
          null
      };


      try {

        const response =
          await fetch(
            `${API_URL}/applications`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              credentials:
                "include",

              body:
                JSON.stringify(
                  newApplication
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to create application"
          );
        }


        const formattedApplication = {

          id:
            data.id,

          opportunityId:
            data.opportunityId,

          status:
            data.status,

          appliedDate:
            data.appliedDate ||
            null,

          notes:
            data.notes ||
            "",

          followUpDate:
            data.followUpDate ||
            null
        };


        setApplications(
          (previousApplications) => [

            ...previousApplications,

            formattedApplication

          ]
        );


      } catch (error) {

        console.error(
          "Error creating application:",
          error
        );
      }
    };


  // ==================================================
  // Update an application
  // ==================================================

  const updateApplication =
    async (
      application,
      changes
    ) => {

      const updatedApplication = {

        status:
          application.status,

        appliedDate:
          application.appliedDate,

        notes:
          application.notes,

        followUpDate:
          application.followUpDate,

        ...changes
      };


      try {

        const response =
          await fetch(
            `${API_URL}/applications/${application.id}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json"
              },

              credentials:
                "include",

              body:
                JSON.stringify(
                  updatedApplication
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to update application"
          );
        }


        const formattedApplication = {

          id:
            data.id,

          opportunityId:
            data.opportunityId,

          status:
            data.status,

          appliedDate:
            data.appliedDate ||
            null,

          notes:
            data.notes ||
            "",

          followUpDate:
            data.followUpDate ||
            null
        };


        setApplications(
          (previousApplications) =>

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


  // ==================================================
  // Change application status
  // ==================================================

  const handleApplicationStatusChange =
    async (
      opportunityId,
      newStatus
    ) => {

      const application =
        applications.find(
          (item) =>
            item.opportunityId ===
            opportunityId
        );


      if (!application) {
        return;
      }


      let appliedDate =
        application.appliedDate;


      // If status becomes Applied
      // for the first time, record today's date.

      if (
        newStatus ===
        "Applied" &&
        !application.appliedDate
      ) {

        const today =
          new Date();


        appliedDate =
          today.getFullYear() +
          "-" +
          String(
            today.getMonth() + 1
          ).padStart(
            2,
            "0"
          ) +
          "-" +
          String(
            today.getDate()
          ).padStart(
            2,
            "0"
          );
      }


      await updateApplication(
        application,
        {
          status:
            newStatus,

          appliedDate:
            appliedDate
        }
      );
    };


  // ==================================================
  // Update application details
  // ==================================================

  const handleApplicationUpdate =
    async (
      opportunityId,
      field,
      value
    ) => {

      const application =
        applications.find(
          (item) =>
            item.opportunityId ===
            opportunityId
        );


      if (!application) {
        return;
      }


      await updateApplication(
        application,
        {
          [field]:
            value
        }
      );
    };


  // ==================================================
  // Stop tracking application
  // ==================================================

  const handleStopTracking =
    async (
      opportunityId
    ) => {

      const application =
        applications.find(
          (item) =>
            item.opportunityId ===
            opportunityId
        );


      if (!application) {
        return;
      }


      try {

        const response =
          await fetch(
            `${API_URL}/applications/${application.id}`,
            {
              method:
                "DELETE",

              credentials:
                "include"
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to delete application"
          );
        }


        setApplications(
          (previousApplications) =>

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


  // ==================================================
  // Save an opportunity
  // ==================================================

  const handleSaveOpportunity =
    async (
      opportunity
    ) => {

      const alreadySaved =
        savedOpportunities.some(
          (saved) =>
            saved.id ===
            opportunity.id
        );


      if (alreadySaved) {
        return;
      }


      try {

        const response =
          await fetch(
            `${API_URL}/saved-opportunities`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              credentials:
                "include",

              body:
                JSON.stringify({
                  opportunityId:
                    opportunity.id
                })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to save opportunity"
          );
        }


        setSavedOpportunities(
          (
            previousSavedOpportunities
          ) => [

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


  // ==================================================
  // Remove saved opportunity
  // ==================================================

  const handleRemoveSavedOpportunity =
    async (
      opportunity
    ) => {

      try {

        const response =
          await fetch(
            `${API_URL}/saved-opportunities/${opportunity.id}`,
            {
              method:
                "DELETE",

              credentials:
                "include"
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to remove saved opportunity"
          );
        }


        setSavedOpportunities(
          (
            previousSavedOpportunities
          ) =>

            previousSavedOpportunities.filter(
              (saved) =>
                saved.id !==
                opportunity.id
            )
        );


      } catch (error) {

        console.error(
          "Error removing saved opportunity:",
          error
        );
      }
    };


  // ==================================================
  // Save or unsave opportunity
  // ==================================================

  const handleSaveToggle =
    async (
      opportunity
    ) => {

      const alreadySaved =
        savedOpportunities.some(
          (saved) =>
            saved.id ===
            opportunity.id
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


  // ==================================================
  // Main authenticated application
  // ==================================================

  return (
    <div>

      <Navbar

        onNavigate={
          setCurrentView
        }

        currentUser={
          currentUser
        }

        onLogout={
          handleLogout
        }

      />


      {/* =========================================
          DISCOVER
          ========================================= */}

      {currentView ===
        "discover" && (

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


      {/* =========================================
          SAVED
          ========================================= */}

      {currentView ===
        "saved" && (

        <SavedOpportunities

          savedOpportunities={
            savedOpportunities
          }

          applications={
            applications
          }

          onView={
            handleViewOpportunity
          }

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


      {/* =========================================
          DASHBOARD
          ========================================= */}

      {currentView ===
        "dashboard" && (

        <Dashboard

          savedOpportunities={
            savedOpportunities
          }

          applications={
            applications
          }

        />
      )}

    </div>
  );
}


export default App;