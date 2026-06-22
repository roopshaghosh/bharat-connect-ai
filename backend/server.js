const express =
  require("express");

const dotenv =
  require("dotenv");

const cors =
  require("cors");

const http =
  require("http");

const connectDB =
  require("./config/db");

const { initSocket } =
  require("./config/socket");

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

const chatRoutes =
  require("./routes/chatRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const { initializeBadges } =
  require("./config/badgeAwarder");

dotenv.config();

connectDB().then(() => {
  initializeBadges();
});

const app =
  express();

const server =
  http.createServer(app);

initSocket(server);

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/opportunities", opportunityRoutes);
app.use("/api/volunteer/opportunities", opportunityRoutes);

app.use("/api/applications", applicationRoutes);
app.use("/api/volunteer/applications", applicationRoutes);

app.use("/api/blood", bloodRoutes);

app.use("/api/blood-donation", bloodRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/buddy", buddyRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/notifications", notificationRoutes);

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

server.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);