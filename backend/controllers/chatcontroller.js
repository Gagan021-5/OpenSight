import axios from 'axios';

export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    const { ageGroup, condition, games, language } = context || {};
    
    // Construct a prompt that guides the AI
    // For Flan-T5 or similar instruction models
    const systemPrompt = `You are a friendly vision therapy assistant named OpenSight AI.
User Context:
- Age Group: ${ageGroup === 'kid' ? 'Child (keep it fun, simple, use emojis)' : 'Adult (professional, encouraging, concise)'}
- Vision Condition: ${condition || 'General vision therapy'}
- Recommended Games: ${games?.join(', ') || 'None specific'}
- Language: ${language === 'hi' ? 'Hindi' : 'English'}

Your goal is to encourage the user, explain exercises simply if asked, and motivate them to play their therapy games.
Reply in the user's language (${language === 'hi' ? 'Hindi' : 'English'}).
Keep responses short (under 3 sentences).

User: ${message}
Assistant:`;

    // Using google/flan-t5-large for better instruction following on free tier
    // Or mistralai/Mistral-7B-Instruct-v0.2 if available
    const model = 'google/flan-t5-large'; 
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: systemPrompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // HF API response format for text-generation/seq2seq
    // [{ generated_text: "..." }]
    let reply = '';
    if (Array.isArray(response.data)) {
        reply = response.data[0]?.generated_text || '';
    } else {
        reply = response.data?.generated_text || '';
    }

    // Clean up
    if (!reply) {
        reply = language === 'hi' ? "क्षमा करें, मैं अभी उत्तर नहीं दे सकता।" : "I'm sorry, I can't answer right now.";
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error.response?.data || error.message);
    // Fallback response if API fails
    const fallback = req.body.context?.language === 'hi' 
        ? "नमस्ते! अभी सर्वर व्यस्त है, कृपया थोड़ी देर बाद प्रयास करें।" 
        : "Hi! I'm having trouble connecting to my brain right now. Please try again later.";
    res.json({ reply: fallback });
  }
};
