// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'userpassword',
  database: process.env.DB_NAME || 'rideshare_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection to MySQL
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
  connection.release();  // Release connection back to the pool
});

// API routes

// Example: Get all rides
app.get('/api/rides', (req, res) => {
  const query = 'SELECT * FROM Rides';
  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Example: Get a single ride by ID
app.get('/api/rides/:id', (req, res) => {
  const rideId = req.params.id;
  const query = 'SELECT * FROM Rides WHERE Ride_ID = ?';
  pool.query(query, [rideId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.json(results[0]);
  });
});

// Example: Add a new ride
app.post('/api/rides', (req, res) => {
  const { Driver_ID, Passenger_ID, Start_Point, End_Point, Fare } = req.body;
  const query = 'INSERT INTO Rides (Driver_ID, Passenger_ID, Start_Point, End_Point, Fare) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [Driver_ID, Passenger_ID, Start_Point, End_Point, Fare], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Ride added successfully', rideId: result.insertId });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


