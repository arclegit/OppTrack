import OpportunityCard from "./OpportunityCard";
import applicationStatuses from "../data/applicationStatuses";

function SavedOpportunities({
  savedOpportunities,
  applications,
  onView,
  onTrackApplication,
  onApplicationStatusChange,
  onApplicationUpdate,
  onStopTracking
}) {
  return (
    <section className="saved-opportunities">
      <h1>Saved Opportunities</h1>

      {savedOpportunities.length > 0 ? (
        <div className="opportunity-list">
          {savedOpportunities.map((opportunity) => {
            const application = applications.find(
              (item) =>
                item.opportunityId === opportunity.id
            );

            return (
              <div
                className="saved-opportunity-item"
                key={opportunity.id}
              >
                <OpportunityCard
                  opportunity={opportunity}
                  onView={onView}
                />

                {application ? (
                  <div className="application-tracking">
                    <div className="application-status">
                      <label
                        htmlFor={`status-${opportunity.id}`}
                      >
                        Application Status
                      </label>

                      <select
                        id={`status-${opportunity.id}`}
                        value={application.status}
                        onChange={(event) =>
                          onApplicationStatusChange(
                            opportunity.id,
                            event.target.value
                          )
                        }
                      >
                        {applicationStatuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="application-details">
                      <div className="application-date-field">
                        <label
                          htmlFor={`applied-date-${opportunity.id}`}
                        >
                          Applied Date
                        </label>

                        <input
                          id={`applied-date-${opportunity.id}`}
                          type="date"
                          value={application.appliedDate || ""}
                          onChange={(event) =>
                            onApplicationUpdate(
                              opportunity.id,
                              "appliedDate",
                              event.target.value || null
                            )
                          }
                        />
                      </div>

                      <div className="application-date-field">
                        <label
                          htmlFor={`follow-up-date-${opportunity.id}`}
                        >
                          Follow-up Date
                        </label>

                        <input
                          id={`follow-up-date-${opportunity.id}`}
                          type="date"
                          value={application.followUpDate || ""}
                          onChange={(event) =>
                            onApplicationUpdate(
                              opportunity.id,
                              "followUpDate",
                              event.target.value || null
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="application-notes">
                      <label
                        htmlFor={`notes-${opportunity.id}`}
                      >
                        Notes
                      </label>

                      <textarea
                        id={`notes-${opportunity.id}`}
                        value={application.notes}
                        placeholder="Add personal notes about this application..."
                        rows="4"
                        onChange={(event) =>
                          onApplicationUpdate(
                            opportunity.id,
                            "notes",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="stop-tracking-button"
                      onClick={() =>
                        onStopTracking(opportunity.id)
                      }
                    >
                      Stop Tracking
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="track-application-button"
                    onClick={() =>
                      onTrackApplication(opportunity)
                    }
                  >
                    Track Application
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>You haven't saved any opportunities yet.</p>
      )}
    </section>
  );
}

export default SavedOpportunities;