import dotenv from "dotenv";
import connectDB from "./config/db.js";
import createApp from "./app.js";

dotenv.config();

const app = createApp();

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  await connectDB();

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup error:", error.message);
  process.exit(1);
});
