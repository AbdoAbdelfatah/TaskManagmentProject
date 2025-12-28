import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(5000, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
