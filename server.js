const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "2Billion Dollar Music",
    status: "online",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    music: true,
    distribution: true,
    bookings: true,
    payments: true
  });
});

app.post("/api/bookings", (req, res) => {
  const {
    customerName,
    phone,
    service,
    date,
    time,
    amount
  } = req.body;

  if (!customerName || !phone || !service || !date || !amount) {
    return res.status(400).json({
      success: false,
      message: "Missing booking information"
    });
  }

  res.json({
    success: true,
    status: "pending_payment",
    message: "Booking created. Payment integration will confirm it.",
    booking: {
      customerName,
      phone,
      service,
      date,
      time,
      amount
    }
  });
});

app.post("/api/distribution/submissions", (req, res) => {
  const {
    artistName,
    songTitle,
    genre,
    amount
  } = req.body;

  if (!artistName || !songTitle || !amount) {
    return res.status(400).json({
      success: false,
      message: "Artist, song title and fee are required"
    });
  }

  res.json({
    success: true,
    status: "pending_payment",
    message: "Submission created. Payment is required before review.",
    submission: {
      artistName,
      songTitle,
      genre: genre || "",
      amount
    }
  });
});

app.get("/api/releases", (req, res) => {
  res.json({
    success: true,
    releases: []
  });
});

app.get("/api/artists", (req, res) => {
  res.json({
    success: true,
    artists: []
  });
});

app.listen(PORT, () => {
  console.log(`2Billion Dollar Music API running on port ${PORT}`);
});
