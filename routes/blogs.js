const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Load blog data from JSON file
const blogsFilePath = path.join(__dirname, '../data/blogs.json');


// Helper function to read blogs from the file
const readBlogs = () => {
  const data = fs.readFileSync(blogsFilePath);
  return JSON.parse(data);
};

// Get all blogs
router.get('/', (req, res) => {
  const blogs = readBlogs();
  res.json(blogs);
});

// Get blog by ID
router.get('/:id', (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find(b => b.id == req.params.id);
  console.log(`Blog with id ${req.params.id} not found`);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

// Create a blog post
router.post('/', upload.single('image'), (req, res) => {
  const { title, author, date, shortDescription, image, content } = req.body;
  const imageName = req.file ? req.file.filename : ''; // Get the uploaded file's name
  // Read existing blogs
  const blogs = readBlogs();


  // Set storage engine
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit size to 1MB
}).single('image');


  
  try {
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
router.post('/:id/comments', (req, res) => {
  try{
  const { username, comment } = req.body;
  const blogs = readBlogs();
  const blog = blogs.find(b => b.id == req.params.id);
  
  if (!blog) {return res.status(404).json({ message: 'Blog not found' });
  }
  const newComment = {
    id: blog.comments.length + 1,
    username,
    comment,
    replies: []
  };
      // Initialize comments array if it doesn't exist
      if (!blog.comments) {
        blog.comments = [];
      }
  
  blog.comments.push(newComment);
  
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
  res.status(201).json(newComment);

} catch (error) {
  console.error('Error adding comment:', error); // Log the error to the console
  res.status(500).json({ message: 'Error adding comment', error: error.message });
}

});

// Reply to a comment
router.post('/:id/comments/:commentId/reply', (req, res) => {
  const { username, reply } = req.body;
  const blogs = readBlogs();
  const blog = blogs.find(b => b.id == req.params.id);
  
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  
  const comment = blog.comments.find(c => c.id == req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
  const newReply = {
    id: comment.replies.length + 1,
    username,
    reply
  };
  comment.replies.push(newReply);
  
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
  res.status(201).json(newReply);
});

// Delete a comment
router.delete('/:id/comments/:commentId', (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find(b => b.id == req.params.id);
  
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  
  const commentIndex = blog.comments.findIndex(c => c.id == req.params.commentId);
  if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });
  
  blog.comments.splice(commentIndex, 1);
  
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
  res.status(204).send();
});

module.exports = router;
