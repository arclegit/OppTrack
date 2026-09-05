function Dashboard({ savedOpportunities, applications }) {
  const getApplicationCount = (status) => {
    return applications.filter(
      (application) => application.status === status
    ).length;
  };

  return (
    <main className="dashboard">
      <h1>Dashboard</h1>

      <p>
        Keep track of the opportunities that need your attention.
      </p>

      <section className="dashboard-section">
        <h2>Saved Opportunities</h2>

        <p>
          You currently have {savedOpportunities.length} saved
          {savedOpportunities.length === 1
            ? " opportunity."
            : " opportunities."}
        </p>
      </section>

      <section className="dashboard-section">
        <h2>Upcoming Deadlines</h2>

        {savedOpportunities.length > 0 ? (
          savedOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="dashboard-opportunity"
            >
              <h3>{opportunity.title}</h3>

              <p>{opportunity.organization}</p>

              <p>
                Deadline: {opportunity.deadline}
              </p>
            </div>
          ))
        ) : (
          <p>
            No saved opportunities with upcoming deadlines.
          </p>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Applications</h2>

        {applications.length > 0 ? (
          <>
            <p>
              You are currently tracking{" "}
              {applications.length}{" "}
              {applications.length === 1
                ? "application."
                : "applications."}
            </p>

            <div className="application-summary">
              <div className="application-summary-item">
                <span>Interested</span>

                <strong>
                  {getApplicationCount("Interested")}
                </strong>
              </div>

              <div className="application-summary-item">
                <span>Applied</span>

                <strong>
                  {getApplicationCount("Applied")}
                </strong>
              </div>

              <div className="application-summary-item">
                <span>Shortlisted</span>

                <strong>
                  {getApplicationCount("Shortlisted")}
                </strong>
              </div>

              <div className="application-summary-item">
                <span>Interview</span>

                <strong>
                  {getApplicationCount("Interview")}
                </strong>
              </div>

              <div className="application-summary-item">
                <span>Selected</span>

                <strong>
                  {getApplicationCount("Selected")}
                </strong>
              </div>

              <div className="application-summary-item">
                <span>Rejected</span>

                <strong>
                  {getApplicationCount("Rejected")}
                </strong>
              </div>
            </div>
          </>
        ) : (
          <p>
            You are not tracking any applications yet.
          </p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;