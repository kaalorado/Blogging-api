import request from "supertest";
import app from "../server.js"; // or your express app file
import mongoose from "mongoose";
import User from "../models/User.js";
import Blog from "../models/Blog.js";

let accessToken;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL);

  // Create a test user
  const userRes = await request(app)
    .post("/auth/signup")
    .send({
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      password: "123456"
    });

  // Login and get access token
  const loginRes = await request(app)
    .post("/auth/login")
    .send({
      email: "testuser@example.com",
      password: "123456"
    });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Blog API Endpoints", () => {
  let blogId;

  it("should create a new blog", async () => {
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My First Blog",
        description: "This is a test blog",
        body: "This is the content of the blog for testing reading time calculation.",
        tags: ["test", "blog"]
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.blog.title).toBe("My First Blog");
    blogId = res.body.blog._id;
  });

  it("should publish the blog", async () => {
    const res = await request(app)
      .patch(`/blogs/${blogId}/publish`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.blog.state).toBe("published");
  });

  it("should return all published blogs", async () => {
    const res = await request(app).get("/blogs");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return a single blog and increment read count", async () => {
    const res = await request(app).get(`/blogs/${blogId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.read_count).toBeGreaterThanOrEqual(1);
  });

  it("should delete a blog", async () => {
    const res = await request(app)
      .delete(`/blogs/${blogId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Blog deleted successfully");
  });
});
