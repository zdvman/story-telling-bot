// server.js

import express from "express"; // Импортируем Express
import cors from "cors"; // Импортируем CORS middleware
import mongoose from "mongoose"; // Импортируем Mongoose
import Anthropic from "@anthropic-ai/sdk"; // Импортируем Anthropic SDK
import dotenv from "dotenv"; // Импортируем dotenv для работы с переменными окружения
import Poems from "./src/models/poems.js"; // Импортируем модель Poems
import QRCode from "qrcode";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { poemsCollectionDeleteCronJob } from "./src/tasks/poems_cron.js";

// Создаем __dirname и __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Загружаем переменные окружения из соответствующего .env файла

const app = express(); // Инициализируем приложение Express

app.use(cors()); // Включаем CORS для всех маршрутов
app.use(express.json()); // Включаем JSON-парсинг для входящих запросов

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "dist")));

// Настройка для обслуживания статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Set up EJS as view engine
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

console.log("MONGO_URI:", process.env.MONGO_URI); // Логируем MongoDB URI
console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY); // Логируем API-ключ Anthropic
console.log("PORT:", process.env.PORT); // Логируем порт
console.log("API_URL:", process.env.API_URL); // Логируем API URL (по умолчанию http://localhost:3000)

// Используем MONGO_URI из .env файла
const mongoUri = process.env.MONGO_URI;
// Используем ANTHROPIC_API_KEY из .env файла
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

// Подключаемся к MongoDB с использованием Mongoose
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected with Mongoose"))
  .catch((err) => console.error("MongoDB connection error:", err));

const anthropic = new Anthropic({
  apiKey: anthropicApiKey, // Используем API-ключ из .env файла
});

// start the cron job to delete expired poems
poemsCollectionDeleteCronJob.start();

app.post("/api/get-poem", async (req, res) => {
  const { promptInput, poetryChoice } = req.body;
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `You are a poet. Your task is to create a poem in the style of ${poetryChoice}. Generate poetry in the language in which the user provides their prompt. Use the story provided by the user as the main idea and thematic foundation for the poem.

If the user hasn't specified the desired length of the poem, create a medium-length poem (approximately 12-20 lines). Don't limit yourself to a literal retelling of the user's story. Use it as inspiration, but feel free to interpret and expand on the idea.

If you know of a real poet who has written in the chosen style, include a short quote (no more than 4-6 lines) or a complete poem by that poet after your generated poem, with proper attribution.

Present the result in the following format:
1. Generated poem
2. (If applicable) Quote from a real poet with attribution
3. Brief description of the ${poetryChoice} style (2-3 sentences)`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptInput,
            },
          ],
        },
      ],
    });

    // Предполагается, что API возвращает массив блоков, фильтруем и мапим их для извлечения текстового содержимого
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

// Маршрут для сохранения поэм
app.post("/api/save-poems", async (req, res) => {
  const { userName, poems } = req.body;

  if (!userName || !poems || !Array.isArray(poems) || poems.length === 0) {
    return res.status(400).json({ error: "Invalid data provided." });
  }

  try {
    const newPoemEntry = new Poems({
      userName,
      poems: poems.map((poem) => ({
        styleOfPoem: poem.style,
        prompt: poem.prompt,
        poem: poem.text,
      })),
    });

    const savedPoemEntry = await newPoemEntry.save();
    res.status(201).json(savedPoemEntry);
  } catch (error) {
    console.error("Error saving poems:", error);
    res.status(500).json({ error: "Failed to save poems to database." });
  }
});

// Маршрут для отображения поэм пользователя
app.get("/api/poems/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const poemEntry = await Poems.findById(id);
    if (!poemEntry) {
      return res.status(404).send("No poems found for this user.");
    }

    res.render("poems", {
      userName: poemEntry.userName,
      poems: poemEntry.poems,
      apiUrl: process.env.API_URL, // Передача переменной API_URL в шаблон
    });
  } catch (error) {
    console.error("Error fetching poems:", error);
    res.status(500).send("An error occurred while fetching the poems.");
  }
});

// Маршрут для генерации QR-кода
app.get("/api/generate-qr/:id", async (req, res) => {
  const { id } = req.params;
  const url = `${process.env.API_URL}/poems/${id}`;

  try {
    const qrCode = await QRCode.toDataURL(`${url}`);
    res.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code." });
  }
});

app.use("/api/healthcheck", (req, res) => {
  res.status(200).send("Server is running");
});

// This should be the last route, to serve the frontend for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000; // Устанавливаем порт из переменной окружения PORT или 3000 по умолчанию
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
