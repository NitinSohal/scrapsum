const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/summarize', async (req, res) => {
  const { text, regenerate = false } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const prompt = regenerate
    ? `You didn't understand this part. Explain it in much more detail with multiple real-world examples, step-by-step explanations, and analogies. Make it crystal clear for someone who has no background knowledge. Use simple language and break down complex concepts:\n\n${text}`
    : `Summarize the following text in simple, easy-to-understand language. Structure your response as:

**Summary:** [Main topic/concept being discussed]

**Key Points:**
- Point 1 with brief explanation
- Point 2 with brief explanation
- Point 3 with brief explanation

**Real-World Example:** [Provide a relatable example that illustrates the concept]

**In Simple Terms:** [Explain like you're talking to a beginner]

Text to summarize:\n\n${text}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: regenerate ? 800 : 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    res.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Summarizer backend running on http://localhost:${PORT}`);
});
