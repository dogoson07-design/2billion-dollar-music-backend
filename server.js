const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.json({
    app: "2Billion Dollar Music",
    status: "online",
    version: "2.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: Boolean(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    music: true,
    distribution: true,
    bookings: true,
    payments: true
  });
});

/* ARTISTS */
app.get("/api/artists", async (req, res) => {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    artists: data
  });
});

/* RELEASES */
app.get("/api/releases", async (req, res) => {
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    releases: data
  });
});

/* BOOKING */
app.post("/api/bookings", async (req, res) => {
  const {
    customerId,
    artistId,
    service,
    bookingDate,
    bookingTime,
    location,
    notes,
    amount
  } = req.body;

  if (!service || !bookingDate || !amount) {
    return res.status(400).json({
      success: false,
      message: "Service, date and amount are required"
    });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: customerId || null,
      artist_id: artistId || null,
      service,
      booking_date: bookingDate,
      booking_time: bookingTime || null,
      location: location || null,
      notes: notes || null,
      amount,
      status: "pending",
      payment_status: "unpaid"
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    booking: data,
    payment_status: "unpaid"
  });
});

/* DISTRIBUTION SUBMISSION */
app.post("/api/distribution/submissions", async (req, res) => {
  const {
    artistId,
    songTitle,
    genre,
    audioUrl,
    coverUrl,
    fee
  } = req.body;

  if (!songTitle || !fee) {
    return res.status(400).json({
      success: false,
      message: "Song title and submission fee are required"
    });
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      artist_id: artistId || null,
      song_title: songTitle,
      genre: genre || null,
      audio_url: audioUrl || null,
      cover_url: coverUrl || null,
      fee,
      payment_status: "pending",
      review_status: "pending"
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    submission: data,
    payment_status: "pending"
  });
});

/* PAYMENT RECORD */
app.post("/api/payments/record", async (req, res) => {
  const {
    userId,
    bookingId,
    submissionId,
    amount,
    transactionReference,
    status
  } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Amount is required"
    });
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId || null,
      booking_id: bookingId || null,
      submission_id: submissionId || null,
      amount,
      currency: "KES",
      provider: "mpesa",
      transaction_reference: transactionReference || null,
      status: status || "pending"
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    payment: data
  });
});

app.listen(PORT, () => {
  console.log(`2Billion Dollar Music API running on port ${PORT}`);
});
