const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('./db');

// Load user data from JSON file
// const usersFilePath = path.join(__dirname, '../data/users.json');

// // Helper function to read users from the file
// const readUsers = () => {
//   const data = fs.readFileSync(usersFilePath);
//   return JSON.parse(data);
// };

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [userCheck] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (userCheck.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = bcrypt.hashSync(password, 8);
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: 'Error saving user. Please try again later.' });
  }
});


// Login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!user.length || !bcrypt.compareSync(password, user[0].password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user[0].id }, '1133', { expiresIn: '24h' });
    res.json({ auth: true, token, message: 'Login successful' });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Login error' });
  }
});

  // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
  // res.json({ auth: true, token });


// Logout a user
router.post('/logout', (req, res) => {
  res.json({ auth: false, token: null });
});

module.exports = router;
