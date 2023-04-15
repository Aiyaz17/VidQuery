const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

module.exports = () => {
  mongoose.connect(uri, () => {
    console.log("Connected to MongoDB");
  });
};
