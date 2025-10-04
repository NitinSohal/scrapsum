const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Summarize the following text in layman terms with examples where helpful. Format your response with "**Summary:**" as a heading followed by the summary in a new paragraph. Keep it concise:\n\n${text}`
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
