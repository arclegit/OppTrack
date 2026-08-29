function OpportunityCard({ opportunity, onView }) {
  return (
    <article className="opportunity-card">
      <div className="opportunity-card-header">
        <span className="opportunity-category">
          {opportunity.category}
        </span>
      </div>

      <h2>{opportunity.title}</h2>

      <p className="opportunity-organization">
        {opportunity.organization}
      </p>

      <p className="opportunity-description">
        {opportunity.description}
      </p>

      <p className="opportunity-eligibility">
        <strong>Eligibility:</strong> {opportunity.eligibility}
      </p>

      <div className="opportunity-meta">
        <p>
          <strong>Location:</strong> {opportunity.location}
        </p>

        <p className="opportunity-deadline">
          <strong>Deadline:</strong> {opportunity.deadline}
        </p>
      </div>

      <button onClick={() => onView(opportunity)}>
        View Opportunity
      </button>
    </article>
  );
}

export default OpportunityCard;