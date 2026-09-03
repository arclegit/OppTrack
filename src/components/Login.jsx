import { useState } from "react";

const API_URL = "http://localhost:5000/api";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to log in"
        );
      }

      // Tell App.jsx that login succeeded
      onLogin(data.user);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Failed to log in"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Welcome to OppTrack</h1>

        <p>
          Log in to manage your
          opportunities.
        </p>


        <form
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              required
            />

          </div>


          <div className="auth-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              required
            />

          </div>


          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>


        <p className="auth-switch">

          Don't have an account?

          {" "}

          <button
            type="button"
            onClick={onShowRegister}
          >
            Register
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;