function Navbar({
  onNavigate,
  currentUser,
  onLogout
}) {
  return (
    <nav
      className="navbar"
      aria-label="Primary navigation"
    >
      <button
        type="button"
        className="navbar-logo"
        onClick={() => onNavigate("discover")}
        aria-label="OppTrack home"
      >
        <span
          className="navbar-logo-mark"
          aria-hidden="true"
        >
          <span className="navbar-logo-ring"></span>
          <span className="navbar-logo-line"></span>
        </span>

        <span className="navbar-logo-text">
          <span className="navbar-logo-opp">
            Opp
          </span>

          <span className="navbar-logo-track">
            Track
          </span>
        </span>
      </button>

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

        {currentUser && (
          <span
            className="navbar-user"
            title={currentUser.email || currentUser.name}
          >
            {currentUser.name}
          </span>
        )}

        <button
          type="button"
          className="navbar-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;