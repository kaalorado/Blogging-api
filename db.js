import mongoose from "mongoose";

import dotenv from "dotenv";


dotenv.config();

const MONGO_DB_CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL


function connectToMongoDB() {
    mongoose.connect(MONGO_DB_CONNECTION_URL)

    mongoose.connection.on("connected", () => {
        console.log("connected successfully")
    })

    mongoose.connection.on("error", (err) => {
        console.log(err)
        console.log("an error occured!")
    })
}

export default connectToMongoDB;