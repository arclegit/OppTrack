function Navbar({ onNavigate }) {
  return (
    <nav className="navbar">
      <h2 className="navbar-logo">OppTrack</h2>

      <div className="navbar-links">
        <button
          type="button"
          onClick={() => onNavigate("discover")}
        >
          Discover
        </button>

        <button
          type="button"
          onClick={() => onNavigate("saved")}
        >
          Saved
        </button>

        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </button>
      </div>
    </nav>
  );
}

export default Navbar;