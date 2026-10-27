const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => {
  res.send("Roblox Username Checker backend is running.");
});

app.get("/api/check", async (req, res) => {
  const username = String(req.query.username || "");

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      error: "Username must be 3–20 characters using letters, numbers, or underscores."
    });
  }

  try {
    const url =
      "https://auth.roblox.com/v1/usernames/validate" +
      "?username=" + encodeURIComponent(username) +
      "&birthday=2000-01-01&context=Signup";

    const response = await fetch(url, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Roblox returned HTTP " + response.status
      });
    }

    const data = await response.json();

    res.json({
      username,
      code: data.code,
      message: data.message || "",
      available: data.code === 0
    });
  } catch (error) {
    res.status(502).json({
      error: "Could not reach Roblox. Try again later."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Username checker backend listening on port " + PORT);
});
