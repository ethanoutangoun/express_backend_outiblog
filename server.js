// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema and model
const commentSchema = new mongoose.Schema({
  cid: String,
  username: String,
  text: String,
  date: Date,
  likes: Number,
  edited: Boolean,
});

const blogSchema = new mongoose.Schema({
  title: String,
  body: String,
  author: String,
  comments: [commentSchema],
  id: Number,
  date: {
    type: Date,
    default: Date.now, // This sets the default value to the current date and time
  }
  
});

const Blog = mongoose.model('Blogs', blogSchema);

app.use(express.json());
app.use(cors());

// get ALL blogs (may change just to a few once I scale up)
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
    console.log("Returned blog")
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log("EERRORRR")
  }
});


//change id to _id (for mongo)
app.get('/api/blogs/:id', async (req, res) => {
    const blogId = req.params.id;
  
    try {
      const blog = await Blog.findOne({ _id: blogId });
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  
  
  


//change id to _id (for mongo)
app.delete('/api/blogs/:id', async (req, res) => {
    const blogId = req.params.id;
  
    try {
      // Find the blog by ID and remove it
      const deletedBlog = await Blog.findOneAndDelete({ _id: blogId });
  
      if (!deletedBlog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
  
      // Respond with a success message
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  app.post('/api/blogs', async (req, res) => {
    try {
      console.log(req.body)
      const { title, body, author } = req.body;
      
      if (!title || !body || !author) {
        return res.status(400).json({ error: 'Title, body, and author are required' });
      }
      
  
      const newBlog = new Blog({
        title,
        body,
        author,
        comments: [], // Initialize with empty comments array
        // Generate a new unique ID using ObjectId
      });
  
      await newBlog.save(); // Save the new blog to the database
  
      res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// PATCH route to update comments of a specific blog by its ID
app.patch('/api/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params; // Get the blog ID from the URL
      const { comments } = req.body; // Comments to be added or updated
  
      // Validate data
      if (!Array.isArray(comments)) {
        return res.status(400).json({ error: 'Comments must be an array' });
      }
  
      // Find the blog by its ID and update its comments
      const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { $set: { comments } },
        { new: true }
      );
  
      if (!updatedBlog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
  
      res.json({ message: 'Comments updated successfully', blog: updatedBlog });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
