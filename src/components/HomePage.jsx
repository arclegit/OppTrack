import { useState } from "react";
import SearchBar from "./SearchBar";
import OpportunityCard from "./OpportunityCard";
import OpportunityDetails from "./OpportunityDetails";
import opportunities from "../data/opportunities";
import categories from "../data/categories";

function HomePage({
  savedOpportunities,
  setSavedOpportunities,
  selectedOpportunity,
  setSelectedOpportunity
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.organization
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      opportunity.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="home-page">
      {selectedOpportunity ? (
        <OpportunityDetails
          opportunity={selectedOpportunity}
          isSaved={savedOpportunities.some(
            (saved) => saved.id === selectedOpportunity.id
          )}
          onBack={() => setSelectedOpportunity(null)}
          onSave={(opportunity) => {
            const alreadySaved = savedOpportunities.some(
              (saved) => saved.id === opportunity.id
            );

            if (alreadySaved) {
              setSavedOpportunities(
                savedOpportunities.filter(
                  (saved) => saved.id !== opportunity.id
                )
              );
            } else {
              setSavedOpportunities([
                ...savedOpportunities,
                opportunity
              ]);
            }
          }}
        />
      ) : (
        <>
          <h1>Find Your Next Opportunity</h1>

        

          <p>
            Discover internships, scholarships, hackathons, jobs, and more.
          </p>

          <SearchBar onSearchChange={setSearchTerm} />

          <div className="category-filter">
  <label htmlFor="category">Category</label>

  <select
    id="category"
    value={selectedCategory}
    onChange={(event) =>
      setSelectedCategory(event.target.value)
    }
  >
   <option value="All">All</option>

{categories.map((category) => (
  <option key={category} value={category}>
    {category}
  </option>
))}
  </select>
</div>

          {filteredOpportunities.length > 0 ? (
            <div className="opportunity-list">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onView={setSelectedOpportunity}
                />
              ))}
            </div>
          ) : (
            <p>
              No opportunities found. Try changing your search or category.
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default HomePage;