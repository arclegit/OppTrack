import { useState } from "react";
import API_URL from "../config/api";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_MIN_LENGTH = 8;

function Register({
  onRegister,
  onShowLogin
}) {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const validateForm = () => {
    const trimmedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!trimmedName) {
      return "Please enter your name.";
    }

    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters.";
    }

    if (trimmedName.length > 80) {
      return "Name must be 80 characters or fewer.";
    }

    if (!normalizedEmail) {
      return "Please enter your email address.";
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain at least one letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    return "";
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            `${API_URL}/auth/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                name: name.trim(),
                email:
                  email
                    .trim()
                    .toLowerCase(),
                password
              })
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "We couldn't create your account. Please try again."
          );
        }

        onRegister(data.user);

      } catch (error) {
        console.error(
          "Registration error:",
          error
        );

        if (
          error instanceof
          TypeError
        ) {
          setError(
            "We couldn't connect to OppTrack. Please check your connection and try again."
          );
        } else {
          setError(
            error.message ||
              "We couldn't create your account. Please try again."
          );
        }

      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>
          Create your OppTrack account
        </h1>

        <p className="auth-description">
          Start tracking your opportunities.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="auth-field">

            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your name"
              autoComplete="name"
              maxLength={80}
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
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
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
              autoComplete="new-password"
              minLength={
                PASSWORD_MIN_LENGTH
              }
              required
            />

            <p className="auth-help">
              Use at least 8 characters,
              including one letter and
              one number.
            </p>

          </div>


          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={loading}
            className="auth-submit-button"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
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