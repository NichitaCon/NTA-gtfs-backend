const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('gtfs.db');

db.serialize(() => {
  db.run('CREATE INDEX IF NOT EXISTS idx_stop_id ON stop_times(stop_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_trip_id ON stop_times(trip_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_stop_sequence ON stop_times(stop_sequence)');
});

db.close();
