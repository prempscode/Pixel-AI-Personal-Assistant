import { useState } from "react";
import { signInWithGoogle } from "../services/authService";

function GoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}

export default GoogleLogin;
