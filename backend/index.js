const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Notes App Backend");
});

app.get("/addusers", (req, res) => {
  pool.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error("Error getting users:", err);
      res.status(500).json({ message: "Error getting users" });
    } else {
      res.status(200).json(result.rows);
    }
  });
});

app.post("/addusers", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, password]
    );

    const newUser = result.rows[0]; // Get the newly inserted user data
    client.release();

    console.log("User signed up:", username);
    res.status(200).json({ message: "Signup successful", user: newUser }); // Include the user data in the response
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    client.release();

    if (result.rows.length === 0) {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      // Incorrect password
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Login successful
    res.status(200).json({ message: "Login successful", user: user });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});
app.post("/notes", async (req, res) => {
  const { user_id, title, content } = req.body;

  // Check if user_id is undefined or null
  if (user_id === undefined || user_id === null) {
    return res.status(400).json({ message: "user_id is missing or invalid" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)",
      [user_id, title, content]
    );
    client.release();

    console.log("Note added for user ID:", user_id);
    res.status(200).json({ message: "Note added successfully" });
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ message: "Error adding note" });
  }
});


app.get("/notes/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM notes WHERE user_id = $1",
      [user_id]
    );
    client.release();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM notes WHERE id = $1", [id]);
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
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3",
      [title, content, id]
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
