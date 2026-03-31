"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await api.get("/listings");
        setListings(res.data);
      } catch (err) {
        setError("Could not load listings. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "60px" }}>Loading listings...</p>;
  }

  if (error) {
    return (
      <div style={{ background: "#f8d7da", padding: "16px", borderRadius: "6px", color: "#721c24" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
        Property Listings
      </h1>

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <p style={{ fontSize: "18px" }}>No active listings yet.</p>
          <p>Check back after the admin approves submissions.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }) {
  const isRent = listing.property?.listing_type === "rent";
  const rental = listing.rental;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "20px",
        border: "1px solid #eee",
      }}
    >
      {/* Badge */}
      <span
        style={{
          background: isRent ? "#e74c3c" : "#2ecc71",
          color: "white",
          fontSize: "11px",
          fontWeight: "bold",
          padding: "3px 8px",
          borderRadius: "4px",
          textTransform: "uppercase",
        }}
      >
        {listing.property?.listing_type || "Property"}
      </span>

      {/* Title */}
      <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0 6px" }}>
        {listing.title}
      </h2>

      {/* Location */}
      {listing.location?.city && (
        <p style={{ color: "#888", fontSize: "13px", margin: "0 0 12px" }}>
          📍 {[listing.location.city, listing.location.district, listing.location.province].filter(Boolean).join(", ")}
        </p>
      )}

      {/* Price */}
      <p style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 8px" }}>
        LKR {Number(listing.price).toLocaleString()}
      </p>

      {/* Rental-specific info */}
      {isRent && rental && (
        <div style={{ background: "#fef9f0", border: "1px solid #fde8c0", borderRadius: "6px", padding: "10px", marginTop: "10px" }}>
          {rental.rent_price && (
            <p style={{ margin: "0 0 4px", fontSize: "14px" }}>
              💰 <strong>Rent:</strong> LKR {Number(rental.rent_price).toLocaleString()} / {rental.billing_cycle || "month"}
            </p>
          )}
          {rental.lease_term && (
            <p style={{ margin: "0 0 4px", fontSize: "14px" }}>
              📋 <strong>Lease:</strong> {rental.lease_term}
            </p>
          )}
          {rental.furnishing && (
            <p style={{ margin: "0 0 4px", fontSize: "14px" }}>
              🛋️ <strong>Furnishing:</strong> {rental.furnishing}
            </p>
          )}
          {rental.tenant_type && (
            <p style={{ margin: "0", fontSize: "14px" }}>
              👥 <strong>Tenant:</strong> {rental.tenant_type}
            </p>
          )}
        </div>
      )}

      {/* Property details */}
      {(listing.property?.bedrooms || listing.property?.bathrooms || listing.property?.property_type) && (
        <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "13px", color: "#555" }}>
          {listing.property.property_type && <span>🏠 {listing.property.property_type}</span>}
          {listing.property.bedrooms && <span>🛏 {listing.property.bedrooms} Bed</span>}
          {listing.property.bathrooms && <span>🚿 {listing.property.bathrooms} Bath</span>}
        </div>
      )}
    </div>
  );
}
