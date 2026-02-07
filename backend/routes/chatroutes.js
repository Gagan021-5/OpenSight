import express from "express";
import Groq from "groq-sdk";
import { search } from "duck-duck-scrape"; // 🌐 The "Real-Time" Tool
import "dotenv/config";

const chatroute = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🧠 STATIC CONTEXT (Your App Info - still needed so it knows who it is)
const APP_CONTEXT = `
You are Dr. Sight, the AI assistant for "OpenSight".
- OpenSight is a free, browser-based vision therapy app using red/blue glasses.
- Games: Snake (Amblyopia), Racing (Reaction), Tetris (Spatial), Zooming (Convergence).
`;

chatroute.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    // 🕵️ PHASE 1: DECIDE IF WE NEED REAL-TIME INFO
    // We ask Groq: "Does this question need a web search?"
    const intentCheck = await groq.chat.completions.create({
      messages: [
        {
            role: "system", 
            content: "You are a classifier. If the user asks about current events, specific medical research, news, or something outside of OpenSight's basic game features, output 'SEARCH'. Otherwise, output 'CHAT'." 
        },
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 10
    });

    const intent = intentCheck.choices[0]?.message?.content?.trim() || "CHAT";
    let searchContext = "";

    // 🌐 PHASE 2: PERFORM REAL-TIME SEARCH (If needed)
    if (intent.includes("SEARCH")) {
      console.log("🕵️ Searching the web for:", message);
      const searchResults = await search(message, { safeSearch: 1 });
      
      // We take the top 3 results to feed the AI
      const topResults = searchResults.results.slice(0, 3).map(r => 
        `- Title: ${r.title}\n  Snippet: ${r.description}`
      ).join("\n");

      searchContext = `\n\n🔍 REAL-TIME WEB SEARCH RESULTS:\n${topResults}\n(Use this info to answer the user's question accurately.)`;
    }

    // 💬 PHASE 3: GENERATE FINAL ANSWER
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${APP_CONTEXT} ${searchContext} \n\nInstructions: Answer the user. If you used the search results, cite them naturally.`
        },
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    res.json({ reply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting to the real-time network. Please try again! 🌐" });
  }
});

export default chatroute;