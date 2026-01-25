import express from "express";
import Groq from "groq-sdk";
import "dotenv/config";

const chatroute = express.Router();

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

chatroute.post("/", async (req, res) => {
  const { message } = req.body;
  
 
  
  const lowerMsg = message?.toLowerCase() || "";
  let fallbackReply = null; // We start as null to see if we match anything

  // 1. Game Specific Explanations 🎮
  if (lowerMsg.includes("snake")) {
    fallbackReply = "🐍 **Dichoptic Snake:** This game separates the snake and food between your eyes. You must fuse the images to play, which trains binocular coordination.";
  } else if (lowerMsg.includes("racing") || lowerMsg.includes("car")) {
    fallbackReply = "🏎️ **Dichoptic Racing:** A high-speed game where obstacles and cars are split between eyes. It improves reaction time and breaks suppression.";
  } else if (lowerMsg.includes("tetris") || lowerMsg.includes("block")) {
    fallbackReply = "🧩 **Therapy Tetris:** Falling blocks are split between your eyes. This helps with spatial planning and balancing vision in both eyes.";
  } else if (lowerMsg.includes("convergence") || lowerMsg.includes("zoom")) {
    fallbackReply = "🎯 **Zooming Target:** A target moves in and out to specifically strengthen your convergence (crossing) and divergence (uncrossing) skills.";
  } else if (lowerMsg.includes("whack") || lowerMsg.includes("mole")) {
    fallbackReply = "🔨 **Whack-A-Target:** Targets appear randomly to train 'saccades'—the fast eye movements you need for reading and scanning.";
  } else if (lowerMsg.includes("lighthouse") || lowerMsg.includes("neglect")) {
    fallbackReply = "💡 **Lighthouse:** Designed for Visual Neglect. It forces you to scan into your 'blind' side to find the light.";
  } else if (lowerMsg.includes("sea") || lowerMsg.includes("fish")) {
    fallbackReply = "🌊 **Dichoptic Sea:** A relaxing game for contrast sensitivity. You must find faint objects in a deep blue background.";
  }
  
  // 2. General Game Question
  else if (lowerMsg.includes("game") || lowerMsg.includes("play") || lowerMsg.includes("activities")) {
    fallbackReply = "We have 7 specialized games: Snake 🐍, Racing 🏎️, Deep Sea 🌊, Convergence 🎯, Tetris 🧩, Whack-A-Target 🔨, and Lighthouse 💡. Which one interests you?";
  }
  
  // 3. Condition Explanations 👁️
  else if (lowerMsg.includes("lazy") || lowerMsg.includes("amblyopia")) {
    fallbackReply = "Amblyopia (lazy eye) is treated by forcing the weaker eye to work. OpenSight uses **Dichoptic Training**—showing different images to each eye—to re-wire the brain.";
  }
  
  // 4. Greetings & Pricing
  else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    fallbackReply = "Hello! I am Dr. Sight. Ask me about our games like 'Snake' or 'Racing', or tell me about your vision goals!";
  } else if (lowerMsg.includes("cost") || lowerMsg.includes("free") || lowerMsg.includes("price")) {
    fallbackReply = "OpenSight is 100% free and open-source! 💖 We believe vision therapy should be accessible to everyone.";
  }

  // If we found a local match, return it immediately (Fastest!)
  if (fallbackReply) {
    return res.json({ reply: fallbackReply });
  }

  // ============================================================
  // 🚀 ATTEMPT REAL AI CALL (Groq Llama 3.1)
  // ============================================================
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Dr. Sight, a friendly vision therapy assistant. Keep answers short (under 2 sentences) and encouraging."
        },
        {
          role: "user",
          content: message
        }
      ],
      // 🔴 UPDATED MODEL NAME HERE (The Fix)
      model: "llama-3.1-8b-instant", 
      temperature: 0.7,
      max_tokens: 150,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting, but try asking about 'Snake' or 'Racing'!";
    res.json({ reply });

  } catch (error) {
    console.error("Groq API Error:", error.message);
    // Final Safety Net
    res.json({ reply: "I'm having a little trouble connecting to the cloud, but you can ask me about 'games' or 'amblyopia' and I can still help!" });
  }
});

export default chatroute;