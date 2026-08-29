function Dashboard({ savedOpportunities }) {
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
        <h2>Applications in Progress</h2>

        <p>
          Application tracking will be available in a later step.
        </p>
      </section>

      <section className="dashboard-section">
        <h2>Follow-ups</h2>

        <p>
          Follow-up tracking will be available in a later step.
        </p>
      </section>
    </main>
  );
}

export default Dashboard;