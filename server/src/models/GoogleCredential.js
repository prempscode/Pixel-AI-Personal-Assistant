const mongoose = require("mongoose");

const googleCredentialSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  encrypted: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  authTag: {
    type: String,
    required: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GoogleCredential", googleCredentialSchema);
