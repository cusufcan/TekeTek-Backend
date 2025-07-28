import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post("/api/debate", async (req, res) => {
  const { topic, userArgument } = req.body;

  const prompt = `Konu: ${topic}\nKullanıcının argümanı: "${userArgument}"\nBu argümana karşı çıkan, mantıklı ve ciddi bir karşı argüman üret. 100 kelimeyi geçme.`;

  try {
    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const responseText =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Cevap alınamadı.";
    res.json({ counterArgument: responseText });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API hatası" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
