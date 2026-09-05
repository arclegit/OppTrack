function Navbar({
  onNavigate,
  currentUser,
  onLogout
}) {
  return (
    <nav className="navbar">

      <button
        type="button"
        className="navbar-logo"
        onClick={() => onNavigate("discover")}
        aria-label="OppTrack home"
      >
        <span className="navbar-logo-mark">
          O
        </span>

        <span className="navbar-logo-text">
          <span className="navbar-logo-opp">Opp</span>
          <span className="navbar-logo-track">Track</span>
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
          <span className="navbar-user">
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