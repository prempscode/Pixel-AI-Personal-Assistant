import { useAuth } from "./context/AuthContext";
import GoogleLogin from "./components/GoogleLogin";
import ChatWindow from "./components/ChatWindow";
import GoogleStatus from "./components/GoogleStatus";
import { signOut } from "./services/authService";
import "./index.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <GoogleLogin />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Pixel</h1>
        <GoogleStatus />
        <span>{user.email}</span>
        <button onClick={signOut}>Logout</button>
      </header>
      <ChatWindow />
    </div>
  );
}

export default App;
