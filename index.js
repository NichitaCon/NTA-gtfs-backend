require("dotenv").config(); // Load .env variables at the very top
const fs = require("fs").promises;
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
        console.log("data length:", data.length);
        res.json(data);
        // fs.writeFile(
        //     "tripUpdates.json",
        //     JSON.stringify(data, null, 2),
        //     (err) => {
        //         if (err) {
        //             console.error("Error writing file:", err);
        //         } else {
        //             console.log("Trip updates saved to tripUpdates.json");
        //         }
        //     }
        // );
    } catch (error) {
        console.error("Error fetching trip updates:", error);
        res.status(500).json({ error: "Failed to fetch trip updates" });
    }
});

// ENDPOINT for specific stations
app.get("/trip-updates/:stationId", async (req, res) => {
    try {
        const stopId = req.params.stationId;

        // const response = await axios.get(
        //     "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json",
        //     {
        //         headers: {
        //             "x-api-key": process.env.API_KEY,
        //         },
        //     }
        // );
        // const data = response.data.entity;

        // Read and parse the JSON file asynchronously
        const jsonString = await fs.readFile("tripUpdates.json", "utf8");
        const data = JSON.parse(jsonString);
        console.log("Data length:", data.length);

        const filteredDataByStationId = data
            .filter((iteration) =>
                iteration.trip_update?.stop_time_update?.some(
                    (stop) => stop.stop_id === stopId
                )
            )
            .map((iteration) => {
                return {
                    ...iteration,
                    trip_update: {
                        ...iteration.trip_update,
                        stop_time_update:
                            iteration.trip_update.stop_time_update.filter(
                                (stop) => stop.stop_id === stopId
                            ),
                    },
                };
            });

        console.log("filtered data:", filteredDataByStationId);

        // console.log("data:", JSON.stringify(data, null, 2))
        console.log("Data length:", filteredDataByStationId.length);
        res.json(filteredDataByStationId);
    } catch (error) {
        console.error("Error fetching trip updates:", error);
        res.status(500).json({ error: "Failed to fetch trip updates" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
