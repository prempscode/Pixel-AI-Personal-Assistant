import { useAuth } from "./context/AuthContext";
import GoogleLogin from "./components/GoogleLogin";
import { signOut } from "./services/authService";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <GoogleLogin />;
  }

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}

export default App;
