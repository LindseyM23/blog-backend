const express = require('express');
// const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const db = require('./db');
// Set up multer for file uploads

// const upload = multer({ dest: 'uploads/' });

// Load blog data from JSON file
// const blogsFilePath = path.join(__dirname, '../data/blogs.json');


// Helper function to read blogs from the file
// const readBlogs = () => {
//   const data = fs.readFileSync(blogsFilePath);
//   return JSON.parse(data);
// };

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const [blogs] = await db.query('SELECT * FROM blogs');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [blog] = await db.query('SELECT * FROM blogs WHERE id = ?', [id]);
    if (!blog.length) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog[0]);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog' });
  }
});



// Create a blog post
router.post('/', upload.single('image'), async (req, res) => {
  const { title, author, shortDescription, content } = req.body;
  const imageName = req.file ? req.file.filename : '';
  const date = new Date().toISOString();
  try {
    const [result] = await db.query(
      'INSERT INTO blogs (title, author, date, short_description, content, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, date, shortDescription, content, imageName]
    );
    const newBlog = { id: result.insertId, title, author, date, shortDescription, content, image: imageName, comments: [] };
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog' });
  }
});



  // Set storage engine
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // Specify your upload folder here
    },
    filename: (req, file, cb) => {
      const imageName = Date.now() + path.extname(file.originalname); // Generate unique filename
      cb(null, imageName);
    }
  });
  
  

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit size to 1MB
}).single('image');

// Handle creating a new blog
app.post('/create-blog', upload, (req, res) => {
  const { title, content, shortDescription, author } = req.body;
  const imageName = req.file ? req.file.filename : null; // Get uploaded file name

 

  
  try {
    let blogs = JSON.parse(fs.readFileSync(blogsFilePath, 'utf-8'));
    // Create a new blog instance
    const newBlog = {
      id: blogs.length + 1, // Unique ID
      title,
      content,
      shortDescription,
      image: imageName,
      author: req.user ? req.user.id : author, // Check if user is authenticated
      date: new Date().toISOString(), // Automatically set the creation date in ISO format
      comments: [] 
    };

    // Add new blog to the array
    blogs.push(newBlog);

    // Write the updated blogs array back to the JSON file
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));

    // Send back a response with the created blog post details
    res.status(201).json({
      message: 'Blog created successfully',
      blog: newBlog, // Return the complete new blog object
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog' });
  }
});


  
  // fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
  // res.status(201).json(newBlog);


// Comment on a blog post
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { username, comment } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO comments (blog_id, username, comment_content) VALUES (?, ?, ?)',
      [id, username, comment]
    );
    const newComment = { id: result.insertId, username, comment, replies: [] };
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});


// Reply to a comment
router.post('/:id/comments/:commentId/reply', async (req, res) => {
  const { id, commentId } = req.params;
  const { username, reply } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO replies (comment_id, username, reply_content) VALUES (?, ?, ?)',
      [commentId, username, reply]
    );
    const newReply = { id: result.insertId, username, reply };
    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Error adding reply' });
  }
});


// Delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  try {
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});


module.exports = router;
