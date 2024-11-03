require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blogs');
require('dotenv').config();


// Allow requests from your frontend URL
// app.use(cors({
//   origin: 'http://localhost:3000', // Your frontend URL
//   credentials: true,
// }));



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
