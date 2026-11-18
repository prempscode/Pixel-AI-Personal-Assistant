const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const agentRoutes = require("./routes/agentRoutes");
const googleRoutes = require("./routes/googleRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Agent Server Running" });
});

app.use("/api/agent", agentRoutes);
app.use("/api/google", googleRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
