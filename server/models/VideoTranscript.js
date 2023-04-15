const mongoose = require("mongoose");

const videoTranscript = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  videoUrl: {
    type: String,
    required: true,
  },

  transcript: {
    type: String,
    required: true,
  },
  documentsId: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("VideoTranscript", videoTranscript);
