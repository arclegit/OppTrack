function OpportunityDetails({
  opportunity,
  onBack,
  onSave,
  isSaved
}) {
  return (
    <main className="opportunity-details-page">
      <section className="opportunity-details">

        <div className="opportunity-details-header">
          <span className="opportunity-category">
            {opportunity.category}
          </span>

          <h1>{opportunity.title}</h1>

          <p className="opportunity-details-organization">
            {opportunity.organization}
          </p>
        </div>

        <div className="opportunity-details-meta">
          <div className="detail-item">
            <span className="detail-label">
              Location
            </span>

            <span className="detail-value">
              {opportunity.location}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Scope
            </span>

            <span className="detail-value">
              {opportunity.scope}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Deadline
            </span>

            <span className="detail-value opportunity-details-deadline">
              {opportunity.deadline}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Verification
            </span>

            <span className="detail-value">
              {opportunity.verificationStatus}
            </span>
          </div>
        </div>

        <div className="opportunity-details-section">
          <h2>Description</h2>

          <p>
            {opportunity.description}
          </p>
        </div>

        <div className="opportunity-details-section">
          <h2>Eligibility</h2>

          <p>
            {opportunity.eligibility}
          </p>
        </div>

        <div className="opportunity-details-section">
          <h2>Skills</h2>

          <p>
            {opportunity.skills.join(", ")}
          </p>
        </div>

        <div className="opportunity-details-section">
          <h2>Source</h2>

          <p>
            {opportunity.source}
          </p>

          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Original Opportunity
          </a>
        </div>

        <div className="opportunity-details-actions">
          <button
            className="save-button"
            onClick={() => onSave(opportunity)}
          >
            {isSaved
              ? "Unsave Opportunity"
              : "Save Opportunity"}
          </button>

          <button
            className="back-button"
            onClick={onBack}
          >
            Back to Opportunities
          </button>
        </div>

      </section>
    </main>
  );
}

export default OpportunityDetails;