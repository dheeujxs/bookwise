const ExpressError = require("../utils/ExpressErrors");
const bcrypt = require("bcryptjs");
const { SignJWT } = require("jose");
const User = require("../models/users");
const Book = require("../models/books");

// Helper: Check if email is master admin (your email)
const isMasterAdmin = (email) => {
  return email === "admin"; // You can change "admin" to your actual admin email
};

// Signup route
module.exports.signup = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) throw new ExpressError(400, "Email already exists");

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: isMasterAdmin(req.body.email) ? "admin" : "user",
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// Login route
module.exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new ExpressError(400, "Invalid email or password");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) throw new ExpressError(400, "Invalid email or password");

    if (isMasterAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET;
    const secretBytes = new TextEncoder().encode(secret);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(secretBytes);

    res.status(200).json({
      token,
      role: user.role,
      message: `Welcome ${user.firstName}! to BookWise`,
    });
  } catch (err) {
    next(err);
  }
};

// Google auth route
module.exports.googleAuth = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        picture: req.body.picture,
        auth_method: "google",
        role: isMasterAdmin(req.body.email) ? "admin" : "user",
      });
    } else {
      user.auth_method = "google";
      user.picture = req.body.picture;
      if (isMasterAdmin(user.email) && user.role !== "admin") {
        user.role = "admin";
      }
    }

    await user.save();

    const payload = {
      id: user._id,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET;
    const secretBytes = new TextEncoder().encode(secret);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(secretBytes);

    res.status(200).json({
      token,
      role: user.role,
      message: `Welcome ${user.firstName}! to BookWise`,
    });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin only)
module.exports.getAllUsers = async (req, res, next) => {
  try {
    if (req.role !== "admin") throw new ExpressError(401, "Not Authorized");

    const users = await User.find({}, "-password");
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Report a user
module.exports.reportUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const susId = req.params.userId;

    await User.findByIdAndUpdate(susId, {
      $addToSet: { reportedBy: userId },
    });

    res.json({ message: "User Reported" });
  } catch (err) {
    next(err);
  }
};

// Toggle favorite book
module.exports.toggleFavouriteBook = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bookId } = req.body;

    if (!bookId) throw new ExpressError(400, "Book ID is required");

    const user = await User.findById(userId);
    if (!user) throw new ExpressError(404, "User not found");

    const book = await Book.findById(bookId);
    if (!book) throw new ExpressError(404, "Book not found");

    const isFavorite = user.favoriteBooks.includes(bookId);
    isFavorite ? user.favoriteBooks.pull(bookId) : user.favoriteBooks.push(bookId);

    await user.save();

    res.status(200).json({
      message: isFavorite
        ? "Book removed from favorites"
        : "Book added to favorites",
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Get favorite books
module.exports.getFavouriteBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("favoriteBooks");
    if (!user) throw new ExpressError(404, "User not found");

    res.status(200).json({ books: user.favoriteBooks });
  } catch (err) {
    next(err);
  }
};

// Get current user info
module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId, "-password");
    if (!user) throw new ExpressError(404, "User not found");

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// Get user by id
module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId, "-password");
    if (!user) throw new ExpressError(404, "User not Found");

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Promote or demote user (admin only)
module.exports.promoteUser = async (req, res, next) => {
  try {
    if (req.role !== "admin") {
      throw new ExpressError(401, "You are not authorized");
    }

    let user = await User.findById(req.params.userId);
    if (!user) throw new ExpressError(404, "User not found");

    if (isMasterAdmin(user.email)) {
      throw new ExpressError(401, "Master Admin cannot be modified");
    }

    user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: user.role === "user" ? "admin" : "user" },
      { new: true }
    );

    res.json({
      message: user.role === "admin"
        ? "User was Promoted to Admin"
        : "User was Demoted to User",
      user,
    });
  } catch (err) {
    next(err);
  }
};
