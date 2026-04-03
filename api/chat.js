export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
 
  try {
    const { system, messages } = req.body;
 
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
 
    const body = {
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents: geminiMessages,
      generationConfig: { maxOutputTokens: 1000 }
    };
 
    const apiKey = 'AIzaSyDJg67kuTTag9dqFbLkcAHQaeFRR3beaW8';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
 
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
 
    const data = await response.json();
 
    if (data.error) {
      res.status(400).json({ error: { message: data.error.message } });
      return;
    }
 
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({
      content: [{ type: 'text', text }]
    });
 
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}
 
