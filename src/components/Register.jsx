import { useState } from "react";
import API_URL from "../config/api";

function Register({ onRegister, onShowLogin }) {
  const [name, setName] = useState("");

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
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name,
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
            "Failed to register"
        );
      }

      // Registration succeeded.
      onRegister(data.user);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Failed to register"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Create your OppTrack account</h1>

        <p>
          Start tracking your opportunities.
        </p>


        <form
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your name"
              required
            />

          </div>


          <div className="auth-field">

            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
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

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Create a password"
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
              ? "Creating account..."
              : "Register"}
          </button>

        </form>


        <p className="auth-switch">

          Already have an account?

          {" "}

          <button
            type="button"
            onClick={onShowLogin}
          >
            Log In
          </button>

        </p>

      </div>

    </div>
  );
}

export default Register;