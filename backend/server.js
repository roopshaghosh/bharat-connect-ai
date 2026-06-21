const express =
  require("express");

const dotenv =
  require("dotenv");

const cors =
  require("cors");

const connectDB =
  require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const opportunityRoutes =
  require("./routes/opportunityRoutes");

const applicationRoutes =
  require("./routes/applicationRoutes");

const bloodRoutes =
  require("./routes/bloodRoutes");

const aiRoutes =
  require("./routes/aiRoutes");

const buddyRoutes =
  require("./routes/buddyRoutes");

dotenv.config();

connectDB();

const app =
  express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/opportunities", opportunityRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/blood", bloodRoutes);

app.use("/api/blood-donation", bloodRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/buddy", buddyRoutes);

app.get(
  "/",
  (req, res) => {
    res.send(
      "Bharat Connect Backend Running"
    );
  }
);

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);