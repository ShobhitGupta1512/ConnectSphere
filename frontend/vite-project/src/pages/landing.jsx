
import { Link } from "react-router-dom";
import FuturisticBackground from "../components/FuturisticBackground";

export default function LandingPage() {
  return (
    <FuturisticBackground>
      <nav className="navbar">
        <h2>ConnectSphere</h2>

        <div className="flex gap-3">
          <Link to="/login">
            <button>Join a Meeting</button>
          </Link>
          <Link to="/register">
            <button>Get Started</button>
          </Link>
        </div>
      </nav>

      <main className="hero">
        <p>THE FUTURE OF CONNECTION</p>

        <h1>
          Meet. Connect.
          <br />
          <span>Collaborate.</span>
        </h1>

        <p>
          Crystal-clear video calls.
          Meaningful connections.
          Anywhere, anytime.
        </p>

        <Link to="/register">
          <button>Create a Meeting</button>
        </Link>
      </main>
    </FuturisticBackground>
  );
}
