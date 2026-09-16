require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 2000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SALT_ROUNDS = 10;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// --- Auth Middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// --- Helper ---
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Routes ---

app.get("/", (req, res) => {
  res.send("Notes App Backend");
});

// Signup
app.post("/addusers", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const client = await pool.connect();

    // Check for duplicate email
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      client.release();
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await client.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    client.release();

    const token = generateToken(newUser);
    console.log("User signed up:", username);
    res.status(201).json({
      message: "Signup successful",
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      token,
    });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// --- Notes (protected) ---

// Create note
app.post("/notes", authenticateToken, async (req, res) => {
  const { title, content, color } = req.body;
  const userId = req.user.id;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO notes (user_id, title, content, color) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, title.trim(), content || "", color || "default"]
    );
    client.release();

    console.log("Note added for user ID:", userId);
    res.status(201).json({ message: "Note added successfully", note: result.rows[0] });
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ message: "Error adding note" });
  }
});

// Get user's notes (pinned first, then by updated_at)
app.get("/notes", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;

  try {
    const client = await pool.connect();
    let result;

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      result = await client.query(
        "SELECT * FROM notes WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2) ORDER BY pinned DESC, updated_at DESC",
        [userId, searchTerm]
      );
    } else {
      result = await client.query(
        "SELECT * FROM notes WHERE user_id = $1 ORDER BY pinned DESC, updated_at DESC",
        [userId]
      );
    }
    client.release();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Update note
app.put("/notes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, color } = req.body;
  const userId = req.user.id;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE notes SET title = $1, content = $2, color = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5",
      [title.trim(), content || "", color || "default", id, userId]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note updated with ID:", id);
    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Error updating note" });
  }
});

// Toggle pin
app.patch("/notes/:id/pin", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE notes SET pinned = NOT pinned, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING pinned",
      [id, userId]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
      message: result.rows[0].pinned ? "Note pinned" : "Note unpinned",
      pinned: result.rows[0].pinned,
    });
  } catch (err) {
    console.error("Error toggling pin:", err);
    res.status(500).json({ message: "Error toggling pin" });
  }
});

// Delete note
app.delete("/notes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note deleted with ID:", id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note" });
  }
});

// Only start listening when not imported (for Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
