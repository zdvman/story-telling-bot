// server.js

const express = require("express"); // Import Express
const cors = require("cors"); // Import CORS middleware
const Anthropic = require("@anthropic-ai/sdk"); // Import the Anthropic SDK
require("dotenv").config(); // Load environment variables from .env file

const app = express(); // Initialize the Express app

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON parsing for incoming requests

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Use the API key from the .env file
});

app.post("/api/get-poem", async (req, res) => {
  const { prompt } = req.body;
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: "you are the poet and your answer is always a poem",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Assuming the API returns an array of blocks, filter and map them to extract the text content
    const textContent = msg.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ content: textContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate poem" });
  }
});

const port = process.env.PORT || 3000; // Use the port from environment variables or default to 3000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
