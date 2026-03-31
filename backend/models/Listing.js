const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    category: {
      type: String,
      default: "property",
    },

    // "pending" when first submitted, "active" after admin approves
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
    },

    property: {
      listing_type: {
        type: String,
        required: [true, "Listing type is required"],
        enum: ["sale", "rent"],
      },
      property_type: { type: String },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
    },

    location: {
      city: { type: String },
      district: { type: String },
      province: { type: String },
    },

    media: [{ type: String }],

    // Optional: video link (YouTube or Google Drive only)
    video_link: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional field
          return (
            v.includes("youtube.com") ||
            v.includes("youtu.be") ||
            v.includes("drive.google.com")
          );
        },
        message:
          "video_link must be a YouTube (youtube.com / youtu.be) or Google Drive (drive.google.com) URL",
      },
    },

    // Rental-specific fields — grouped in one object for clarity
    // Only present when listing_type === "rent"
    rental: {
      rent_price: {
        type: Number,
        min: [0, "rent_price must be a positive number"],
      },
      billing_cycle: {
        type: String,
        enum: {
          values: ["Monthly", "Weekly", "Daily"],
          message: "billing_cycle must be Monthly, Weekly, or Daily",
        },
      },
      security_deposit: { type: Number },
      available_from: { type: Date },
      lease_term: {
        type: String,
        enum: ["6 months", "1 year", "Flexible"],
      },
      tenant_type: {
        type: String,
        enum: ["Family", "Bachelor", "Students"],
      },
      furnishing: {
        type: String,
        enum: ["Furnished", "Semi", "Unfurnished"],
      },
      parking_available: { type: Boolean },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", ListingSchema);
