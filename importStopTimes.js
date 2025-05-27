const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const readline = require("readline");

const db = new sqlite3.Database("gtfs.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS stop_times (
            trip_id TEXT,
            arrival_time TEXT,
            departure_time TEXT,
            stop_id TEXT,
            stop_sequence INTEGER, 
            stop_headsign TEXT,
            pickup_type INTEGER,
            drop_off_type INTEGER,
            timepoint INTEGER
        );
    `);

    db.run("BEGIN TRANSACTION"); // Start a transaction for speed

    const rl = readline.createInterface({
        input: fs.createReadStream(
            "C:/Users/nichi/Desktop/gtfs-backend/assets/rawData/AllStaticText/stop_times.txt"
        ),
        crlfDelay: Infinity,
    });

    let isFirst = true;
    let counter = 0;

    rl.on("line", (line) => {
        if (isFirst) {
            isFirst = false; // Skip header
            return;
        }

        const [
            trip_id,
            arrival_time,
            departure_time,
            stop_id,
            stop_sequence,
            stop_headsign,
            pickup_type,
            drop_off_type,
            timepoint,
        ] = line.split(",");

        db.run(
            `INSERT INTO stop_times (
                trip_id,
                arrival_time,
                departure_time,
                stop_id,
                stop_sequence,
                stop_headsign,
                pickup_type,
                drop_off_type,
                timepoint
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                trip_id,
                arrival_time,
                departure_time,
                stop_id,
                parseInt(stop_sequence),
                stop_headsign,
                pickup_type ? parseInt(pickup_type) : null,
                drop_off_type ? parseInt(drop_off_type) : null,
                timepoint ? parseInt(timepoint) : null,
            ]
        );

        counter++;
        if (counter % 100000 === 0) {
            console.log(`${counter} lines inserted...`);
        }
    });

    rl.on("close", () => {
        db.run("COMMIT"); // Commit the transaction
        console.log("✅ Import complete.");
        db.close();
    });
});
