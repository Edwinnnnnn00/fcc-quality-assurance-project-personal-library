"use strict";

// Rest of your code...
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");
const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

// Use for static assets
app.use("/public", express.static(process.cwd() + "/public"));

// Allow CORS (used for FCC testing)
app.use(cors({ origin: "*" }));

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection setup
const mongoURI = process.env.DB; // The MongoDB URI from your .env file

connectToMongoDB(app);

// Index route (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// For FCC testing purposes
fccTestingRoutes(app);

// Start the server and tests
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 3000);
  }
});

async function connectToMongoDB(app) {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Now you can access collections or perform operations
    const myDataBase = await client
      .db("FCC_QAProject_PersonalLibrary")
      .collection("books");

    apiRoutes(app, myDataBase); // Pass collection to API routes
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

module.exports = app; // for unit/functional testing
