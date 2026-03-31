const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// GET /api/admin/listings
// Return ALL listings including pending — for admin review
router.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/listings/:id/accept
// Approve a listing — changes status from "pending" to "active"
router.patch("/listings/:id/accept", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.status === "active") {
      return res.status(400).json({ error: "Listing is already active" });
    }

    listing.status = "active";
    const updated = await listing.save();

    res.json(updated);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid listing ID" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admin/listings/:id
// Permanently delete a listing
router.delete("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid listing ID" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
