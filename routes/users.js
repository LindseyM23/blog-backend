const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load user data from JSON file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to read users from the file
const readUsers = () => {
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

// Register a new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  console.log("Received data:", req.body);
  const users = readUsers();
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);
  
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: 'Error saving user. Please try again later.' });
  }
});

// Login a user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", req.body);

  const users = readUsers();
  
  const user = users.find(user => user.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
    // If credentials are correct, send a success response
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '24h' }); // Replace 'your_jwt_secret' with a real secret key
    res.json({ auth: true, token, message: 'Login successful' });
  });
  
  
  // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
  // res.json({ auth: true, token });


// Logout a user
router.post('/logout', (req, res) => {
  res.json({ auth: false, token: null });
});

module.exports = router;
