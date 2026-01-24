import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message (string) is required' });
    }
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN is not configured on the server' });
    }

    const systemPrompt = 'You are Dr. Sight, a friendly vision therapy assistant. Answer brief questions about eye exercises, amblyopia, and eye health in a supporting tone.';
    const payload = {
      inputs: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
      },
    };

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const generated = response.data?.[0]?.generated_text || '';
    const assistantReply = generated.includes('Assistant:') ? generated.split('Assistant:').pop().trim() : generated.trim();

    res.json({ reply: assistantReply || 'Sorry, I could not generate a response.' });
  } catch (error) {
    console.error('Chat route error:', error.response?.data || error.message);
    res.status(502).json({ error: 'Failed to fetch response from AI' });
  }
});

export default router;
