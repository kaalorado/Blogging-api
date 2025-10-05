import express from "express";
import dotenv from "dotenv";
import connectToMongoDB from "./db.js";
import userRoute from "./routes/user.js";
import blogRoute from "./routes/blog.js";




dotenv.config();

const PORT = process.env.PORT
connectToMongoDB();
const app = express()
app.use(express.json());

app.use("/users", userRoute);
app.use("/blogs", blogRoute);

app.get("/", (req, res) => {
    res.send ("welcome here")

})

app.listen (PORT, ()=> {
    console.log(`server started on PORT: http://localhost:${PORT}`)
})