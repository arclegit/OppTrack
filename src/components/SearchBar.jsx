function SearchBar({ onSearchChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search opportunities..."
        onChange={(event) => onSearchChange(event.target.value)}
      />


      <button>Search</button>
    </div>
  );
}

export default SearchBar; 