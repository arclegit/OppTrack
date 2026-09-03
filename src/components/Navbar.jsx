function Navbar({
  onNavigate,
  currentUser,
  onLogout
}) {

  return (
    <nav className="navbar">

      <h2 className="navbar-logo">
        OppTrack
      </h2>


      <div className="navbar-links">

        <button
          type="button"
          onClick={() =>
            onNavigate("discover")
          }
        >
          Discover
        </button>


        <button
          type="button"
          onClick={() =>
            onNavigate("saved")
          }
        >
          Saved
        </button>


        <button
          type="button"
          onClick={() =>
            onNavigate("dashboard")
          }
        >
          Dashboard
        </button>


        {/* Logged-in user name */}

        {currentUser && (
          <span>
            {currentUser.name}
          </span>
        )}


        {/* Logout */}

        <button
          type="button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}


export default Navbar;