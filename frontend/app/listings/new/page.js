"use client";

import { useState } from "react";
import api from "../../../lib/api";

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontWeight: "500",
  fontSize: "14px",
  color: "#333",
};

const sectionStyle = {
  background: "#f9f9f9",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
};

const sectionTitleStyle = {
  fontWeight: "bold",
  fontSize: "14px",
  color: "#1a1a2e",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function NewListingPage() {
  const [form, setForm] = useState({
    // Core fields
    title: "",
    description: "",
    price: "",
    listing_type: "",
    property_type: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
    district: "",
    province: "",
    video_link: "",

    // Rental fields (Section 1 - Pricing)
    rent_price: "",
    billing_cycle: "",
    security_deposit: "",

    // Rental fields (Section 2 - Availability)
    available_from: "",

    // Rental fields (Section 3 - Lease)
    lease_term: "",

    // Rental fields (Section 4 - Tenant)
    tenant_type: "",

    // Rental fields (Section 5 - Property Info)
    furnishing: "",
    parking_available: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isRent = form.listing_type === "rent";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic required validation
    if (!form.title || !form.price || !form.listing_type) {
      setError("Title, price, and listing type are required.");
      return;
    }

    // Rental required validation
    if (isRent) {
      if (!form.rent_price || Number(form.rent_price) <= 0) {
        setError("Rent price must be a positive number.");
        return;
      }
      if (!form.billing_cycle) {
        setError("Billing cycle is required for rental listings.");
        return;
      }
    }

    // Video link validation
    if (form.video_link) {
      const validHost =
        form.video_link.includes("youtube.com") ||
        form.video_link.includes("youtu.be") ||
        form.video_link.includes("drive.google.com");
      if (!validHost) {
        setError("Video link must be a YouTube or Google Drive URL.");
        return;
      }
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: "property",
      property: {
        listing_type: form.listing_type,
        property_type: form.property_type,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      },
      location: {
        city: form.city,
        district: form.district,
        province: form.province,
      },
      video_link: form.video_link || undefined,
      // Only attach rental object when listing type is rent
      rental: isRent
        ? {
            rent_price: Number(form.rent_price),
            billing_cycle: form.billing_cycle,
            security_deposit: form.security_deposit
              ? Number(form.security_deposit)
              : undefined,
            available_from: form.available_from || undefined,
            lease_term: form.lease_term || undefined,
            tenant_type: form.tenant_type || undefined,
            furnishing: form.furnishing || undefined,
            parking_available:
              form.parking_available !== ""
                ? form.parking_available === "true"
                : undefined,
          }
        : undefined,
    };

    try {
      setLoading(true);
      await api.post("/listings", payload);
      setSuccess(true);
      // Reset form
      setForm({
        title: "", description: "", price: "", listing_type: "",
        property_type: "", bedrooms: "", bathrooms: "",
        city: "", district: "", province: "", video_link: "",
        rent_price: "", billing_cycle: "", security_deposit: "",
        available_from: "", lease_term: "", tenant_type: "",
        furnishing: "", parking_available: "",
      });
    } catch (err) {
      const msg =
        err.response?.data?.error || "Failed to submit listing. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
        Create Listing
      </h1>

      {success && (
        <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", color: "#155724" }}>
          ✅ Listing submitted successfully! It will appear after admin approval.
        </div>
      )}

      {error && (
        <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", color: "#721c24" }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ─── Core Info ─── */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Basic Information</div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Title *</label>
            <input name="title" value={form.title} placeholder="e.g. 3BR House in Colombo 7" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={form.description} placeholder="Describe the property..." onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Price (LKR) *</label>
            <input name="price" type="number" value={form.price} placeholder="e.g. 5000000" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "0" }}>
            <label style={labelStyle}>Listing Type *</label>
            <select name="listing_type" value={form.listing_type} onChange={handleChange} style={inputStyle}>
              <option value="">Select Type</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
        </div>

        {/* ─── Property Details ─── */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Property Details</div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Property Type</label>
            <input name="property_type" value={form.property_type} placeholder="e.g. House, Apartment, Villa" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Bedrooms</label>
              <input name="bedrooms" type="number" value={form.bedrooms} placeholder="e.g. 3" onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bathrooms</label>
              <input name="bathrooms" type="number" value={form.bathrooms} placeholder="e.g. 2" onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ─── Location ─── */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Location</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city} placeholder="Colombo" onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>District</label>
              <input name="district" value={form.district} placeholder="Colombo" onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Province</label>
              <input name="province" value={form.province} placeholder="Western" onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ─── Rental Fields — shown ONLY when listing_type === "rent" ─── */}
        {isRent && (
          <>
            {/* Section 1 - Pricing */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #e74c3c" }}>
              <div style={sectionTitleStyle}>Section 1 — Rental Pricing</div>

              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Rent Price (LKR/month) *</label>
                <input name="rent_price" type="number" value={form.rent_price} placeholder="e.g. 45000" onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Billing Cycle *</label>
                <select name="billing_cycle" value={form.billing_cycle} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Cycle</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Security Deposit (LKR)</label>
                <input name="security_deposit" type="number" value={form.security_deposit} placeholder="e.g. 90000" onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {/* Section 2 - Availability */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #3498db" }}>
              <div style={sectionTitleStyle}>Section 2 — Availability</div>
              <div>
                <label style={labelStyle}>Available From</label>
                <input name="available_from" type="date" value={form.available_from} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {/* Section 3 - Lease */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #2ecc71" }}>
              <div style={sectionTitleStyle}>Section 3 — Lease Terms</div>
              <div>
                <label style={labelStyle}>Lease Term</label>
                <select name="lease_term" value={form.lease_term} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Term</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            {/* Section 4 - Tenant */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #9b59b6" }}>
              <div style={sectionTitleStyle}>Section 4 — Tenant Preference</div>
              <div>
                <label style={labelStyle}>Tenant Type</label>
                <select name="tenant_type" value={form.tenant_type} onChange={handleChange} style={inputStyle}>
                  <option value="">Any</option>
                  <option value="Family">Family</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Students">Students</option>
                </select>
              </div>
            </div>

            {/* Section 5 - Property Info */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #f39c12" }}>
              <div style={sectionTitleStyle}>Section 5 — Property Info</div>

              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Furnishing Level</label>
                <select name="furnishing" value={form.furnishing} onChange={handleChange} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Parking Available</label>
                <select name="parking_available" value={form.parking_available} onChange={handleChange} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            {/* Section 6 - Media */}
            <div style={{ ...sectionStyle, borderLeft: "4px solid #1abc9c" }}>
              <div style={sectionTitleStyle}>Section 6 — Media</div>
              <div>
                <label style={labelStyle}>Video Link (YouTube or Google Drive)</label>
                <input
                  name="video_link"
                  value={form.video_link}
                  placeholder="https://youtube.com/watch?v=..."
                  onChange={handleChange}
                  style={inputStyle}
                />
                <span style={{ fontSize: "12px", color: "#888" }}>
                  Only YouTube or Google Drive links are accepted.
                </span>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#aaa" : "#1a1a2e",
            color: "white",
            padding: "12px 28px",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
            marginTop: "8px",
          }}
        >
          {loading ? "Submitting..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
