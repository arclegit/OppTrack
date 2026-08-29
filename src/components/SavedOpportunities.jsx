import OpportunityCard from "./OpportunityCard";

function SavedOpportunities({ savedOpportunities, onView }) {
  return (
    <section className="saved-opportunities">
      <h1>Saved Opportunities</h1>

      {savedOpportunities.length > 0 ? (
        <div className="opportunity-list">
          {savedOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <p>You haven't saved any opportunities yet.</p>
      )}
    </section>
  );
}

export default SavedOpportunities;