
import "./FuturisticBackground.css";

export default function FuturisticBackground({ children }) {
  return (
    <div className="futuristic-background">
      <div className="futuristic-grid" />

      <div className="ambient-orb orb-purple" />
      <div className="ambient-orb orb-blue" />
      <div className="ambient-orb orb-cyan" />

      <div className="futuristic-content">{children}</div>
    </div>
  );
}
