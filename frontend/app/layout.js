export const metadata = {
  title: "PrimeMarket",
  description: "Property listing system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 0, background: "#f5f5f5" }}>
        <nav style={{ background: "#1a1a2e", padding: "12px 24px", display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>PrimeMarket</span>
          <a href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</a>
          <a href="/listings" style={{ color: "#aaa", textDecoration: "none" }}>Listings</a>
          <a href="/listings/new" style={{ color: "#aaa", textDecoration: "none" }}>+ Add Listing</a>
          <a href="/admin" style={{ color: "#aaa", textDecoration: "none" }}>Admin</a>
        </nav>
        <main style={{ padding: "24px" }}>{children}</main>
      </body>
    </html>
  );
}
