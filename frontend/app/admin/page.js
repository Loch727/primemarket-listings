"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Track which listing IDs are in the process of being accepted or deleted
  const [accepting, setAccepting] = useState({});
  const [deleting, setDeleting] = useState({});

  async function fetchListings() {
    try {
      const res = await api.get("/admin/listings");
      setListings(res.data);
    } catch (err) {
      setError("Could not load listings. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function handleAccept(id) {
    // Disable the button immediately to prevent double-clicks
    setAccepting((prev) => ({ ...prev, [id]: true }));

    try {
      await api.patch(`/admin/listings/${id}/accept`);
      // Update the listing's status in local state — data comes from backend
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: "active" } : l))
      );
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to accept listing.";
      alert(msg);
      // Re-enable button on failure
      setAccepting((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/admin/listings/${id}`);
      // Remove from local state
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete listing.";
      alert(msg);
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "60px" }}>Loading admin panel...</p>;
  }

  if (error) {
    return (
      <div style={{ background: "#f8d7da", padding: "16px", borderRadius: "6px", color: "#721c24" }}>
        {error}
      </div>
    );
  }

  const pending = listings.filter((l) => l.status === "pending");
  const active = listings.filter((l) => l.status === "active");

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        Admin Panel
      </h1>
      <p style={{ color: "#888", marginBottom: "28px", fontSize: "14px" }}>
        Review pending listings and approve them for public display.
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
        <Stat label="Total" value={listings.length} color="#1a1a2e" />
        <Stat label="Pending" value={pending.length} color="#e67e22" />
        <Stat label="Active" value={active.length} color="#27ae60" />
      </div>

      {/* Pending Section */}
      <Section title="⏳ Pending Approval" count={pending.length} color="#e67e22">
        {pending.length === 0 ? (
          <p style={{ color: "#888", padding: "20px 0" }}>No pending listings.</p>
        ) : (
          pending.map((listing) => (
            <AdminCard
              key={listing._id}
              listing={listing}
              onAccept={handleAccept}
              onDelete={handleDelete}
              isAccepting={!!accepting[listing._id]}
              isDeleting={!!deleting[listing._id]}
            />
          ))
        )}
      </Section>

      {/* Active Section */}
      <Section title="✅ Active Listings" count={active.length} color="#27ae60">
        {active.length === 0 ? (
          <p style={{ color: "#888", padding: "20px 0" }}>No active listings yet.</p>
        ) : (
          active.map((listing) => (
            <AdminCard
              key={listing._id}
              listing={listing}
              onAccept={handleAccept}
              onDelete={handleDelete}
              isAccepting={!!accepting[listing._id]}
              isDeleting={!!deleting[listing._id]}
            />
          ))
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "white", borderRadius: "8px", padding: "16px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderTop: `4px solid ${color}`, minWidth: "100px" }}>
      <div style={{ fontSize: "28px", fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#888" }}>{label}</div>
    </div>
  );
}

function Section({ title, count, color, children }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{ fontSize: "17px", fontWeight: "bold", color, marginBottom: "14px", borderBottom: `2px solid ${color}`, paddingBottom: "8px" }}>
        {title} ({count})
      </h2>
      {children}
    </div>
  );
}

function AdminCard({ listing, onAccept, onDelete, isAccepting, isDeleting }) {
  const isRent = listing.property?.listing_type === "rent";
  const isActive = listing.status === "active";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `4px solid ${isActive ? "#27ae60" : "#e67e22"}`,
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Title */}
        <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 6px" }}>
          {listing.title}
        </h3>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#666", flexWrap: "wrap" }}>
          <span>
            <strong>Type:</strong>{" "}
            <span style={{ textTransform: "capitalize" }}>
              {listing.property?.listing_type || "—"}
            </span>
          </span>

          {listing.location?.city && (
            <span>📍 {listing.location.city}</span>
          )}

          <span>
            <strong>Price:</strong> LKR {Number(listing.price).toLocaleString()}
          </span>

          {isRent && listing.rental?.rent_price && (
            <span>
              💰 Rent: LKR {Number(listing.rental.rent_price).toLocaleString()} / {listing.rental.billing_cycle}
            </span>
          )}

          <span style={{ color: "#999", fontSize: "12px" }}>
            Submitted: {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Status + Action */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", marginLeft: "16px" }}>
        <span
          style={{
            background: isActive ? "#d4edda" : "#fff3cd",
            color: isActive ? "#155724" : "#856404",
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {listing.status}
        </span>

        {/* Accept button — disabled once active or in progress */}
        <button
          onClick={() => onAccept(listing._id)}
          disabled={isActive || isAccepting}
          style={{
            background: isActive || isAccepting ? "#ccc" : "#27ae60",
            color: "white",
            border: "none",
            padding: "7px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: isActive || isAccepting ? "not-allowed" : "pointer",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {isActive ? "✓ Accepted" : isAccepting ? "Accepting..." : "Accept"}
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(listing._id)}
          disabled={isDeleting}
          style={{
            background: isDeleting ? "#ccc" : "#e74c3c",
            color: "white",
            border: "none",
            padding: "7px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: isDeleting ? "not-allowed" : "pointer",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
