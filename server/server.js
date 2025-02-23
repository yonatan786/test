// server/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'calendar.db'), (err) => {
  if (err) {
    console.error('❌ Database Connection Error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create events table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('✅ Events table ready');
  }
});

// Routes
app.get('/api/events', (req, res) => {
  console.log('GET /api/events - Fetching all events');
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Retrieved events:', rows);
    res.json(rows);
  });
});

app.post('/api/events', (req, res) => {
  console.log('POST /api/events - Creating new event:', req.body);
  const { title, start, end } = req.body;
  
  db.run(
    'INSERT INTO events (title, start, end) VALUES (?, ?, ?)',
    [title, start, end],
    function(err) {
      if (err) {
        console.error('Error inserting event:', err);
        res.status(400).json({ error: err.message });
        return;
      }

      const newId = this.lastID;
      db.get('SELECT * FROM events WHERE id = ?', [newId], (err, row) => {
        if (err) {
          console.error('Error fetching new event:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log('Created new event:', row);
        res.status(201).json(row);
      });
    }
  );
});

app.delete('/api/events/:id', (req, res) => {
  console.log('DELETE /api/events/:id - Deleting event:', req.params.id);
  db.run(
    'DELETE FROM events WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) {
        console.error('Error deleting event:', err);
        res.status(400).json({ error: err.message });
        return;
      }
      console.log('Event deleted successfully');
      res.json({ message: 'Event deleted' });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📌 API endpoints:
   - GET    http://localhost:${PORT}/api/events     (Get all events)
   - POST   http://localhost:${PORT}/api/events     (Create new event)
   - DELETE http://localhost:${PORT}/api/events/:id (Delete event)
  `);
});
