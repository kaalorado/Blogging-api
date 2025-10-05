import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  state: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },
  read_count: {
    type: Number,
    default: 0
  },
  reading_time: {
    type: Number // will be auto-calculated before saving
  },
  tags: {
    type: [String],
    default: []
  },
  body: {
    type: String,
    required: true
  }
}, { timestamps: true });

// 🔹 Middleware to calculate reading_time before saving
blogSchema.pre("save", function (next) {
  const wordsPerMinute = 200;
  if (this.body) {
    const words = this.body.split(" ").length;
    this.reading_time = Math.ceil(words / wordsPerMinute);
  }
  next();
});

export default mongoose.model("Blog", blogSchema);
