import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "12px" }}>Welcome to PrimeMarket</h1>
      <p style={{ color: "#555", marginBottom: "32px" }}>
        Browse property listings or submit your own.
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <Link
          href="/listings"
          style={{
            background: "#1a1a2e",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          View Listings
        </Link>
        <Link
          href="/listings/new"
          style={{
            background: "#e74c3c",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Add Listing
        </Link>
      </div>
    </div>
  );
}
