const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const dbconnect = "mongodb+srv://jyotisharma6672:19Oct2001%40@em.x62ay.mongodb.net/?retryWrites=true&w=majority&appName=em";

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(dbconnect, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
});

const Users = mongoose.model("users", userSchema);

// ✅ Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Required Fields" });
  }

  try {
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({ username, password: hashedPassword });
    await newUser.save();

    // ✅ Match frontend expected message OR change frontend to "Registered Successfully"
    res.status(201).json({ message: "Register Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Required Fields" });
  }

  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Username does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Match exact message expected by frontend for redirect
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ✅ Delete User
app.post("/delete", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await Users.deleteOne({ username });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ✅ Update Password
app.post("/update", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ✅ Get All Users (excluding password)
app.get("/alluser", async (req, res) => {
  try {
    const allUsers = await Users.find({}, { password: 0 });
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ✅ Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ Serve home page explicitly (optional but helpful)
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
