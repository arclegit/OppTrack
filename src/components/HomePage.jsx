import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import OpportunityCard from "./OpportunityCard";
import OpportunityDetails from "./OpportunityDetails";
import categories from "../data/categories";
import scopes from "../data/scopes";

function HomePage({
  savedOpportunities,
  selectedOpportunity,
  setSelectedOpportunity,
  onSaveOpportunity
}) {
  const [opportunities, setOpportunities] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedScope, setSelectedScope] =
    useState("All");

  const [locationTerm, setLocationTerm] =
    useState("");

  const [selectedDeadline, setSelectedDeadline] =
    useState("All");

  // Load opportunities from PostgreSQL
  useEffect(() => {
    fetch(
      "http://localhost:5000/api/opportunities"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch opportunities"
          );
        }

        return response.json();
      })
      .then((data) => {
        setOpportunities(data);
      })
      .catch((error) => {
        console.error(
          "Failed to fetch opportunities:",
          error
        );
      });
  }, []);

  const filteredOpportunities =
    opportunities.filter((opportunity) => {
      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        opportunity.title
          .toLowerCase()
          .includes(search) ||
        opportunity.organization
          .toLowerCase()
          .includes(search) ||
        opportunity.category
          .toLowerCase()
          .includes(search) ||
        opportunity.location
          .toLowerCase()
          .includes(search) ||
        opportunity.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(search)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        opportunity.category ===
          selectedCategory;

      const matchesScope =
        selectedScope === "All" ||
        opportunity.scope ===
          selectedScope;

      const matchesLocation =
        opportunity.location
          .toLowerCase()
          .includes(
            locationTerm.toLowerCase()
          );

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(
        `${opportunity.deadline}T00:00:00`
      );

      const daysUntilDeadline =
        (deadlineDate - today) /
        (1000 * 60 * 60 * 24);

      const deadlineStatus =
        daysUntilDeadline < 0
          ? "Expired"
          : daysUntilDeadline <= 7
          ? "Closing Soon"
          : "Upcoming";

      const matchesDeadline =
        selectedDeadline === "All" ||
        deadlineStatus ===
          selectedDeadline;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesScope &&
        matchesLocation &&
        matchesDeadline
      );
    });

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedScope !== "All",
    locationTerm.trim() !== "",
    selectedDeadline !== "All"
  ].filter(Boolean).length;

  return (
    <main className="home-page">
      {selectedOpportunity ? (
        <OpportunityDetails
          opportunity={
            selectedOpportunity
          }
          isSaved={savedOpportunities.some(
            (saved) =>
              saved.id ===
              selectedOpportunity.id
          )}
          onBack={() =>
            setSelectedOpportunity(null)
          }
          onSave={
            onSaveOpportunity
          }
        />
      ) : (
        <>
          <h1>
            Find Your Next Opportunity
          </h1>

          <p>
            Discover internships,
            scholarships, hackathons,
            jobs, and more.
          </p>

          <SearchBar
            onSearchChange={
              setSearchTerm
            }
          />

          <div className="filters-section">
            <h2>Filters</h2>

            <div className="filters-grid">
              <div className="filter-control">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  value={
                    selectedCategory
                  }
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-control">
                <label htmlFor="scope">
                  Scope
                </label>

                <select
                  id="scope"
                  value={selectedScope}
                  onChange={(event) =>
                    setSelectedScope(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All
                  </option>

                  {scopes.map(
                    (scope) => (
                      <option
                        key={scope}
                        value={scope}
                      >
                        {scope}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-control">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Kerala or Kochi"
                  value={locationTerm}
                  onChange={(event) =>
                    setLocationTerm(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="filter-control">
                <label htmlFor="deadline">
                  Deadline
                </label>

                <select
                  id="deadline"
                  value={
                    selectedDeadline
                  }
                  onChange={(event) =>
                    setSelectedDeadline(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All
                  </option>

                  <option value="Upcoming">
                    Upcoming
                  </option>

                  <option value="Closing Soon">
                    Closing Soon
                  </option>

                  <option value="Expired">
                    Expired
                  </option>
                </select>
              </div>
            </div>

            <div className="filter-status">
              {activeFilterCount ===
              0
                ? "No filters applied"
                : `${activeFilterCount} ${
                    activeFilterCount ===
                    1
                      ? "filter"
                      : "filters"
                  } active`}
            </div>

            <button
              type="button"
              className="clear-filters-button"
              onClick={() => {
                setSelectedCategory(
                  "All"
                );

                setSelectedScope(
                  "All"
                );

                setLocationTerm("");

                setSelectedDeadline(
                  "All"
                );
              }}
            >
              Clear Filters
            </button>
          </div>

          <p className="result-count">
            {filteredOpportunities.length}{" "}
            {filteredOpportunities.length ===
            1
              ? "opportunity"
              : "opportunities"}{" "}
            found
          </p>

          {filteredOpportunities.length >
          0 ? (
            <div className="opportunity-list">
              {filteredOpportunities.map(
                (opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={
                      opportunity
                    }
                    onView={
                      setSelectedOpportunity
                    }
                  />
                )
              )}
            </div>
          ) : (
            <p>
              No opportunities found.
              Try changing your search,
              category, scope, location,
              or deadline.
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default HomePage;