import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container">
      <div className="panel" style={{ padding: 22 }}>
        <h2 className="h2">Page not found</h2>
        <p className="p">That route does not exist.</p>
        <Link to="/" className="btn primary" style={{ textDecoration: "none" }}>Go to Today</Link>
      </div>
    </div>
  );
}
