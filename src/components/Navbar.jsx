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
      >
        OppTrack
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