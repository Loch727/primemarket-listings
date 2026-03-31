const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// POST /api/listings
// Create a new listing — always saved as "pending"
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      property,
      location,
      media,
      video_link,
      rental,
    } = req.body;

    // Required field validation
    if (!title || !price || !property?.listing_type) {
      return res.status(400).json({
        error: "title, price, and listing_type are required",
      });
    }

    // Rental-specific validation
    if (property.listing_type === "rent") {
      if (!rental) {
        return res.status(400).json({
          error: "rental fields are required when listing_type is 'rent'",
        });
      }

      if (!rental.rent_price || rental.rent_price <= 0) {
        return res.status(400).json({
          error: "rent_price must be a positive number",
        });
      }

      const validCycles = ["Monthly", "Weekly", "Daily"];
      if (!rental.billing_cycle || !validCycles.includes(rental.billing_cycle)) {
        return res.status(400).json({
          error: "billing_cycle must be one of: Monthly, Weekly, Daily",
        });
      }
    }

    // Video link validation (if provided)
    if (video_link) {
      const validVideoHosts =
        video_link.includes("youtube.com") ||
        video_link.includes("youtu.be") ||
        video_link.includes("drive.google.com");

      if (!validVideoHosts) {
        return res.status(400).json({
          error:
            "video_link must be a YouTube (youtube.com / youtu.be) or Google Drive URL",
        });
      }
    }

    const listing = new Listing({
      title,
      description,
      price,
      category: category || "property",
      status: "pending", // always start as pending
      property,
      location,
      media: media || [],
      video_link: video_link || null,
      rental: property.listing_type === "rent" ? rental : undefined,
    });

    const saved = await listing.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/listings
// Return ONLY active listings (public view)
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
