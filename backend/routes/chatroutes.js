import express from "express";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core"; 

const chatroute = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY }); 

const APP_CONTEXT = `
You are Dr. Sight, the AI assistant for "OpenSight" (a Vision Therapy app).
- CORE FEATURE: Uses "Dichoptic Training" (Red/Blue glasses) to treat Amblyopia/Lazy Eye.
- GAMES: 
  * Snake (Amblyopia)
  * Racing (Reaction Time) 
  * Tetris (Spatial Fusion)
  * Zooming Target (Convergence)
- PRICING: 100% Free & Open Source.
`;

chatroute.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    
    const router = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Classify this query. If it requires external medical info, news, or facts NOT about the OpenSight app games, output 'SEARCH'. If it is about the app's games, features, or greetings, output 'CHAT'."
        },
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 10
    });

    const intent = router.choices[0]?.message?.content?.trim() || "CHAT";
    let contextData = APP_CONTEXT;

    if (intent.includes("SEARCH")) {
      console.log("🔍 Searching web for:", message);
      
      const searchResult = await tvly.search(message, {
        search_depth: "basic",
        max_results: 3,
        include_answer: true 
      });

      contextData += `\n\n🔎 REAL-TIME WEB CONTEXT:\n${JSON.stringify(searchResult.results)}\n\n(Use this info to answer. If the search results answer the question, paraphrase them.)`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${contextData}\n\nINSTRUCTIONS: Be friendly (Dr. Sight persona). Keep answers under 3 sentences. If it's a serious medical condition, advise seeing a real doctor.`
        },
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0]?.message?.content });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "Dr. Sight is having trouble connecting to the network. Please try again! 🩺" });
  }
});

export default chatroute;