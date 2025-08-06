import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "2kb" }));

const PORT = process.env.PORT || 8080;

const debates = {};

app.post("/debate/start", (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Konu gerekli" });

  const debateId = uuidv4();
  debates[debateId] = {
    topic,
    history: [],
    turn: 0,
  };

  res.json({ debateId, message: "Münazara başladı", topic });
});

app.post("/debate/next", async (req, res) => {
  const { debateId, userArgument } = req.body;

  if (!debateId || !userArgument)
    return res.status(400).json({ error: "debateId ve userArgument gerekli" });

  const debate = debates[debateId];
  if (!debate) return res.status(404).json({ error: "Münazara bulunamadı" });

  debate.turn++;
  debate.history.push({ speaker: "Kullanıcı", text: userArgument });

  const prompt = `
Konu: ${debate.topic}
Geçmiş konuşmalar:
${debate.history.map((m) => `${m.speaker}: ${m.text}`).join("\n")}
Kullanıcının son argümanına karşı çıkan, mantıklı ve ciddi bir karşı argüman üret. 
100 kelimeyi geçme. Türkçe yaz.
`;

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

    debate.history.push({ speaker: "Model", text: responseText });

    res.json({ counterArgument: responseText, turn: debate.turn });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API hatası" });
  }
});

app.post("/debate/end", async (req, res) => {
  const { debateId } = req.body;
  const debate = debates[debateId];
  if (!debate) {
    return res.status(404).json({ error: "Münazara bulunamadı" });
  }

  const prompt = `
Konu: ${debate.topic}
Tüm konuşma geçmişi:
${debate.history.map((m) => `${m.speaker}: ${m.text}`).join("\n")}

Görev:
Aşağıdaki JSON formatında yanıt ver:
{
  "summary": "Tartışmanın genel özeti (maksimum 150 kelime)",
  "strengths": ["Kullanıcının güçlü argüman noktaları listesi"],
  "weaknesses": ["Kullanıcının eksik veya zayıf argüman noktaları listesi"]
}
Kesinlikle başına veya sonuna \`\`\`json, \`\`\` gibi Markdown kod bloğu ekleme.
Hiçbir ek açıklama veya metin yazma. Sadece geçerli JSON döndür. Türkçe yanıt ver.
`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    let rawText =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("Gemini raw output:", rawText);

    rawText = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse hatası:", parseError);
      return res.status(500).json({
        error: "Geçersiz JSON formatı",
        raw: rawText,
      });
    }

    delete debates[debateId];

    res.json({
      ...parsedJson,
      message: "Münazara sonlandırıldı ve analiz yapıldı.",
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API hatası" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
