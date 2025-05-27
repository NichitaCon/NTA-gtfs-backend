require("dotenv").config(); // Load .env variables at the very top
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get("/health", (req, res) => {
    res.send("Backend is running!");
});

// Endpoint to fetch real-time trip updates
app.get("/trip-updates", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json",
            {
                headers: {
                    "x-api-key": process.env.API_KEY,
                },
            }
        );
        const data = response.data.entity;
        console.log("data length:", data.length)
        res.json(data);
    } catch (error) {
        console.error("Error fetching trip updates:", error);
        res.status(500).json({ error: "Failed to fetch trip updates" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
