import express from "express";
import Blog from "../models/Blog.js";
import verifyToken from "../middleware/auth.js";

const blogRoute = express.Router();


  // Create a blog (Logged in users only)
 
blogRoute.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, body, tags, state } = req.body;

    const blog = new Blog({
      title,
      description,
      body,
      tags,
      state: state || "draft", // default to draft if not provided
      author: req.user.id
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all published blogs (Anyone can access)

blogRoute.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ state: "published" })
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  Get a single published blog (Anyone can access)
 
blogRoute.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, state: "published" })
      .populate("author", "firstName lastName email");

    if (!blog) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    // increment read count
    blog.read_count += 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 //GET ALL BLOGS BY LOGGED-IN USER
   //- Paginated
   //- Filterable by state (draft/published)
blogRoute.get("/user/myblogs", verifyToken, async (req, res) => {
  try {
    const { state, page = 1, limit = 10 } = req.query;
    const filter = { author: req.user.id };
    if (state) filter.state = state;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      blogs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


  //  UPDATE BLOG (title, body, tags, etc.)
  //  Only by owner

blogRoute.put("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    if (blog.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    const { title, description, body, tags } = req.body;

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (body) blog.body = body;
    if (tags) blog.tags = tags;

    await blog.save();
    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


   //CHANGE BLOG STATE (draft → published)
    //only by owner

blogRoute.patch("/:id/publish", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    if (blog.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    blog.state = "published";
    await blog.save();

    res.json({ message: "Blog published successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


   //DELETE BLOG (draft or published)
   //Only by owner

blogRoute.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    if (blog.author.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default blogRoute;
