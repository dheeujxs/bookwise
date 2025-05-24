require("dotenv").config(); // 🔥 sabse pehle

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const bookRouter = require("./router/book");
const userRouter = require("./router/users");
const wrapAsync = require("./utils/wrapAsync");
const Visitor = require("./models/visits");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "./public")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => {
    console.log("❌ Error Connecting to Database");
    console.error(err);
  });

// Routes
app.use("/books", bookRouter);
app.use("/users", userRouter);

app.post(
  "/log-visit",
  wrapAsync(async (req, res) => {
    const { userAgent } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visitCount += 1;
      await visitor.save();
      return res.status(200).json({
        message: "Visit logged",
        newVisitor: false,
        totalVisitors: await Visitor.countDocuments(),
        totalVisits: visitor.visitCount,
      });
    } else {
      visitor = new Visitor({ userAgent, ip });
      await visitor.save();
      return res.status(200).json({
        message: "New visitor created",
        newVisitor: true,
        totalVisitors: await Visitor.countDocuments(),
        totalVisits: visitor.visitCount,
      });
    }
  })
);

app.get("/", (req, res) => {
  res.json({ message: "This is home route" });
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ message });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
